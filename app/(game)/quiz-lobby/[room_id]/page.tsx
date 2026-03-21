"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LobbyRoom } from "@/components/quiz/Lobby";
import { useQuizLobbyStore } from "@/store/useQuizLobbyStore";
import { quizRepository } from "@/repository/quizRepository";

export default function QuizLobbyPage() {
  const router = useRouter();
  const { room_id } = useParams<{ room_id: string }>();

  const {
    roomData,
    participants,
    isLoading,
    isSolo,
    isHost,
    error,
    currentUser,
    loadLobbyData,
    setParticipants,
    subscribeToPresence,
    unsubscribeFromPresence,
  } = useQuizLobbyStore();

  const [isStarting, setIsStarting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (room_id) {
      loadLobbyData(room_id);
    }
  }, [room_id, loadLobbyData]);

  // Handle presence & migration via store (Separation of Concerns)
  useEffect(() => {
    if (!room_id || !currentUser?.id || isLoading) return;

    subscribeToPresence(room_id);

    // Browser closure tracking backup (Beacon)
    const handleBeforeUnload = () => {
      const parts = useQuizLobbyStore.getState().participants;
      const me = parts.find((p) => p.id === currentUser.id);
      if (me?.userGameId) {
        // Beacon works even when tab is closed
        const url = `/api/user-game/leave/${me.userGameId}`;
        navigator.sendBeacon(url);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsubscribeFromPresence();
    };
  }, [room_id, currentUser?.id, isLoading, subscribeToPresence, unsubscribeFromPresence]);

  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      if (currentUser?.id) {
        // Fetch raw rows directly from DB to catch ALL duplicate ghost records
        const participantRows = await quizRepository.fetchParticipants(room_id);
        const userRows = participantRows.filter((p: any) => p.user_id === currentUser.id);
        
        // Delete all records belonging to this user in this room
        for (const row of userRows) {
          if (row.user_game_id && row.user_game_id !== "undefined") {
            await quizRepository.deleteLeaveRoom(row.user_game_id as string);
          }
        }
      }
    } finally {
      // Regardless, redirect
      router.push("/dashboard");
    }
  };

  const handleStart = () => {
    if (!roomData) return;
    setIsStarting(true);
    // Push map info, maybe fetch the ugid back
    router.push(`/game/${room_id}?code=${roomData.room_code}`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#256AF4] border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-semibold animate-pulse">Memuat Lobby...</p>
      </main>
    );
  }

  if (error || !roomData) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg font-bold">Error: {error || "Gagal memuat room"}</p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-white/20 rounded-md text-white font-bold">
          Kembali
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <LobbyRoom
        roomCode={roomData.room_code}
        roomTitle={roomData.title || roomData.topic_material}
        totalSlots={roomData.max_player}
        hostId={roomData.user_id}
        players={participants}
        currentUserData={currentUser}
        isSolo={isSolo}
        isHost={isHost}
        onStart={handleStart}
        isLoading={isStarting}
        isLeaving={isLeaving}
        onLeave={handleLeave}
      />
    </div>
  );
}
