"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TextFieldWithButton } from "@/components/common/TextFieldWithButton";
import { ToastFailed } from "@/components/common/ToastFailed";
import { OverlayJoinCard } from "@/components/dashboard/OverlayJoinCard";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";

export interface JoinArenaCardProps {
  rankName: string;
  rankScore: number;
  rankImageUrl: string;
}

export function JoinArenaCard({
  rankName,
  rankScore,
  rankImageUrl,
}: JoinArenaCardProps) {
  const [roomToJoin, setRoomToJoin] = useState<GameRoomWithPlayerCount | null>(
    null
  );
  const [toastData, setToastData] = useState<{ isOpen: boolean; code: string }>({
    isOpen: false,
    code: ""
  });

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
        setToastData({ isOpen: true, code });
      }
    } catch (error) {
      console.error("Error joining room:", error);
      setToastData({ isOpen: true, code });
    }
  };

  return (
    <>
      <div className="relative w-full h-full bg-[#FDE4B0] border-[3px] border-[#FDA928] rounded-3xl p-5 md:p-8 flex flex-col items-center justify-between text-center overflow-hidden min-h-[220px] md:min-h-[240px] shadow-[0_4px_20px_rgba(253,169,40,0.1)]">
        <div className="flex flex-col items-center z-10 w-full mb-2">
          <h2 className="text-[#555555] text-2xl md:text-3xl font-extrabold mb-2 ">
            Gabung ke Arena
          </h2>

          {/* Badge image */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 mb-2 z-10 flex items-center justify-center">
            <Image
              src={rankImageUrl}
              alt={`${rankName} Badge`}
              fill
              className="object-contain z-10 drop-shadow-lg"
              sizes="(max-width: 768px) 150px, 200px"
              priority
            />
          </div>

          {/* Rank indicator */}
          <div className="relative text-white py-2 min-w-[200px] font-bold flex items-center justify-center gap-4 z-10 w-max mb-2">
            <Image
              src="/dashboard/trophy-badge.webp"
              alt="Rank Badge Background"
              fill
              className="object-fill absolute inset-0 -z-10 drop-shadow-sm scale-110"
              sizes="(max-width: 768px) 300px, 350px"
              priority
            />
            <span className="uppercase text-md tracking-wide text-[#FFDFB3] drop-shadow-sm font-semibold">
              {rankName}
            </span>
            <span className="text-white/80 text-sm">|</span>
            <div className="flex items-center gap-1.5 text-[#FFD700]">
              <div className="relative mb-0.5 h-4 w-4">
                <Image
                  src="/icons/trophy-color.svg"
                  alt="Trophy"
                  fill
                  sizes="16px"
                  className="object-contain"
                />
              </div>
              <span className="leading-none text-md drop-shadow-sm font-bold tracking-wide mb-0.5">
                {rankScore}
              </span>
            </div>
          </div>
        </div>

        {/* Input & Button group */}
        <TextFieldWithButton
          name="arenaCode"
          placeholder="Masukkan Kode Arena"
          buttonContent="Gabung"
          wrapperClassName="z-10 w-full"
          onSubmit={handleJoinByCode}
        />
      </div>

      {roomToJoin && (
        <OverlayJoinCard
          room={roomToJoin}
          onClose={() => setRoomToJoin(null)}
        />
      )}

      <ToastFailed
        isOpen={toastData.isOpen}
        code={toastData.code}
        onClose={() => setToastData((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}