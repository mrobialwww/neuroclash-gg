"use client";

import React from "react";
import Image from "next/image";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { cn } from "@/lib/utils";
import { Player } from "@/lib/constants/players";

interface PlayerGridCardProps {
  player: Player;
  className?: string;
}

export const PlayerGridCard = ({ player, className }: PlayerGridCardProps) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;

  return (
    <div className={cn("flex flex-col items-center gap-1 w-full max-w-[80px] md:max-w-[100px]", className)}>
      {/* Avatar Section (Circle like Image 2) */}
      <div
        className={cn(
          "relative shrink-0 rounded-full border-2 border-white/20 shadow-lg overflow-hidden flex items-center justify-center transition-all duration-300",
          "w-12 h-12 md:w-16 md:h-16"
        )}
        style={{
          backgroundColor: getCharacterBgColor(player.character),
        }}
      >
        <div className="relative w-[75%] h-[75%] flex items-center justify-center">
          <Image
            src={player.image}
            alt={player.character}
            fill
            sizes="(max-width: 768px) 48px, 64px"
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* Info Section (Health Bar & Name below) */}
      <div className="flex flex-col items-center w-full">
        {/* HP Bar */}
        <div className="relative h-2 md:h-3 w-full bg-[#1A1B23] rounded-full border border-white/10 overflow-hidden mt-1 shadow-inner group">
          <div
            className="h-full bg-[#22C55E] shadow-[0_0_8px_rgba(94,211,106,0.3)]"
            style={{ width: `${healthPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-100 transition-opacity">
            <span className="text-white font-bold text-[6px] md:text-[8px] tracking-tight uppercase">
              HP:{player.health}/{player.maxHealth}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-white font-semibold text-[10px] md:text-xs tracking-tight truncate w-full text-center mt-0.5">
          {player.name}
        </h3>
      </div>
    </div>
  );
};
