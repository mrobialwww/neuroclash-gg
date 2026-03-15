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
}

interface PlayerListProps {
  players: Player[];
  className?: string;
}

export const PlayerList = ({ players, className }: PlayerListProps) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 p-2", className)}>
      {players.map((player) => {
        const healthPercentage = (player.health / player.maxHealth) * 100;

        return (
          <div
            key={player.id}
            className="flex items-center gap-2 md:gap-3"
          >
            {/* Left Side: Name and Health Bar */}
            <div className="flex-1 min-w-0 space-y-1 flex flex-col items-end">
              <h3 className="text-white font-medium text-sm md:text-md truncate leading-tight w-full text-right">
                {player.name}
              </h3>

              {/* Health Bar Container */}
              <div className="relative h-2 md:h-2.5 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                />
              </div>

              {/* Health Icon and Value */}
              <div className="flex items-center gap-1">
                <div className="relative w-4 h-4">
                  <Image
                    src="/icons/health.svg"
                    alt="HP"
                    fill
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
              className="relative shrink-0 rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: getCharacterBgColor(player.character),
                width: 42, // Mobile size
                height: 42,
              }}
            >
              <div className="md:w-12 md:h-12 absolute inset-0" />

              <div className="relative w-[80%] h-[80%] flex items-center justify-center mt-0.5">
                <Image
                  src={player.image}
                  alt={player.character}
                  fill
                  sizes="(max-width: 768px) 42px, 52px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};