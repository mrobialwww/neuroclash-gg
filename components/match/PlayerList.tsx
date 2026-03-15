"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlayerItem } from "./PlayerItem";
import { User } from "@/app/types/User";

interface Player extends User {
  health: number;
  maxHealth: number;
  isMe?: boolean;
}

interface PlayerListProps {
  players: Player[];
  className?: string;
}

export const PlayerList = ({ players, className }: PlayerListProps) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-[200px] md:max-w-[240px] p-2 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 shadow-2xl flex flex-col items-center",
        className
      )}
    >
      {/* Header Badge */}
      <div className="relative w-[160px] md:w-[180px] h-[35px] md:h-[40px] flex items-center justify-center mb-2">
        <Image
          src="/match/match-badge.webp"
          alt="Daftar Pemain Badge"
          fill
          className="object-contain"
          priority
        />
        <h2 className="relative z-10 text-white font-semibold text-sm md:text-base tracking-tight mt-0.5">
          Daftar Pemain
        </h2>
      </div>

      {/* Players List Container */}
      <div className="w-full space-y-1.5 overflow-y-auto flex-1 scrollbar-hide pb-2">
        {players.map((player) => (
          <PlayerItem key={player.id} player={player} />
        ))}
      </div>
    </div >
  );
};