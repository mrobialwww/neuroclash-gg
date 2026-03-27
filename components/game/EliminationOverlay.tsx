"use client";

import React from "react";
import { X } from "lucide-react";

interface EliminationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  placement: number;
  win: number;
  lose: number;
  trophyWon: number;
  coinsEarned: number;
  survivalTime: string; // Format: mm:ss
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
  survivalTime,
  isWinner,
  isLoading = false,
}: EliminationOverlayProps) {
  if (!isOpen) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="relative mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent" />
            <p className="text-lg text-white/80">Menyimpan hasil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon/Emoji */}
          <div className="mb-4 text-6xl">{isWinner ? "🏆" : "💀"}</div>

          {/* Title */}
          <h2 className="mb-2 text-2xl font-bold text-white">
            {isWinner ? "SELAMAT!" : "ANDA TERSINGKIR"}
          </h2>

          {/* Subtitle */}
          <p className="mb-6 text-lg text-white/80">
            {isWinner
              ? "Anda memenangkan pertandingan!"
              : `Anda berada di peringkat ${placement}`}
          </p>

          {/* Stats Box */}
          <div className="mb-6 w-full rounded-xl bg-white/5 p-4">
            <div className="grid grid-cols-4 gap-3">
              {/* Win */}
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-400">{win}</span>
                <span className="mt-1 text-xs text-white/60">WIN</span>
              </div>

              {/* Lose */}
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-red-400">{lose}</span>
                <span className="mt-1 text-xs text-white/60">LOSE</span>
              </div>

              {/* Trophy */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-2xl font-bold ${
                    trophyWon >= 0 ? "text-yellow-400" : "text-red-400"
                  }`}
                >
                  {trophyWon >= 0 ? "+" : ""}
                  {trophyWon}
                </span>
                <span className="mt-1 text-xs text-white/60">TROPHY</span>
              </div>

              {/* Coins */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-2xl font-bold ${
                    coinsEarned >= 0 ? "text-amber-400" : "text-red-400"
                  }`}
                >
                  {coinsEarned >= 0 ? "+" : ""}
                  {coinsEarned}
                </span>
                <span className="mt-1 text-xs text-white/60">COINS</span>
              </div>
            </div>
          </div>

          {/* Survival Time */}
          <div className="mb-6 flex items-center gap-2">
            <span className="text-white/60">Waktu Bertahan:</span>
            <span className="text-xl font-bold text-blue-400">
              {survivalTime}
            </span>
          </div>

          {/* Placement Badge */}
          <div
            className={`mb-6 rounded-full px-6 py-2 ${
              isWinner
                ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                : placement === 2
                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                : placement === 3
                ? "bg-gradient-to-r from-amber-600 to-amber-700"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}
          >
            <span className="text-lg font-bold text-white">
              PERINGKAT {placement}
            </span>
          </div>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-600 hover:shadow-lg"
          >
            Lanjut Menyaksikan
          </button>
        </div>
      </div>
    </div>
  );
}
