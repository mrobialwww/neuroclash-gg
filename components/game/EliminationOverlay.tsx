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
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-md px-6">
        <div className="relative w-full max-w-[400px] rounded-2xl bg-slate-900/60 border-2 border-[#383347] shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-8 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent shadow-[0_0_15px_rgba(61,121,243,0.3)]" />
          <p className="text-lg font-bold text-white uppercase tracking-wider">Menyimpan hasil...</p>
        </div>
      </div>
    );
  }

  const finalImage = isWinner ? "/mascot/mascot-match.webp" : "/mascot/mascot-failed.webp";
  const titleColor = isWinner ? "text-white" : "text-[#FF0000] drop-shadow-[0_2px_4px_rgba(255,0,0,0.3)]";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-md px-6">
      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] md:max-w-[460px] rounded-2xl bg-slate-900/60 border-2 border-[#383347] shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-6 md:p-8 flex flex-col items-center text-center gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Title */}
        <h2 className="text-xl md:text-3xl font-bold text-white">
          {isWinner ? "Selamat!" : "Kamu Tereliminasi"}
        </h2>

        <div className="relative w-[100px] h-[100px] md:w-[140px] md:h-[140px] drop-shadow-2xl">
          <Image
            src="/mascot/mascot-match.webp"
            alt="Elimination Result"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Subtitle / Placement */}
        <div className="text-white text-sm md:text-lg font-semibold leading-relaxed">
          <p>
            {isWinner
              ? "Kamu memenangkan pertandingan!"
              : `Kamu berada di peringkat `}
            {!isWinner && (
              <span className="text-[#FFC300] font-bold">#{placement}</span>
            )}
          </p>
          <div className="mt-2 flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-[#658BFF]">Waktu Bertahan</span>
            <span className="font-bold text-white text-xl">
              {Math.floor(parseInt(survivalTime.split(':')[0]))} Menit {parseInt(survivalTime.split(':')[1])} Detik
            </span>
          </div>
        </div>

        {/* Stats Box */}
        <div className="w-full rounded-xl bg-white/5 p-4 border border-white/10">
          <div className="grid grid-cols-4 gap-2">
            {/* Win */}
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-bold text-[#4ade80]">{win}</span>
              <span className="text-xs font-semibold text-white/70">Menang</span>
            </div>

            {/* Lose */}
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-bold text-[#f87171]">{lose}</span>
              <span className="text-xs font-semibold text-white/70">Kalah</span>
            </div>

            {/* Trophy */}
            <div className="flex flex-col items-center relative">
              <span className={`text-lg md:text-xl font-bold ${trophyWon >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                {trophyWon >= 0 ? "+" : ""}{trophyWon}
              </span>
              <span className="text-xs font-semibold text-white/70">Trofi</span>
              {trophyBoost > 0 && (
                <span className="absolute -top-3 text-[10px] font-bold text-[#4ade80]">
                  +{trophyBoost}%
                </span>
              )}
            </div>

            {/* Coins */}
            <div className="flex flex-col items-center relative">
              <span className={`text-lg md:text-xl font-bold ${coinsEarned >= 0 ? "text-[#fbbf24]" : "text-[#f87171]"}`}>
                {coinsEarned >= 0 ? "+" : ""}{coinsEarned}
              </span>
              <span className="text-xs font-semibold text-white/70">Koin</span>
              {coinBoost > 0 && (
                <span className="absolute -top-3 text-[10px] font-bold text-[#4ade80]">
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
          className="w-full h-11 md:h-13 text-sm md:text-lg font-bold"
        >
          Lanjut Menyaksikan
        </MainButton>
      </div>
    </div>
  );
}
