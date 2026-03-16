"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { cn } from "@/lib/utils";
import { User } from "@/app/types/User";

interface Player extends User {
  health: number;
  maxHealth: number;
  isMe?: boolean;
}

interface PlayerItemProps {
  player: Player;
  className?: string;
}

export const PlayerItem = ({ player, className }: PlayerItemProps) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-3 transition-all duration-300 w-full rounded-r-full rounded-l-none",
        player.isMe
          ? "bg-linear-to-r from-[#E6AA00]/0 to-[#E6AA00] px-1"
          : "bg-transparent",
        className
      )}
    >
      {/* Left Side: Name and Health Bar */}
      <div className="flex-1 min-w-0 space-y-1 flex flex-col items-end pl-2">
        <h3 className="text-white font-semibold text-xs md:text-sm truncate leading-tight w-full text-right">
          {player.name} {player.isMe && "(Kamu)"}
        </h3>

        {/* Health Bar Container */}
        <div className="relative h-2 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-[#22C55E]"
          />
        </div>

        {/* Health Value with Icon */}
        <div className="flex items-center gap-1 justify-end w-full">
          <div className="relative w-3.5 h-3.5">
            <Image
              src="/icons/health.svg"
              alt="HP"
              fill
              sizes="14px"
              className="object-contain"
            />
          </div>
          <span className="text-white/90 font-regular text-xs md:text-sm">
            {player.health}
          </span>
        </div>
      </div>

      {/* Right Side: Avatar */}
      <div
        className={cn(
          "relative shrink-0 rounded-full border-2 border-white flex items-center justify-center overflow-hidden transition-all duration-300",
          "w-[40px] h-[40px] md:w-[48px] md:h-[48px]",
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
            sizes="(max-width: 768px) 40px, 48px"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};