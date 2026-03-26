"use client";

import Image from "next/image";
import { LeaderboardRankEntry } from "@/types";
import { LeaderboardRankCell } from "./LeaderboardRankCell";
import { LeaderboardAvatar } from "./LeaderboardAvatar";

interface LeaderboardRowProps {
  entry: LeaderboardRankEntry;
  isMe?: boolean;
}

function getRowStyle(position: number, isMe: boolean): React.CSSProperties {
  switch (position) {
    case 1:
      return {
        background: "linear-gradient(90deg, #FDA928CC 0%, #97651800 100%)",
      };
    case 2:
      return {
        background: "linear-gradient(90deg, #8D99C7CC 0%, #454B6100 100%)",
      };
    case 3:
      return {
        background: "linear-gradient(90deg, #735131CC 0%, #D9995C00 100%)",
      };
    default:
      if (isMe) {
        return {
          background: "#4D4D4D66",
        };
      }
      return {
        background: "#D9D9D933",
      };
  }
}

export function LeaderboardRow({ entry, isMe = false }: LeaderboardRowProps) {
  const rowStyle = getRowStyle(entry.position, isMe);

  return (
    <div
      className={`grid grid-cols-[80px_minmax(160px,1fr)_140px_140px] items-center gap-4 md:gap-8 px-6 py-1 transition-all duration-200 rounded-lg ${isMe ? "border border-white relative z-10" : ""}`}
      style={rowStyle}
    >
      {/* Position */}
      <div className="flex items-center justify-center">
        {isMe && entry.position === 0 ? (
          <span className="text-white font-semibold text-sm sm:text-base">Tidak Ada</span>
        ) : (
          <LeaderboardRankCell position={entry.position} />
        )}
      </div>

      {/* Player */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <LeaderboardAvatar imageUrl={entry.character_image} baseCharacter={entry.base_character} />
        <span
          className={`font-medium text-md md:text-lg truncate ${isMe ? "text-[#FDA928]" : "text-white"}`}
        >
          {entry.username}
        </span>
      </div>

      {/* Rank */}
      <div className="flex items-center gap-1.5 sm:gap-2 justify-start min-w-[80px] sm:min-w-[100px]">
        {entry.rank ? (
          <>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0">
              <Image
                src={entry.rank.image_url}
                alt={entry.rank.name}
                fill
                sizes="(max-width: 768px) 48px, 56px"
                className="object-contain drop-shadow-md"
              />
            </div>
            <span className="text-[#BDCDFF] font-medium text-md md:text-lg whitespace-nowrap">
              {entry.rank.name}
            </span>
          </>
        ) : (
          <span className="text-white/50 text-xs sm:text-sm">-</span>
        )}
      </div>

      {/* Trophy */}
      <div className="flex items-center gap-1.5 justify-start min-w-[70px] sm:min-w-[90px]">
        <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0">
          <Image
            src="/icons/trophy-color.svg"
            alt="Trophy"
            fill
            sizes="24px"
            className="object-contain"
          />
        </div>
        <span className="text-[#FDA928] font-medium text-md md:text-lg tabular-nums">
          {entry.total_trophy.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}
