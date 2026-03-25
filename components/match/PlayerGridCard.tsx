"use client";

import React from "react";
import Image from "next/image";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { cn } from "@/lib/utils";
import { Player } from "@/lib/constants/players";

interface PlayerGridCardProps {
  player: Player;
  className?: string;
  hideHealthBar?: boolean;
  highlight?: "self" | "host";
  lobbyMode?: boolean;
}

export const PlayerGridCard = ({
  player,
  className,
  hideHealthBar = false,
  highlight,
  lobbyMode = false,
}: PlayerGridCardProps) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;

  // Border avatar selalu putih
  const borderColor = "border-white/80";

  const glowEffect =
    highlight === "self"
      ? "shadow-[0_0_15px_rgba(37,106,244,0.6)]"
      : highlight === "host"
        ? "shadow-[0_0_15px_rgba(255,0,9,0.6)]"
        : "shadow-lg";

  // bg card: biru 256AF4/50 untuk Kamu, merah FF0009/50 untuk Host
  const cardBgColor =
    highlight === "self"
      ? "bg-[#256AF4]/50"
      : highlight === "host"
        ? "bg-[#FF0009]/50"
        : "bg-transparent";

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 transition-all duration-300 rounded-xl",
      lobbyMode
        ? "w-[88px] sm:w-[100px] md:w-[110px] py-3 px-1"
        : "w-full max-w-[95px] md:max-w-[120px] py-3 px-1",
      cardBgColor,
      className
    )}>
      {/* Avatar Section */}
      <div
        className={cn(
          "relative shrink-0 rounded-full border-4 overflow-hidden flex items-center justify-center transition-all duration-300",
          "w-16 h-16 md:w-20 md:h-20",
          borderColor,
          glowEffect
        )}
        style={{
          backgroundColor: getCharacterBgColor(player.character),
        }}
      >
        <div className="relative w-[75%] h-[75%] flex items-center justify-center">
          <Image
            src={player.image || "/default/Slime.webp"}
            alt={player.character || "Player"}
            fill
            sizes="(max-width: 768px) 64px, 80px"
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col items-center w-full gap-1">
        {/* HP Bar - Only show if not hidden */}
        {!hideHealthBar && (
          <div className="relative h-2 md:h-3 w-full bg-[#1A1B23] rounded-full border border-white/10 overflow-hidden shadow-inner group">
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
        )}

        {/* Name & Badge */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-bold text-[11px] md:text-sm tracking-tight truncate w-full text-center text-white">
            {player.name}
          </h3>

          {highlight && (
            <span className="text-[9px] md:text-[10px] text-white/90 font-medium tracking-wide mt-0.5">
              ({highlight === "self" ? "Kamu" : "Host"})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
