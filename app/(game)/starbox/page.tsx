"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
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

/** Durasi timer per giliran (ms) — habis = auto-pick random */
const TURN_DURATION_MS = 3000;
/** Interval update progress bar (ms) */
const PROGRESS_TICK_MS = 50;

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
    pickingAbilityId,
    isLoading,
    isHost,
    myPlayerId,
    pickedPlayerIds,
    currentTurnIndex,
    initGameData,
    selectAbility,
    autoAssignRemaining,
    cleanup,
    reset,
  } = useStarboxStore();

  // ── 1. Initial Data Fetching
  useEffect(() => {
    initGameData(code, roomId, nextRound);
    return () => cleanup();
  }, [code, roomId, initGameData, cleanup, nextRound]);

  const handleNextRound = useCallback(() => {
    router.push(`/game/${roomId}?code=${code}&nextRound=${nextRound}`);
  }, [router, roomId, code, nextRound]);

  const handleExit = () => {
    reset();
    router.push("/dashboard");
  };

  // ── 2. Derived state (event-driven, dari Zustand `currentTurnIndex`) ───
  const allTurnsDone = players.length > 0 && currentTurnIndex >= players.length;
  const isMyTurn = roomInfo?.max_player !== 1 && currentTurnIndex < players.length && !!players[currentTurnIndex]?.isMe;
  const iHavePicked = myPlayerId ? pickedPlayerIds.includes(myPlayerId) : false;

  // ── 3. Per-turn timer: 3 detik per giliran, auto-pick random jika habis ─
  const [progress, setProgress] = useState(0);
  const [turnCountdown, setTurnCountdown] = useState(TURN_DURATION_MS / 1000);
  const autoPickedThisTurn = useRef(false);

  useEffect(() => {
    if (allTurnsDone || isLoading) {
      setProgress(0);
      setTurnCountdown(TURN_DURATION_MS / 1000);
      return;
    }

    // Reset saat giliran berganti
    setProgress(0);
    setTurnCountdown(TURN_DURATION_MS / 1000);
    autoPickedThisTurn.current = false;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / TURN_DURATION_MS) * 100);
      const remaining = Math.max(0, Math.ceil((TURN_DURATION_MS - elapsed) / 1000));
      setProgress(pct);
      setTurnCountdown(remaining);

      // Timer habis → auto-pick random untuk giliran saya
      if (elapsed >= TURN_DURATION_MS && !autoPickedThisTurn.current) {
        autoPickedThisTurn.current = true;

        const state = useStarboxStore.getState();
        const currentPlayer = state.players[state.currentTurnIndex];
        if (!currentPlayer) return;

        // Hanya user yang sedang giliran yang menjalankan auto-pick
        if (currentPlayer.isMe) {
          const available = state.abilities.filter((a) => a.stock > 0);
          if (available.length > 0) {
            const randomAbility = available[Math.floor(Math.random() * available.length)];
            console.log(`[Starbox] Auto-pick: ${randomAbility.name} untuk ${currentPlayer.name}`);
            state.selectAbility(roomId, randomAbility.id, currentPlayer.id);
          }
        }
      }
    }, PROGRESS_TICK_MS);

    return () => clearInterval(interval);
  }, [currentTurnIndex, allTurnsDone, isLoading, roomId]);

  // ── 4. Auto-transition: semua giliran selesai → redirect
  const autoAssignDone = useRef(false);

  useEffect(() => {
    if (!allTurnsDone || isLoading || !roomInfo || autoAssignDone.current) return;
    autoAssignDone.current = true;

    if (isHost) {
      import("@/repository/abilityRoomRepository").then(({ abilityRoomRepository }) => {
        autoAssignRemaining(roomId).then(async () => {
          await abilityRoomRepository.initialAbilites(roomId, players.length, true);
          setTimeout(() => handleNextRound(), 1500);
        });
      });
    } else {
      setTimeout(() => handleNextRound(), 2500);
    }
  }, [allTurnsDone, isLoading, roomInfo, isHost, roomId, autoAssignRemaining, handleNextRound, players.length]);

  // ── 5. Click handler
  const handleUserClickAbility = useCallback(
    (abilityId: string) => {
      const totalStock = abilities.reduce((sum, a) => sum + a.stock, 0);
      if (totalStock <= 0 || pickingAbilityId) return;

      if (roomInfo?.max_player === 1) {
        selectAbility(roomId, abilityId, players[currentTurnIndex]?.id);
        setTimeout(() => handleNextRound(), 800);
        return;
      }

      if (isMyTurn && !iHavePicked) {
        autoPickedThisTurn.current = true; // Cegah auto-pick setelah user sudah pilih manual
        selectAbility(roomId, abilityId, players[currentTurnIndex]?.id);
      }
    },
    [abilities, pickingAbilityId, roomInfo, roomId, players, currentTurnIndex, selectAbility, handleNextRound, isMyTurn, iHavePicked],
  );

  const remainingItems = abilities.reduce((sum, a) => sum + a.stock, 0);
  const activeStepIndex = 6;
  const canPickAbility = roomInfo?.max_player === 1 || (isMyTurn && !iHavePicked && !pickingAbilityId);

  // ── Loading screen
  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent" />
        <p className="animate-pulse text-lg font-semibold text-white">Menyiapkan Starbox...</p>
      </main>
    );
  }

  // ── Main UI
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden px-4 py-6 pt-4 md:px-8 md:pt-6 lg:px-12">
      <div className="relative z-10 flex w-full max-w-[1400px] flex-col items-center gap-8 pb-8">
        {/* Header */}
        <header className="mb-2 flex w-full items-center justify-between">
          <div className="rounded-lg bg-[#A6A6A6]/40 px-2 py-1.5 text-sm font-semibold text-white backdrop-blur-xl md:px-4 md:text-base lg:px-6">
            {code}
          </div>

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
          <h1 className="text-balance text-xl font-bold tracking-tight text-white drop-shadow-lg md:text-2xl lg:text-3xl">
            Takdir ada di tanganmu, pilih satu kekuatan!
          </h1>

          {roomInfo?.max_player !== 1 && (
            <div className="mt-2 flex flex-col items-center gap-2">
              {currentTurnIndex < players.length ? (
                <p className="text-lg font-medium text-white/80">
                  Giliran:{" "}
                  <span className={players[currentTurnIndex]?.isMe ? "text-[#22C55E]" : "text-[#FFCB66]"}>
                    {players[currentTurnIndex]?.isMe ? "Kamu" : players[currentTurnIndex]?.name}
                  </span>
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-bold tabular-nums text-white">
                    ⏱ {turnCountdown}s
                  </span>
                  <span className="ml-2 text-sm text-white/60">(HP terendah memilih lebih awal)</span>
                </p>
              ) : (
                <p className="text-lg font-medium text-[#22C55E]">Semua pemain telah memilih! Menyiapkan babak selanjutnya...</p>
              )}

              {iHavePicked && !allTurnsDone && <p className="text-sm font-medium text-white/50">Kamu sudah memilih. Menunggu pemain lain...</p>}
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
            !canPickAbility ? "pointer-events-none opacity-70" : "",
          )}
        >
          {abilities.map((ability) => {
            const isBeingPickedByBot = pickingAbilityId === ability.id;
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

        {/* Player Grid Container (Multiplayer only) */}
        {roomInfo?.max_player !== 1 && (
          <div className="relative mt-4 w-full overflow-visible rounded-2xl border border-white/10 bg-[#D9D9D9]/20 px-4 py-8 shadow-2xl backdrop-blur-md sm:px-8 lg:px-10">
            {/* Turn Badge Overlay */}
            {isMyTurn && !iHavePicked ? (
              <div className="absolute -top-5 left-1/2 z-30 flex w-full max-w-[400px] -translate-x-1/2 items-center justify-center px-4">
                <div className="relative flex h-auto w-full items-center justify-center">
                  <NextImage
                    src="/dashboard/trophy-badge.webp"
                    alt="Badge Background"
                    width={400}
                    height={70}
                    className="-z-10 block h-full w-full object-contain drop-shadow-xl"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8">
                    <span className="text-center text-xs font-bold uppercase leading-tight text-white drop-shadow-md sm:text-sm md:text-base">
                      Sekarang giliran kamu untuk memilih kekuatan!
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-5 items-start justify-items-center gap-x-3 gap-y-12 md:grid-cols-8 md:gap-x-5 md:gap-y-16 lg:grid-cols-10">
              {players.map((player, idx) => {
                const isActiveTurn = currentTurnIndex === idx;
                const hasPicked = pickedPlayerIds.includes(player.id) || idx < currentTurnIndex;

                return (
                  <div key={`${player.id}-${idx}`} className="w-full">
                    <PlayerGridCard
                      player={player}
                      hideHealthBar={true}
                      highlight={player.isMe ? "self" : undefined}
                      hasPicked={hasPicked}
                      isActiveTurn={isActiveTurn && !allTurnsDone}
                      progress={isActiveTurn && !allTurnsDone ? progress : 0}
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
