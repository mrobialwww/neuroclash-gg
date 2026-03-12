"use client";

import React from "react";
import Image from "next/image";
import { TextFieldWithButton } from "@/components/common/TextFieldWithButton";

export interface JoinArenaCardProps {
  rankName?: string;
  rankScore?: number;
  rankImageUrl?: string;
  onJoin?: (code: string) => void;
}

export function JoinArenaCard({
  rankName = "Stellar",
  rankScore = 13759,
  rankImageUrl = "/rank/stellar.webp",
  onJoin,
}: JoinArenaCardProps) {
  return (
    <div className="relative w-full h-full bg-[#FDE4B0] border-[3px] border-[#FDA928] rounded-3xl p-5 md:p-8 flex flex-col items-center justify-between text-center overflow-hidden min-h-[220px] md:min-h-[240px] shadow-[0_4px_20px_rgba(253,169,40,0.1)]">
      <div className="flex flex-col items-center z-10 w-full mb-2">
        <h2 className="text-[#555555] text-2xl md:text-3xl font-extrabold mb-2 ">
          Gabung ke Arena
        </h2>

        {/* Badge image */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 mb-2 z-10 flex items-center justify-center">
          <Image
            src={rankImageUrl}
            alt={`${rankName} Badge`}
            fill
            className="object-contain z-10 drop-shadow-lg"
            sizes="(max-width: 768px) 150px, 200px"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Rank indicator */}
        <div className="relative text-white py-2 min-w-[200px] font-bold flex items-center justify-center gap-4 z-10 w-max mb-2">
          <Image
            src="/dashboard/trophy-badge.webp"
            alt="Rank Badge Background"
            fill
            className="object-fill absolute inset-0 -z-10 drop-shadow-sm scale-110"
            sizes="(max-width: 768px) 250px, 300px"
            priority
          />
          <span className="uppercase text-[13px] tracking-widest text-[#FFDFB3] drop-shadow-sm">
            {rankName}
          </span>
          <span className="text-white/40 text-xs mb-0.5">|</span>
          <div className="flex items-center gap-1.5 text-[#FFD700]">
            <span className="text-lg leading-none -mt-1 drop-shadow-sm">
              🏆
            </span>
            <span className="leading-none text-[15px] drop-shadow-sm font-extrabold tracking-wide mb-0.5">
              {rankScore}
            </span>
            1
          </div>
        </div>
      </div>

      {/* Input & Button group */}
      <TextFieldWithButton
        placeholder="Masukkan Kode Arena"
        buttonContent="Gabung"
        wrapperClassName="z-10 w-full"
      />
    </div>
  );
}
