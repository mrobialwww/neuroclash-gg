"use client";

import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";

interface EliminationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  placement: number;
  win: number;
  lose: number;
  trophyWon: number;
  coinsEarned: number;
  survivalTime: string; // Format: mm:ss
  coinBoost?: number;
  trophyBoost?: number;
  isWinner: boolean;
  isLoading?: boolean;
}

export function EliminationOverlay({
  isOpen,
  onClose,
  placement,
  win,
  lose,
  trophyWon,
  coinsEarned,
  coinBoost = 0,
  trophyBoost = 0,
  survivalTime,
  isWinner,
  isLoading = false,
}: EliminationOverlayProps) {
  if (!isOpen) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
        <div className="relative w-full max-w-[400px] rounded-2xl bg-[#040619] border-2 border-[#383347] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-8 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent" />
          <p className="text-lg font-bold text-white uppercase tracking-wider">Menyimpan hasil...</p>
        </div>
      </div>
    );
  }

  const finalImage = isWinner ? "/mascot/mascot-match.webp" : "/mascot/mascot-failed.webp";
  const titleColor = isWinner ? "text-white" : "text-[#FF0000] drop-shadow-[0_2px_4px_rgba(255,0,0,0.3)]";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] md:max-w-[460px] rounded-2xl bg-[#040619] border-2 border-[#383347] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-6 md:p-8 flex flex-col items-center text-center gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Title */}
        <h2 className={`text-xl md:text-3xl font-extrabold uppercase ${titleColor}`}>
          {isWinner ? "SELAMAT!" : "KAMU TERELIMINASI"}
        </h2>

        {/* Mascot Image */}
        <div className="relative w-[100px] h-[100px] md:w-[140px] md:h-[140px] drop-shadow-2xl">
          <Image
            src={finalImage}
            alt="Elimination Result"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Subtitle / Placement */}
        <div className="text-white text-sm md:text-lg font-medium leading-relaxed">
          <p>
            {isWinner
              ? "Kamu memenangkan pertandingan!"
              : `Kamu berada di peringkat `}
            {!isWinner && (
              <span className="text-[#FFC300] font-bold">#{placement}</span>
            )}
          </p>
          <div className="mt-1 flex items-center justify-center gap-2 opacity-80">
            <span className="text-xs uppercase tracking-widest text-[#658BFF]">Waktu Bertahan:</span>
            <span className="font-bold text-white">{survivalTime}</span>
          </div>
        </div>

        {/* Stats Box */}
        <div className="w-full rounded-xl bg-white/5 p-4 border border-white/10">
          <div className="grid grid-cols-4 gap-2">
            {/* Win */}
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-extrabold text-[#4ade80]">{win}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase">WIN</span>
            </div>

            {/* Lose */}
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-extrabold text-[#f87171]">{lose}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase">LOSE</span>
            </div>

            {/* Trophy */}
            <div className="flex flex-col items-center relative">
              <span className={`text-lg md:text-xl font-extrabold ${trophyWon >= 0 ? "text-[#FFC300]" : "text-[#f87171]"}`}>
                {trophyWon >= 0 ? "+" : ""}{trophyWon}
              </span>
              <span className="text-[10px] font-bold text-white/40 uppercase">TROPHY</span>
              {trophyBoost > 0 && (
                <span className="absolute -top-3 text-[9px] font-extrabold text-[#4ade80]">
                  +{trophyBoost}%
                </span>
              )}
            </div>

            {/* Coins */}
            <div className="flex flex-col items-center relative">
              <span className={`text-lg md:text-xl font-extrabold ${coinsEarned >= 0 ? "text-[#fbbf24]" : "text-[#f87171]"}`}>
                {coinsEarned >= 0 ? "+" : ""}{coinsEarned}
              </span>
              <span className="text-[10px] font-bold text-white/40 uppercase">COINS</span>
              {coinBoost > 0 && (
                <span className="absolute -top-3 text-[9px] font-extrabold text-[#4ade80]">
                  +{coinBoost}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Placement Badge Style aligned with ToastOverlay buttons */}
        <MainButton
          onClick={onClose}
          variant="blue"
          size="lg"
          hasShadow
          className="w-full h-12 md:h-14 text-sm md:text-lg font-bold uppercase tracking-wider"
        >
          Lanjut Menyaksikan
        </MainButton>
      </div>
    </div>
  );
}
