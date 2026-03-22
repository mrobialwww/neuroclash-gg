"use client";

import React, { useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

  const {
    roomInfo,
    players,
    abilities,
    currentTurnIndex,
    pickingAbilityId,
    isLoading,
    initGameData,
    selectAbility,
    nextTurn,
  } = useStarboxStore();

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

  // 2. Turn Management & Bot Execution Effect
  useEffect(() => {
    if (isLoading || !roomInfo) return;

    const totalStock = abilities.reduce((sum, a) => sum + a.stock, 0);

    // Stop conditions: all players picked OR items run out completely
    if (currentTurnIndex >= players.length || totalStock <= 0) {
      if (currentTurnIndex > 0 || totalStock <= 0) {
        // Prevents initial instant redirect if somehow items are empty
        const timer = setTimeout(() => handleNextRound(), 1000);
        return () => clearTimeout(timer);
      }
      return;
    }

    const currentPlayer = players[currentTurnIndex];

    // Jika giliran bot (MOCK OPPONENT)
    if (!currentPlayer.isMe && roomInfo.max_player !== 1) {
      if (pickingAbilityId) return; // Prevent overlapping if already picking

      const botTimer = setTimeout(() => {
        const availableItems = abilities.filter((a) => a.stock > 0);
        if (availableItems.length > 0) {
          const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
          selectAbility(randomItem.id);

          setTimeout(() => {
            nextTurn();
          }, 1200);
        } else {
          nextTurn();
        }
      }, 1500);

      return () => clearTimeout(botTimer);
    }
  }, [
    currentTurnIndex,
    players,
    abilities,
    isLoading,
    roomInfo,
    pickingAbilityId,
    selectAbility,
    nextTurn,
    handleNextRound,
  ]);

  // 3. User Click Handler
  const handleUserClickAbility = (abilityId: string) => {
    const totalStock = abilities.reduce((sum, a) => sum + a.stock, 0);
    if (totalStock <= 0 || pickingAbilityId) return;

    if (roomInfo?.max_player === 1) {
      // Solo mode -> instant pick & straight to next round
      selectAbility(abilityId);
      setTimeout(() => {
        handleNextRound();
      }, 800);
      return;
    }

    // Multi-player mode
    if (players[currentTurnIndex]?.isMe) {
      selectAbility(abilityId);
      setTimeout(() => {
        nextTurn();
      }, 1200);
    }
  };

  const remainingItems = abilities.reduce((sum, a) => sum + a.stock, 0);
  const activeStepIndex = 6; // Treasure step

  if (isLoading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3D79F3] border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-semibold animate-pulse">Menyiapkan Starbox...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-6 px-4 md:px-8 lg:px-12 relative overflow-x-hidden pt-4 md:pt-6">

      <div className="relative z-10 w-full max-w-[1400px] flex flex-col items-center gap-8 pb-8">
        {/* Header */}
        <header className="w-full flex items-center justify-between mb-2">
          <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-2 md:px-4 lg:px-6 py-1.5 rounded-lg font-semibold text-white text-sm md:text-base">
            {code}
          </div>

          {/* Icons Indicators */}
          <div className="flex-1 flex justify-center gap-2 sm:gap-4 md:gap-6 px-4">
            {steps.map((step, index) => {
              const isActive = index === activeStepIndex;

              return (
                <div key={step.id} className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "relative h-5 w-5 md:h-6 md:w-6 transition-all duration-500 flex items-center justify-center",
                      isActive ? "text-[#FFCC00]" : "text-white/40"
                    )}
                  >
                    <div
                      className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] bg-current"
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

          <MainButton variant="white" onClick={handleExit} className="px-2 md:px-4 lg:px-6 h-8 lg:h-9 text-sm md:text-base shrink-0">
            Keluar
          </MainButton>
        </header>

        {/* Title Section */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold tracking-tight drop-shadow-lg">
            Takdir ada di tanganmu, pilih satu kekuatan!
          </h1>

          {roomInfo?.max_player !== 1 && currentTurnIndex < players.length && (
            <p className="mt-2 text-white/80 font-medium text-lg">
              Giliran: <span className={players[currentTurnIndex]?.isMe ? "text-[#22C55E]" : "text-[#FFCB66]"}>
                {players[currentTurnIndex]?.isMe ? "Kamu" : players[currentTurnIndex]?.name}
              </span>
              <span className="text-white/60 text-sm ml-2">(HP terendah memilih lebih awal)</span>
            </p>
          )}

          <p className="mt-2 text-white/60 font-semibold text-sm bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
            Sisa Item Keseluruhan: <span className="text-white">{remainingItems} Terakhir</span>
          </p>
        </div>

        {/* Ability Selection Grid */}
        <div className={cn(
          "flex flex-wrap justify-center items-center gap-3 lg:gap-4 w-full mx-auto transition-all",
          roomInfo?.max_player !== 1 && !players[currentTurnIndex]?.isMe ? "pointer-events-none opacity-90" : ""
        )}>
          {abilities.map((ability) => {
            const isBeingPickedByBot = pickingAbilityId === ability.id;
            return (
              <div key={ability.id} className="w-[160px] md:w-[180px] lg:w-[200px] shrink-0 relative transition-all duration-300">
                <AbilityCard
                  name={ability.name}
                  description={ability.description}
                  image={ability.image}
                  emptyImage={ability.emptyImage}
                  stock={ability.stock}
                  onClick={() => handleUserClickAbility(ability.id)}
                  className={isBeingPickedByBot ? "scale-105 saturate-150 ring-2 ring-white rounded-lg" : ""}
                />
              </div>
            );
          })}
        </div>

        {/* Player Grid Container (Hanya relevan/tampil bagus di mode multiplayer) */}
        {roomInfo?.max_player !== 1 && (
          <div className="w-full mt-4 py-6 px-4 sm:px-8 lg:px-10 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 shadow-2xl">
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 items-center justify-items-center">
              {players.map((player, idx) => {
                const isActiveTurn = currentTurnIndex === idx;
                const hasPicked = idx < currentTurnIndex;

                return (
                  <div key={`${player.id}-${idx}`} className="relative">
                    <PlayerGridCard
                      player={player}
                      className={cn(
                        "transition-all duration-300",
                        isActiveTurn ? "scale-110 drop-shadow-[0_0_15px_rgba(255,204,0,0.8)]" : "",
                        hasPicked ? "opacity-50 grayscale" : ""
                      )}
                    />
                    {/* Turn Indicator */}
                    {isActiveTurn && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFCC00] rotate-45 border-2 border-white shadow-lg animate-bounce" />
                    )}
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
