"use client";

import React from "react";
import Image from "next/image";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { cn } from "@/lib/utils";
import { MockUser as User } from "@/types/MockUser";

interface Player extends User {
  health: number;
  maxHealth: number;
}

interface PlayerCardProps {
  player: Player;
  isMe?: boolean;
  hideHealthBar?: boolean;
  className?: string;
}

export const PlayerCard = ({ player, isMe = false, hideHealthBar = false, className }: PlayerCardProps) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;

  return (
    <div
      className={cn(
        // Mobile: Horizontal layout | Desktop (lg): Vertical Card layout
        "relative flex lg:flex-col items-center gap-3 lg:gap-0 lg:p-4 rounded-xl lg:bg-[#D9D9D9]/20 backdrop-blur-md lg:border-2 border-white/10 w-full lg:max-w-[240px] shadow-2xl",
        isMe ? "flex-row" : "flex-row-reverse lg:flex-col",
        className
      )}
    >
      {/* Avatar Section */}
      <div
        className={cn(
          "relative shrink-0 rounded-full border-2 lg:border-3 border-white shadow-lg overflow-hidden flex items-center justify-center transition-all duration-300",
          "w-12 h-12 md:w-14 md:h-14 lg:w-20 lg:h-20 lg:mb-4"
        )}
        style={{
          backgroundColor: getCharacterBgColor(player.character),
        }}
      >
        <div className="relative w-[85%] h-[85%] flex items-center justify-center mt-1">
          <Image
            src={player.image}
            alt={player.character}
            fill
            sizes="(max-width: 768px) 56px, 80px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Info Section (Name, Bar, Role) */}
      <div className={cn(
        "flex-1 lg:w-full flex flex-col",
        isMe ? "items-start lg:items-center" : "items-end lg:items-center"
      )}>
        {/* Name */}
        <h3 className={cn(
          "text-white font-semibold text-xs md:text-sm lg:text-lg tracking-tight truncate max-w-[120px] md:max-w-[150px] lg:max-w-[180px]",
          !isMe && "text-right lg:text-center"
        )}>
          {player.name}
        </h3>

        {/* HP Bar Section - Hidden in Solo mode for opponent */}
        {!hideHealthBar && (
          <div className="relative h-3 md:h-4 w-full bg-[#1A1B23] rounded-full border border-white/20 overflow-hidden my-1 lg:mb-2 shadow-inner">
            <div
              className="h-full bg-[#22C55E] shadow-[0_0_10px_rgba(94,211,106,0.5)]"
              style={{ width: `${healthPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white font-semibold text-[8px] md:text-[10px] lg:text-xs">
                HP: {player.health}/{player.maxHealth}
              </span>
            </div>
          </div>
        )}

        {/* Role Label */}
        <p className="text-white font-medium text-[10px] md:text-xs lg:text-sm">
          {isMe ? "(Kamu)" : "(Lawan)"}
        </p>
      </div>
    </div>
  );
};