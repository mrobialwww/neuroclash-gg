"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LobbyRoom } from "@/components/quiz/Lobby";
import { useQuizLobbyStore } from "@/store/useQuizLobbyStore";
import { quizRepository } from "@/repository/quizRepository";
import { createClient } from "@/lib/supabase/client";

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

    console.log(
      `[QuizLobbyPage] Calling subscribeToPresence for roomId: ${room_id}, userId: ${currentUser.id}`
    );
    subscribeToPresence(room_id);

    // Browser closure tracking backup (Beacon)
    const handleBeforeUnload = () => {
      console.log(`[QuizLobbyPage] Before unload - cleaning up user game`);
      const parts = useQuizLobbyStore.getState().participants;
      const me = parts.find((p) => p.id === currentUser.id);
      if (me?.userGameId) {
        // Beacon works even when tab is closed
        const url = `/api/user-game/leave/${me.userGameId}`;
        console.log(`[QuizLobbyPage] Sending beacon to: ${url}`);
        navigator.sendBeacon(url);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      console.log(
        `[QuizLobbyPage] Unmounting - calling unsubscribeFromPresence`
      );
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsubscribeFromPresence();
    };
  }, [
    room_id,
    currentUser?.id,
    isLoading,
    subscribeToPresence,
    unsubscribeFromPresence,
  ]);

  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      if (currentUser?.id) {
        // Fetch raw rows directly from DB to catch ALL duplicate ghost records
        const participantRows = await quizRepository.fetchParticipants(room_id);
        const userRows = participantRows.filter(
          (p: any) => p.user_id === currentUser.id
        );

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

  const handleStart = async () => {
    if (!roomData) return;
    setIsStarting(true);

    try {
      // 1. Call API untuk start match: insert game_players, generate schedule, update status
      const res = await fetch("/api/match/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_room_id: room_id }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Gagal memulai pertandingan");
      }

      // // 2. Redirect ke halaman game
      router.push(`/game/${room_id}?code=${roomData.room_code}`);

      // ====== Testinggg starbox ygy jgn dihapus
      // router.push(`/starbox?roomId=${room_id}&code=${roomData.room_code}&nextRound=1`);
    } catch (err) {
      console.error("Gagal memulai pertandingan:", err);
      alert(err instanceof Error ? err.message : "Gagal memulai pertandingan");
      setIsStarting(false);
    }
  };

  // FOR TESTING — remove in production
  const handleStartStarbox = async () => {
    if (!roomData) return;
    setIsStarting(true);

    try {
      // 1. Broadcast ke semua player di lobby agar redirect ke starbox
      const supabase = createClient();
      const lobbyChannel = supabase.channel(`lobby:${room_id}`);
      await lobbyChannel.subscribe();
      await lobbyChannel.send({
        type: "broadcast",
        event: "starbox_redirect",
        payload: { roomId: room_id, code: roomData.room_code },
      });
      supabase.removeChannel(lobbyChannel);

      // 2. Call API untuk start match (sama seperti handleStart)
      const res = await fetch("/api/match/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_room_id: room_id }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Gagal memulai pertandingan");
      }

      // 3. Redirect host langsung ke starbox
      router.push(`/starbox?roomId=${room_id}&code=${roomData.room_code}&nextRound=1`);
    } catch (err) {
      console.error("Gagal memulai starbox test:", err);
      alert(err instanceof Error ? err.message : "Gagal memulai starbox test");
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#256AF4] border-t-transparent" />
        <p className="animate-pulse text-lg font-semibold text-white">
          Memuat Lobby...
        </p>
      </main>
    );
  }

  if (error || !roomData) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold text-red-500">
          Error: {error || "Gagal memuat room"}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md bg-white/20 px-6 py-2 font-bold text-white"
        >
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
        onStartStarbox={handleStartStarbox} // FOR TESTING — remove in production
        isLoading={isStarting}
        isLeaving={isLeaving}
        onLeave={handleLeave}
      />
    </div>
  );
}
