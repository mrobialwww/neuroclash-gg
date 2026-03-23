"use client";

import React, { useState } from "react";
import { Users, Flag } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { OverlayJoinCard } from "@/components/dashboard/OverlayJoinCard";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";

interface GameRoomCardProps {
  room: GameRoomWithPlayerCount;
  onClick?: () => void;
  className?: string;
}

const FALLBACK_IMAGE = "/quiz-category/biologi.webp";

function resolveImage(src: string | null | undefined, error: boolean): string {
  return error || !src ? FALLBACK_IMAGE : src;
}

export function GameRoomCard({ room, onClick, className }: GameRoomCardProps) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const progress = Math.min((room.player_count / room.max_player) * 100, 100);
  const displayTitle = room.title || room.category;

  const handleClick = () => {
    setOpen(true);
    onClick?.();
  };

  return (
    <>
      <div
        className={cn(
          "group flex w-full cursor-pointer flex-col items-center rounded-2xl border border-gray-50 bg-white p-5 pb-6 shadow-[0_4px_25px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_35px_rgba(0,0,0,0.08)]",
          className,
        )}
        onClick={handleClick}
      >
        {/* Center Icon Container */}
        <div className="relative mb-2 mt-1 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105">
          <Image
            src={resolveImage(room.image_url, imgError)}
            alt={displayTitle}
            fill
            sizes="128px"
            className="object-contain"
            priority
            onError={() => setImgError(true)}
          />
        </div>

        {/* Title */}
        <h3 className="min-h-10 mb-2 flex items-center justify-center px-1 text-center text-xl font-extrabold leading-tight text-[#555555]">
          {displayTitle}
        </h3>

        {/* Progress Bar */}
        <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#256AF4] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Footer Stats Row */}
        <div className="mt-auto flex w-full items-center justify-end">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <Users size={22} className="mb-0.5 text-[#256AF4] opacity-80" />
              <span className="text-sm font-extrabold text-[#555555]">
                {room.player_count}/{room.max_player}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Flag size={22} className="mb-0.5 text-[#256AF4] opacity-80" />
              <span className="text-sm font-extrabold text-[#555555]">
                {room.total_question}
              </span>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <OverlayJoinCard room={room} onClose={() => setOpen(false)} />
      )}
    </>
  );
}