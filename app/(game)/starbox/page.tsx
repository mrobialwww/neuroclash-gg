"use client";

import React, { useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import { MainButton } from "@/components/common/MainButton";
import { AbilityCard } from "@/components/match/AbilityCard";
import { PlayerGridCard } from "@/components/match/PlayerGridCard";
import { cn } from "@/lib/utils";
import { useStarboxStore } from "@/store/useStarboxStore";

const steps = [
  { id: "book", icon: "/icons/book.svg" },
  { id: "battle-1", icon: "/icons/battle.svg" },
  { id: "battle-2", icon: "/icons/battle.svg" },
  { id: "battle-3", icon: "/icons/battle.svg" },
  { id: "battle-4", icon: "/icons/battle.svg" },
  { id: "battle-5", icon: "/icons/battle.svg" },
  { id: "treasure", icon: "/icons/treasure.svg" },
];

export default function StarboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomId = searchParams.get("roomId") ?? "";
  const code = searchParams.get("code") ?? "---";
  const nextRound = searchParams.get("nextRound") ?? "6";

  const { roomInfo, players, abilities, currentTurnIndex, pickingAbilityId, isLoading, initGameData, selectAbility } = useStarboxStore();

  // 1. Initial Data Fetching
  useEffect(() => {
    initGameData(code, roomId);
  }, [code, roomId, initGameData]);

  const handleNextRound = useCallback(() => {
    router.push(`/game/${roomId}?code=${code}&nextRound=${nextRound}`);
  }, [router, roomId, code, nextRound]);

  const handleExit = () => {
    router.push("/dashboard");
  };

  // 2. Timer Mechanism
  const PICK_TIMEOUT_SEC = 3;

  // Timer state – direset tiap giliran berganti
  const [timeLeft, setTimeLeft] = React.useState(PICK_TIMEOUT_SEC);

  const isMyTurn = roomInfo?.max_player !== 1 && currentTurnIndex < players.length && !!players[currentTurnIndex]?.isMe;

  // Reset timer setiap giliran berganti (currentTurnIndex berubah)
  useEffect(() => {
    setTimeLeft(PICK_TIMEOUT_SEC);
  }, [currentTurnIndex]);

  // Countdown – hanya berjalan saat giliran saya
  useEffect(() => {
    if (!isMyTurn || pickingAbilityId) return;

    if (timeLeft <= 0) {
      // Waktu habis → pilih ability random yang masih ada stoknya
      const available = abilities.filter((a) => a.stock > 0);
      if (available.length > 0) {
        const random = available[Math.floor(Math.random() * available.length)];
        handleUserClickAbility(random.id);
      }
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isMyTurn, pickingAbilityId]);

  // 3. User Click Handler
  const handleUserClickAbility = (abilityId: string) => {
    const totalStock = abilities.reduce((sum, a) => sum + a.stock, 0);
    if (totalStock <= 0 || pickingAbilityId) return;

    if (roomInfo?.max_player === 1) {
      // Solo mode -> instant pick & straight to next round
      selectAbility(roomId, abilityId, players[currentTurnIndex].id);
      setTimeout(() => {
        handleNextRound();
      }, 800);
      return;
    }

    // Multi-player mode
    if (players[currentTurnIndex]?.isMe) {
      selectAbility(roomId, abilityId, players[currentTurnIndex].id);
    }
  };

  const remainingItems = abilities.reduce((sum, a) => sum + a.stock, 0);
  const activeStepIndex = 6;

  const [progress, setProgress] = React.useState(0);

  // 4. Timer Logic
  useEffect(() => {
    if (isLoading || !roomInfo || currentTurnIndex >= players.length) return;

    setProgress(0);
    const duration = 3000; // 3 seconds
    const intervalTime = 50;
    const step = (100 / (duration / intervalTime));

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          nextTurn();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [currentTurnIndex, isLoading, roomInfo, players.length, nextTurn]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent" />
        <p className="animate-pulse text-lg font-semibold text-white">Menyiapkan Starbox...</p>
      </main>
    );
  }
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden px-4 py-6 pt-4 md:px-8 md:pt-6 lg:px-12">
      <div className="relative z-10 flex w-full max-w-[1400px] flex-col items-center gap-8 pb-8">
        {/* Header */}
        <header className="mb-2 flex w-full items-center justify-between">
          <div className="rounded-lg bg-[#A6A6A6]/40 px-2 py-1.5 text-sm font-semibold text-white backdrop-blur-xl md:px-4 md:text-base lg:px-6">
            {code}
          </div>

          {/* Icons Indicators */}
          <div className="flex flex-1 justify-center gap-2 px-4 sm:gap-4 md:gap-6">
            {steps.map((step, index) => {
              const isActive = index === activeStepIndex;

              return (
                <div key={step.id} className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "relative flex h-5 w-5 items-center justify-center transition-all duration-500 md:h-6 md:w-6",
                      isActive ? "text-[#FFCC00]" : "text-white/40",
                    )}
                  >
                    <div
                      className="h-[18px] w-[18px] bg-current md:h-[20px] md:w-[20px]"
                      style={{
                        maskImage: `url(${step.icon})`,
                        WebkitMaskImage: `url(${step.icon})`,
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <MainButton variant="white" onClick={handleExit} className="h-8 shrink-0 px-2 text-sm md:px-4 md:text-base lg:h-9 lg:px-6">
            Keluar
          </MainButton>
        </header>

        {/* Title Section */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold tracking-tight drop-shadow-lg text-balance">
            Takdir ada di tanganmu, pilih satu kekuatan!
          </h1>

          {roomInfo?.max_player !== 1 && currentTurnIndex < players.length && (
            <div className="mt-2 flex flex-col items-center gap-2">
              <p className="text-lg font-medium text-white/80">
                Giliran:{" "}
                <span className={players[currentTurnIndex]?.isMe ? "text-[#22C55E]" : "text-[#FFCB66]"}>
                  {players[currentTurnIndex]?.isMe ? "Kamu" : players[currentTurnIndex]?.name}
                </span>
                <span className="ml-2 text-sm text-white/60">(HP terendah memilih lebih awal)</span>
              </p>

              {/* Countdown Section */}
              {isMyTurn && !pickingAbilityId && (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full border-4 text-3xl font-black tabular-nums shadow-lg transition-colors duration-300",
                      timeLeft <= 1
                        ? "animate-pulse border-red-500 bg-red-500/20 text-red-400"
                        : timeLeft <= 2
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                        : "border-white/40 bg-white/10 text-white",
                    )}
                  >
                    {timeLeft}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{timeLeft <= 0 ? "Memilih..." : "Detik"}</p>
                </div>
              )}
            </div>
          )}

          <p className="mt-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/60">
            Sisa Item Keseluruhan: <span className="text-white">{remainingItems} Terakhir</span>
          </p>
        </div>

        {/* Ability Selection Grid */}
        <div
          className={cn(
            "mx-auto flex w-full flex-wrap items-center justify-center gap-3 transition-all lg:gap-4",
            roomInfo?.max_player !== 1 && !players[currentTurnIndex]?.isMe ? "pointer-events-none opacity-90" : "",
          )}
        >
          {abilities.map((ability) => {
            const isBeingPickedByBot = pickingAbilityId === ability.id;
            console.log(ability.image);
            console.log(ability.emptyImage);
            return (
              <div key={ability.id} className="relative w-[160px] shrink-0 transition-all duration-300 md:w-[180px] lg:w-[200px]">
                <AbilityCard
                  name={ability.name}
                  description={ability.description}
                  image={ability.image}
                  emptyImage={ability.emptyImage}
                  stock={ability.stock}
                  onClick={() => handleUserClickAbility(ability.id)}
                  className={isBeingPickedByBot ? "scale-105 rounded-lg ring-2 ring-white saturate-150" : ""}
                />
              </div>
            );
          })}
        </div>

        {/* Player Grid Container (Hanya relevan/tampil bagus di mode multiplayer) */}
        {roomInfo?.max_player !== 1 && (
          <div className="relative w-full mt-4 py-8 px-4 sm:px-8 lg:px-10 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border border-white/10 shadow-2xl overflow-visible">

            {/* Turn Badge Overlay */}
            {players[currentTurnIndex]?.isMe && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-full max-w-[400px] flex items-center justify-center z-30 px-4">
                <div className="relative w-full h-auto flex items-center justify-center">
                  <NextImage
                    src="/dashboard/trophy-badge.webp"
                    alt="Badge Background"
                    width={400}
                    height={70}
                    className="object-contain -z-10 drop-shadow-xl block w-full h-full"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8">
                    <span className="uppercase text-xs sm:text-sm md:text-base text-white drop-shadow-md font-bold text-center leading-tight">
                      Sekarang giliran kamu untuk memilih kekuatan!
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-3 gap-y-12 md:gap-x-5 md:gap-y-16 items-start justify-items-center">
              {players.map((player, idx) => {
                const isActiveTurn = currentTurnIndex === idx;
                const hasPicked = idx < currentTurnIndex;

                return (
                  <div key={`${player.id}-${idx}`} className="w-full">
                    <PlayerGridCard
                      player={player}
                      hideHealthBar={true}
                      highlight={player.isMe ? "self" : undefined}
                      hasPicked={hasPicked}
                      isActiveTurn={isActiveTurn}
                      progress={progress}
                      progressColor={player.isMe ? "bg-[#D46B1D]/80" : "bg-[#FDBB38]/80"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
function nextTurn() {
  throw new Error("Function not implemented.");
}

