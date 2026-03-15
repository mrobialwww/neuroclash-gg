"use client";

import React from "react";
import Image from "next/image";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { cn } from "@/lib/utils";
import { User } from "@/app/types/User";

interface Player extends User {
  health: number;
  maxHealth: number;
}

interface PlayerCardProps {
  player: Player;
  isMe?: boolean;
  className?: string;
}

export const PlayerCard = ({ player, isMe = false, className }: PlayerCardProps) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center p-3 md:p-4 rounded-xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 w-full max-w-[200] md:max-w-[240px] shadow-2xl",
        className
      )}
    >
      {/* Avatar Section */}
      <div
        className="relative shrink-0 rounded-full border-3 border-white shadow-lg overflow-hidden flex items-center justify-center mb-3 md:mb-4"
        style={{
          backgroundColor: getCharacterBgColor(player.character),
          width: 80,
          height: 80,
        }}
      >
        <div className="absolute inset-0 md:w-[110px] md:h-[110px]" />

        <div className="relative w-[85%] h-[85%] flex items-center justify-center mt-1">
          <Image
            src={player.image}
            alt={player.character}
            fill
            sizes="(max-width: 768px) 80px, 100px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* HP Bar Section */}
      <div className="relative h-3 md:h-4 w-full bg-[#1A1B23] rounded-full border border-white/20 overflow-hidden mb-2 shadow-inner">
        <div
          className="h-full bg-[#22C55E] shadow-[0_0_10px_rgba(94,211,106,0.5)] flex items-center justify-center"
          style={{ width: `${healthPercentage}%` }}
        />

        {/* HP Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white font-semibold text-[10px] md:text-xs">
            HP: {player.health}/{player.maxHealth}
          </span>
        </div>
      </div>

      {/* Name Section */}
      <div className="text-center space-y-0">
        <h3 className="text-white font-semibold text-md md:text-lg tracking-tight truncate max-w-[140px] md:max-w-[180px]">
          {player.name}
        </h3>
        {isMe && (
          <p className="text-white font-regular text-xs md:text-sm">
            (Kamu)
          </p>
        )}
      </div>
    </div>
  );
};