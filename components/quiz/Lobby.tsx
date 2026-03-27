"use client";

import React from "react";
import Image from "next/image";
import { PlayerGridCard } from "../match/PlayerGridCard";
import { MainButton } from "../common/MainButton";
import { Player } from "@/lib/constants/players";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LobbyPlayer extends Player {
  isHost?: boolean;
  userGameId?: string;
  joinedAt?: string;
}

export interface LobbyRoomProps {
  roomCode: string;
  roomTitle: string;
  totalSlots: number;
  players: LobbyPlayer[];
  hostId: string;
  currentUserData?: { id: string; username: string; avatar: string } | null;
  /** true = solo mode (max_player === 1), false/undefined = multiplayer */
  isSolo?: boolean;
  /** true = user is the host of this logic */
  isHost?: boolean;
  /** Called when solo user or host clicks "Mulai" */
  onStart?: () => void;
  /** Loading state for start button */
  isLoading?: boolean;
  /** Is the user leaving? */
  isLeaving?: boolean;
  onLeave?: () => void;
}

export function LobbyRoom({
  roomCode,
  roomTitle,
  totalSlots,
  players,
  hostId,
  currentUserData,
  isSolo = false,
  isHost = false,
  onStart,
  isLoading = false,
  isLeaving = false,
  onLeave,
}: LobbyRoomProps) {

  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. Sorting Players: Me first, then Host, then others
  const sortedPlayers = [...players].sort((a, b) => {
    // Current user data is used to identify "Me"
    const isAMe = String(a.id) === currentUserData?.id;
    const isBMe = String(b.id) === currentUserData?.id;
    if (isAMe) return -1;
    if (isBMe) return 1;

    // Host second
    const isAHost = String(a.id) === hostId;
    const isBHost = String(b.id) === hostId;
    if (isAHost) return -1;
    if (isBHost) return 1;

    return 0;
  });

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-24 py-4 relative overflow-x-hidden">
      <div className="relative z-10 w-full max-w-[1400px] flex flex-col items-center gap-6 md:gap-8">

        {/* Header - Consistent with Match/Starbox */}
        <header className="w-full flex items-center justify-between pt-4">
          {(!isSolo) ? (
            <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-4 md:px-6 py-2 rounded-lg font-bold text-white tracking-widest text-sm md:text-base">
              {roomCode}
            </div>
          ) : (
            <div /> // placeholder for center alignment if needed, or just let justify-between work
          )}

          <MainButton
            variant="white"
            onClick={onLeave}
            disabled={isLeaving}
            className="px-4 md:px-6 h-9 lg:h-10 text-sm md:text-base font-bold"
          >
            {isLeaving ? "Keluar..." : "Keluar"}
          </MainButton>
        </header>

        {/* Central Avatar Section */}
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 gap-3 md:gap-4">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 group  mb-2 md:mb-4">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700" />
            <div className="relative w-full h-full rounded-full border-4 border-white/60 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden flex items-center justify-center">
              <Image
                src={currentUserData?.avatar ?? "/default/Slime.webp"}
                alt="Profile"
                width={120}
                height={120}
                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] w-[85%] h-[85%]"
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-xl text-center">
              {isSolo
                ? "Kamu bisa berlatih mengerjakan quiz ini secara mandiri."
                : isHost
                  ? "Bagikan kode room di bawah ke teman-temanmu!"
                  : "Menunggu Host Memulai Pertandingan..."
              }
            </h1>
            {!isSolo && isHost && (
              <button
                onClick={handleCopy}
                className="mt-2 flex items-center justify-center gap-2 bg-[#D9D9D9]/20 hover:bg-[#D9D9D9]/30 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg active:scale-95 text-sm md:text-base border border-white/10 backdrop-blur-sm group"
              >
                <span className="opacity-90 group-hover:opacity-100 uppercase tracking-wide">{roomCode}</span>
                <div className="bg-white/20 p-1 md:p-1.5 rounded-full">
                  {copied ? <Check size={16} strokeWidth={3} className="text-green-300" /> : <Copy size={16} />}
                </div>
              </button>
            )}
          </div>

          <div className="inline-flex items-center bg-[#003186]/60 backdrop-blur-md px-4 md:px-6 py-1.5 md:py-2 rounded-lg">
            <span className="text-white text-base md:text-lg font-semibold">Materi: {roomTitle}</span>
          </div>
        </div>

        {/* Player List Section */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex justify-between items-center px-1 sm:px-2">
            <h2 className="text-white font-bold text-lg md:text-xl">Daftar Pemain</h2>
            <span className="text-white font-medium text-md sm:text-lg">
              {players.length} / {totalSlots}
            </span>
          </div>

          <div className="w-full py-3 md:py-4 px-2 sm:px-4 rounded-2xl bg-[#D9D9D9]/10 backdrop-blur-md border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Auto-fill grid: kolom dihitung otomatis dari lebar container */}
            <div
              className="grid gap-x-3 gap-y-6"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(105px, 1fr))" }}
            >
              {sortedPlayers.map((player) => {
                const isMe = String(player.id) === currentUserData?.id;
                const isHost = String(player.id) === hostId;

                return (
                  <div key={player.id} className="flex justify-center">
                    <PlayerGridCard
                      player={player}
                      hideHealthBar={true}
                      highlight={isMe && isHost ? "self-host" : isMe ? "self" : isHost ? "host" : undefined}
                      lobbyMode
                    />
                  </div>
                );
              })}

              {/* Empty Slots */}
              {Array.from({ length: Math.max(0, Math.min(10, totalSlots) - players.length) }).map((_, i) => {
                const globalIndex = players.length + i;
                const visibilityClass = globalIndex >= 8 ? "hidden md:flex" : globalIndex >= 6 ? "hidden sm:flex" : "flex";

                return (
                  <div key={`empty-${i}`} className={cn("justify-center", visibilityClass)}>
                    <div className="flex flex-col items-center gap-2 opacity-20 w-[88px] sm:w-[100px] md:w-[110px] py-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full border-4 border-dashed border-white/40 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                      <div className="h-3 w-10 bg-white/20 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-md pb-8">
          {isSolo ? (
            <MainButton
              variant="green"
              hasShadow
              className="w-full text-lg font-bold py-5 rounded-xl"
              onClick={onStart}
              disabled={isLoading}
            >
              {isLoading ? "Memuat..." : "Mainkan Sekarang"}
            </MainButton>
          ) : isHost ? (
            <MainButton
              variant="green"
              hasShadow
              className="w-full text-lg font-bold py-5 rounded-xl"
              onClick={onStart}
              disabled={isLoading || (!isSolo && players.length < 4)}
            >
              {isLoading
                ? "Memuat..."
                : (!isSolo && players.length < 4)
                  ? "Minimal 4 Pemain"
                  : "Mulai Pertandingan"}
            </MainButton>
          ) : (
            <MainButton
              variant="white"
              className="w-full text-lg font-bold py-5 rounded-xl opacity-60 cursor-not-allowed"
              disabled
            >
              Menunggu Host...
            </MainButton>
          )}
        </div>
      </div>
    </main>
  );
}