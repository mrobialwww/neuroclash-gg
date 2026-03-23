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
    <div>
      <div className="relative w-full h-full bg-[#140B29] bg-[radial-gradient(circle_at_center,rgba(253,169,40,0.8)_0%,rgba(253,169,40,0.3)_30%,transparent_70%)] border border-white rounded-3xl p-5 md:p-8 flex flex-col items-center justify-between text-center overflow-hidden min-h-[220px] md:min-h-[240px] shadow-[0_4px_20px_rgba(253,169,40,0.1)]">
        <div className="flex flex-col items-center z-10 w-full mb-2">
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">
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
          <div className="relative text-white font-bold flex items-center justify-center z-10 mx-auto w-full max-w-[320px] mb-2 px-4 overflow-hidden box-border">
            {/* Gambar Latar */}
            <div className="relative w-full h-auto flex items-center justify-center">
              <Image
                src="/dashboard/trophy-badge.webp"
                alt="Rank Badge Background"
                width={320}
                height={60}
                className="object-contain -z-10 drop-shadow-sm block w-full h-full"
                sizes="(max-width: 320px) 100vw, 320px"
                priority
              />

              {/* Konten Teks */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-4 px-3 sm:px-6">
                <span className="uppercase text-xs sm:text-md tracking-wide text-[#FFDFB3] drop-shadow-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  {rankName}
                </span>
                <span className="text-white/80 text-xs sm:text-sm">|</span>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[#FFD700]">
                  <div className="relative mb-0.5 h-3 w-3 sm:h-4 sm:w-4 shrink-0">
                    <Image
                      src="/icons/trophy-color.svg"
                      alt="Trophy"
                      fill
                      sizes="16px"
                      className="object-contain"
                    />
                  </div>
                  <span className="leading-none text-xs sm:text-md drop-shadow-sm font-bold tracking-wide mb-0.5 whitespace-nowrap">
                    {rankScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input & Button group */}
        <TextFieldWithButton
          name="arenaCode"
          placeholder="Masukkan Kode Arena"
          buttonContent="Gabung"
          wrapperClassName="z-10 w-full max-w-sm"
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
    </div>
  );
}