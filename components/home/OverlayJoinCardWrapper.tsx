"use client";

import { useState } from "react";
import { TextFieldWithButton } from "@/components/common/TextFieldWithButton";
import { OverlayJoinCard } from "@/components/dashboard/OverlayJoinCard";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";

export function OverlayJoinCardWrapper() {
  const [roomToJoin, setRoomToJoin] = useState<GameRoomWithPlayerCount | null>(
    null
  );

  const handleJoinByCode = async (code: string) => {
    if (!code) return;

    try {
      const resp = await fetch(`/api/game-rooms/code/${code}`);
      const result = await resp.json();

      // API contract: { data: GameRoom[] } — ambil elemen pertama
      const rooms = result.data ?? [];
      if (resp.ok && rooms.length > 0) {
        setRoomToJoin({ ...rooms[0], player_count: 0 });
      } else {
        alert("Room with that code not found!");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Something went wrong, please try again.");
    }
  };

  return (
    <>
      <TextFieldWithButton
        placeholder="Masukkan Kode Arena"
        buttonContent="Gabung"
        wrapperClassName="w-[90%] sm:w-[80%] md:w-full md:max-w-xl"
        className="text-lg md:text-xl"
        onSubmit={handleJoinByCode}
      />

      {roomToJoin && (
        <OverlayJoinCard
          room={roomToJoin}
          onClose={() => setRoomToJoin(null)}
        />
      )}
    </>
  );
}
