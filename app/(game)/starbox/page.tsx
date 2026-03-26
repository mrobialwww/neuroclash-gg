"use client";

import React, { useEffect, useCallback, useRef } from "react";
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

  const {
    roomInfo,
    players,
    abilities,
    pickingAbilityId,
    isLoading,
    isHost,
    myPlayerId,
    pickedPlayerIds,
    serverStartTime,
    initGameData,
    selectAbility,
    autoAssignRemaining,
    cleanup,
    currentTurnIndex,
    reset,
  } = useStarboxStore();

  // 1. Initial Data Fetching
  // nextRound dipakai sebagai kunci fase Starbox (Strategi 3 – Phase Checking)
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

  // 2. Computed values are dynamic based on timeline now (see below)
  const iHavePicked = myPlayerId ? pickedPlayerIds.includes(myPlayerId) : false;

  // 4. Progress Bar Timer based on Absolute Server Timeline
  const [now, setNow] = React.useState<number>(Date.now());
  const autoAssignDone = useRef(false);

  // Update 'now' to drive the timeline driven by global server start time
  useEffect(() => {
    if (!serverStartTime || autoAssignDone.current) return;

    // Fast interval; if backgrounded, browser throttles to ~1s, which is fine!
    const interval = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(interval);
  }, [serverStartTime]);

  // Timeline Mathematics
  const COUNTDOWN_MS = 3000;
  const TURN_MS = 4000;
  const elapsed = serverStartTime ? Math.max(0, now - serverStartTime) : 0;

  const initialCountdown = serverStartTime ? Math.max(0, Math.ceil((COUNTDOWN_MS - elapsed) / 1000)) : 3;
  const isCountdownPhase = elapsed < COUNTDOWN_MS;
  const turnElapsed = isCountdownPhase ? 0 : elapsed - COUNTDOWN_MS;

  const computedTurnIndex = isCountdownPhase ? 0 : Math.min(players.length, Math.floor(turnElapsed / TURN_MS));
  const progress = isCountdownPhase || computedTurnIndex >= players.length ? 0 : ((turnElapsed % TURN_MS) / TURN_MS) * 100;
  const allTurnsDone = computedTurnIndex >= players.length;

  const isMyTurn = roomInfo?.max_player !== 1 && computedTurnIndex < players.length && !!players[computedTurnIndex]?.isMe && !isCountdownPhase;

  // 3. User Click Handler
  const handleUserClickAbility = useCallback(
    (abilityId: string) => {
      const totalStock = abilities.reduce((sum, a) => sum + a.stock, 0);
      if (totalStock <= 0 || pickingAbilityId) return;

      if (roomInfo?.max_player === 1) {
        // Solo mode -> instant pick & straight to next round
        selectAbility(roomId, abilityId, players[computedTurnIndex].id);
        setTimeout(() => {
          handleNextRound();
        }, 800);
        return;
      }

      // Multi-player mode: can only pick during my turn and if I haven't picked
      if (isMyTurn && !iHavePicked) {
        selectAbility(roomId, abilityId, players[computedTurnIndex].id);
      }
    },
    [abilities, pickingAbilityId, roomInfo, roomId, players, computedTurnIndex, selectAbility, handleNextRound, isMyTurn, iHavePicked],
  );

  const remainingItems = abilities.reduce((sum, a) => sum + a.stock, 0);
  const activeStepIndex = 6;

  // 5. All turns done → host auto-assigns remaining items to unpicked players and restocks!
  useEffect(() => {
    if (!allTurnsDone || isLoading || !roomInfo || autoAssignDone.current) return;

    autoAssignDone.current = true;

    if (isHost) {
      import("@/repository/abilityRoomRepository").then(({ abilityRoomRepository }) => {
        autoAssignRemaining(roomId).then(async () => {
          // Restock explicitly acting as host at the end of the phase
          await abilityRoomRepository.initialAbilites(roomId, players.length, true);
          // Wait a bit for DB sync before navigating
          setTimeout(() => {
            handleNextRound();
          }, 1500);
        });
      });
    } else {
      // Non-host: just wait a bit and navigate
      setTimeout(() => {
        handleNextRound();
      }, 2500);
    }
  }, [allTurnsDone, isLoading, roomInfo, isHost, roomId, autoAssignRemaining, handleNextRound, players.length]);

  // Determine if ability card should be clickable
  const canPickAbility = initialCountdown <= 0 && (roomInfo?.max_player === 1 || (isMyTurn && !iHavePicked && !pickingAbilityId));

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
          <h1 className="text-balance text-xl font-bold tracking-tight text-white drop-shadow-lg md:text-2xl lg:text-3xl">
            Takdir ada di tanganmu, pilih satu kekuatan!
          </h1>

          {roomInfo?.max_player !== 1 && (
            <div className="mt-2 flex flex-col items-center gap-2">
              {computedTurnIndex < players.length ? (
                <p className="text-lg font-medium text-white/80">
                  Giliran:{" "}
                  <span className={players[computedTurnIndex]?.isMe ? "text-[#22C55E]" : "text-[#FFCB66]"}>
                    {players[computedTurnIndex]?.isMe ? "Kamu" : players[computedTurnIndex]?.name}
                  </span>
                  <span className="ml-2 text-sm text-white/60">(HP terendah memilih lebih awal)</span>
                </p>
              ) : (
                <p className="text-lg font-medium text-[#22C55E]">Semua pemain telah memilih! Menyiapkan babak selanjutnya...</p>
              )}

              {/* Show "Kamu sudah memilih" if picked but turns still going */}
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
            {initialCountdown > 0 ? (
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
                      Bersiap-siap... {initialCountdown}
                    </span>
                  </div>
                </div>
              </div>
            ) : isMyTurn && !iHavePicked ? (
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
                const isActiveTurn = computedTurnIndex === idx;
                const hasPicked = pickedPlayerIds.includes(player.id) || idx < computedTurnIndex;

                return (
                  <div key={`${player.id}-${idx}`} className="w-full">
                    <PlayerGridCard
                      player={player}
                      hideHealthBar={true}
                      highlight={player.isMe ? "self" : undefined}
                      hasPicked={hasPicked}
                      isActiveTurn={isActiveTurn && !allTurnsDone}
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
