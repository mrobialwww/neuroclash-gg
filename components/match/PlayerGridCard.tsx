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
  highlight?: "self" | "host" | "self-host";
  lobbyMode?: boolean;
  hasPicked?: boolean;
  isActiveTurn?: boolean;
  progress?: number; // 0 to 100
  progressColor?: string;
}

export const PlayerGridCard = ({
  player,
  className,
  hideHealthBar = false,
  highlight,
  lobbyMode = false,
  hasPicked = false,
  isActiveTurn = false,
  progress = 0,
  progressColor = "bg-[#FDBB38]/80",
}: PlayerGridCardProps) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;

  // Border avatar selalu putih
  const borderColor = "border-white/80";

  const glowEffect =
    isActiveTurn
      ? "shadow-[0_0_15px_rgba(255,204,0,0.8)]"
      : highlight === "self" || highlight === "self-host"
        ? "shadow-[0_0_15px_rgba(37,106,244,0.6)]"
        : highlight === "host"
          ? "shadow-[0_0_15px_rgba(255,0,9,0.6)]"
          : "shadow-lg";

  // bg card: biru 256AF4/50 untuk Kamu, merah FF0009/50 untuk Host
  const cardBgColor =
    isActiveTurn
      ? (highlight === "self" || highlight === "self-host") ? "bg-[#D46B1D]/50" : "bg-[#FDBB38]/30"
      : highlight === "self" || highlight === "self-host"
        ? "bg-[#256AF4]/50"
        : highlight === "host"
          ? "bg-[#FF0009]/50"
          : "bg-transparent";

  return (
    <div className={cn(
      "relative flex flex-col items-center gap-2 transition-all duration-300 rounded-xl overflow-hidden shadow-lg",
      lobbyMode
        ? "w-[100px] sm:w-[110px] md:w-[125px] py-3 px-1"
        : "w-full min-w-[100px] md:min-w-[130px] py-3 px-1",
      cardBgColor,
      hasPicked ? "opacity-60 grayscale" : "",
      isActiveTurn ? "scale-105 ring-2 ring-white/50" : "border border-white/10",
      className
    )}>
      {/* Progress Background Layer (Turn Timer) */}
      {isActiveTurn && progress > 0 && (
        <div
          className={cn("absolute left-0 bottom-0 h-full z-0 transition-all duration-100 ease-linear", progressColor)}
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Content wrapper with z-index */}
      <div className="relative z-10 flex flex-col items-center w-full gap-2">
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

          {/* Picked Overlay & Checklist */}
          {hasPicked && (
            <div className="absolute inset-0 bg-[#161616]/70 flex items-center justify-center z-20">
              <Image
                src="/icons/checklist.svg"
                alt="Checked"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10 text-[#5DE2E7]"
              />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col items-center w-full gap-1">
          {/* HP Bar - Only show if not hidden */}
          {!hideHealthBar && (
            <div className="relative h-2 md:h-3 w-full bg-[#1A1B23] rounded-full border border-white/10 overflow-hidden shadow-inner group">
              <div
                className={cn("h-full transition-all duration-300 shadow-[0_0_8px_rgba(94,211,106,0.3)]", "bg-[#22C55E]")}
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
            <h3 className="font-bold text-[11px] md:text-sm tracking-tight truncate w-full text-center text-white drop-shadow-md">
              {player.name}
              {highlight && (
                <span className="block text-[9px] md:text-[10px] text-white/90 font-medium tracking-tight">
                  ({highlight === "self" ? "Kamu" : highlight === "host" ? "Host" : "Kamu/Host"})
                </span>
              )}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
