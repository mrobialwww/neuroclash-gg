import React from "react";
import { LeaderboardAvatar } from "@/components/leaderboard/LeaderboardAvatar";
import { LeaderboardRankCell } from "@/components/leaderboard/LeaderboardRankCell";

export interface EndgamePlayer {
  id: string;
  position: number;
  username: string;
  characterImage: string;
  baseCharacter: string;
  playTime: string;
  wins: number;
  losses: number;
}

interface EndgameTableRowProps {
  player: EndgamePlayer;
  isMe?: boolean;
}

export function EndgameTableRow({ player, isMe = false }: EndgameTableRowProps) {
  // Row Background Color based on if user is me or regular
  const bgColor = isMe ? "bg-[#566CB1]" : "bg-[#32387D]";

  return (
    <div
      className={`grid grid-cols-[80px_minmax(140px,1fr)_140px_140px] items-center gap-4 md:gap-8 px-6 py-1 transition-all duration-200 rounded-lg ${bgColor}`}
    >
      {/* Peringkat (Position) */}
      <div className="flex items-center justify-center">
        {isMe && player.position === 0 ? (
          <span className="font-medium text-xs sm:text-sm text-white">Tidak Ada</span>
        ) : (
          <div className="transform scale-75 sm:scale-90 md:scale-100">
            <LeaderboardRankCell position={player.position} />
          </div>
        )}
      </div>

      {/* Pemain (Avatar + Name) */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
        <div className="transform scale-75 sm:scale-90 md:scale-100 shrink-0">
          <LeaderboardAvatar
            imageUrl={player.characterImage}
            baseCharacter={player.baseCharacter}
            size="md"
          />
        </div>
        <span className="font-medium text-sm sm:text-base md:text-lg truncate text-white">
          {player.username}
        </span>
      </div>

      {/* Waktu Bermain */}
      <div className="flex items-center justify-center min-w-0 text-center">
        <span className="font-medium text-white/90 text-xs sm:text-sm md:text-base whitespace-nowrap">
          {player.playTime}
        </span>
      </div>

      {/* Hasil */}
      <div className="flex items-center justify-center min-w-0 text-center">
        <span className="font-medium text-white/90 text-xs sm:text-sm md:text-base whitespace-nowrap">
          {player.wins} Menang - {player.losses} Kalah
        </span>
      </div>
    </div>
  );
}
