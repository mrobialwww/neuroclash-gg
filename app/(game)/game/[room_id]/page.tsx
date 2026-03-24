"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { MainButton } from "@/components/common/MainButton";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerList } from "@/components/match/PlayerList";
import { BuffList } from "@/components/match/BuffList";
import { PlayerCard } from "@/components/match/PlayerCard";

import {
  useMatchStore,
  SECONDS_PER_ROUND,
  STARBOX_INTERVAL,
} from "@/store/useMatchStore";
import { quizRepository } from "@/repository/quizRepository";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const gameRoomId = params.room_id as string;
  const roomCodeQuery = searchParams.get("code") ?? gameRoomId;
  const initialRound = parseInt(searchParams.get("nextRound") ?? "1", 10);
  const userGameId = searchParams.get("ugid") ?? null;

  const {
    roomCode,
    roomInfo,
    currentOrder,
    totalQuestions,
    currentQuestion,
    isLoadingQuestion,
    selectedAnswerId,
    isSubmitting,
    isFinished,
    timeLeft,
    players,
    currentUser,
    currentBattleRoom,
    opponentIds,
    firstAnswerPlayerId,
    firstAnswerId,
    nextRoundUrl,
    error,
    initializeMatch,
    handleSelectAnswer,
    decrementTimer,
    isOpponent,
    canAnswer,
  } = useMatchStore();

  const activeStepIndex = ((currentOrder - 1) % STARBOX_INTERVAL) + 1;
  const isSolo = roomInfo?.max_player === 1;

  // 1. Initialize Match Room Data
  useEffect(() => {
    initializeMatch(roomCodeQuery, gameRoomId, initialRound);
  }, [initializeMatch, roomCodeQuery, gameRoomId, initialRound]);

  // Handle Error (Ongoing room or not found)
  useEffect(() => {
    if (error) {
      alert(error);
      router.push("/dashboard");
    }
  }, [error, router]);

  // Navigation Guard
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle Async Navigation
  useEffect(() => {
    if (nextRoundUrl) {
      router.push(nextRoundUrl);
      useMatchStore.setState({ nextRoundUrl: null });
    }
  }, [nextRoundUrl, router]);

  // 2. Local Timer
  useEffect(() => {
    if (isLoadingQuestion || isFinished || error) return;

    const timer = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoadingQuestion, isFinished, decrementTimer, error, timeLeft]);

  // 3. Mapping Players for UI
  const { meCard, opponentCard, sortedForList } = useMemo(() => {
    const meData = players.find((p) => p.id === currentUser?.id);
    const others = players.filter((p) => p.id !== currentUser?.id);

    // Gunakan opponentIds dari battle room untuk menentukan lawan
    // Hanya player yang ada di battle room yang sama yang menjadi lawan
    const battleOpponents = opponentIds
      .map((oppId) => players.find((p) => p.id === oppId))
      .filter((p): p is (typeof players)[0] => p !== undefined);

    console.log(
      `[GamePage] Current battle room opponents:`,
      battleOpponents.map((p) => ({ id: p.id.substring(0, 8), name: p.name }))
    );

    // Identitas Lawan: Ambil lawan pertama dari battle room
    const enemyData = battleOpponents.length > 0 ? battleOpponents[0] : null;

    const mapToCard = (p: any) =>
      p
        ? {
            id: p.id,
            name: p.name,
            character: p.character || "Slime",
            image: p.avatar,
            health: p.health,
            maxHealth: 100,
          }
        : null;

    return {
      meCard: mapToCard(meData),
      opponentCard: mapToCard(enemyData),
      sortedForList: players.map((p) => ({
        id: p.id,
        name: p.name,
        character: p.character || "Slime",
        image: p.avatar,
        health: p.health,
        maxHealth: 100,
        isMe: p.id === currentUser?.id,
        isOpponent: opponentIds.includes(p.id),
      })),
    };
  }, [players, currentUser, opponentIds]);

  // 4. Answer Action Dispatcher
  const onSelectAnswer = (answerId: string) => {
    if (!currentUser) return;
    handleSelectAnswer(currentUser.id, answerId);
  };

  // Exit handler
  const handleExit = async () => {
    if (userGameId) {
      await quizRepository.deleteLeaveRoom(userGameId);
    }
    router.push("/dashboard");
  };

  // Tampilan ketika Loading Data
  if (isLoadingQuestion && !currentQuestion && !error) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-[#0B0D14]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent" />
        <p className="animate-pulse text-lg font-semibold text-white">
          Memuat Arena...
        </p>
      </main>
    );
  }

  // Tampilan Layar Kemenangan / Selesai
  if (isFinished) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center space-y-6 bg-[#0B0D14] px-4">
        <p className="text-5xl">🏆</p>
        <h1 className="text-center text-3xl font-extrabold text-white">
          Quiz Selesai!
        </h1>
        <p className="text-center text-lg text-white/60">
          Kamu telah menyelesaikan semua {totalQuestions ?? currentOrder - 1}{" "}
          soal.
        </p>
        <MainButton
          variant="green"
          hasShadow
          className="rounded-xl px-10 py-4 text-lg font-bold"
          onClick={() => router.push("/dashboard")}
        >
          Kembali ke Dashboard
        </MainButton>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center gap-4 overflow-x-hidden px-4 py-6 sm:px-8 md:px-12">
      {/* Header Info */}
      <header className="mb-2 flex w-full max-w-[1400px] items-center justify-between">
        <div className="rounded-lg bg-[#A6A6A6]/40 px-2 py-1.5 text-sm font-semibold text-white backdrop-blur-xl md:px-4 md:text-base lg:px-6">
          {roomCode}
        </div>

        <div className="block flex-1 px-2 md:px-4 lg:px-10">
          <MatchProgressBar
            key={`round-${currentOrder}`}
            duration={SECONDS_PER_ROUND}
            timeLeft={timeLeft}
            activeStepIndex={activeStepIndex}
          />
        </div>

        <MainButton
          variant="white"
          className="h-8 shrink-0 px-2 text-sm md:px-4 md:text-base lg:h-9 lg:px-6"
          onClick={handleExit}
        >
          Keluar
        </MainButton>
      </header>

      {/* Round indicator */}
      <p className="text-sm font-medium text-white/50">
        Soal {currentOrder}
        {totalQuestions ? ` / ${totalQuestions}` : ""}
      </p>

      {/* Arena Wrapper */}
      <div className="flex w-full flex-1 items-start justify-center">
        <div className="grid w-full max-w-[1400px] grid-cols-2 items-stretch gap-x-4 gap-y-6 md:gap-6 lg:grid-cols-[210px_minmax(600px,1fr)_210px]">
          {/* My Player Card / Kiri */}
          <div className="order-1 flex flex-col justify-start self-stretch lg:order-1 lg:justify-between">
            <div className="hidden max-h-[320px] overflow-hidden lg:block">
              <BuffList className="h-full" />
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              {meCard && (
                <PlayerCard
                  player={meCard as any}
                  isMe={true}
                  className="w-full"
                />
              )}
            </div>
          </div>

          {/* Opponent Player Card / Kanan */}
          <div className="order-2 flex flex-col items-end justify-start self-stretch lg:order-3 lg:items-stretch lg:justify-between">
            <div className="hidden max-h-[320px] overflow-hidden lg:block">
              <PlayerList players={sortedForList as any} className="h-full" />
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              {opponentCard && (
                <PlayerCard
                  player={opponentCard as any}
                  isMe={false}
                  hideHealthBar={isSolo}
                  className="w-full"
                />
              )}
            </div>
          </div>

          {/* Kolom Tengah Utama — Area Pertanyaan */}
          <div className="isolate order-3 col-span-2 mt-2 flex flex-col lg:order-2 lg:col-span-1 lg:mt-0">
            {currentQuestion && (
              <>
                {firstAnswerPlayerId && (
                  <div className="mb-4 text-center font-semibold text-yellow-400">
                    {players.find((p) => p.id === firstAnswerPlayerId)?.name}{" "}
                    menjawab pertama!
                  </div>
                )}
                <QuestionCard
                  question={currentQuestion.question_text}
                  options={currentQuestion.options}
                  onSelect={onSelectAnswer}
                  selectedId={selectedAnswerId}
                  disabled={canAnswer() === false}
                  canAnswer={canAnswer}
                  firstAnswerId={firstAnswerId}
                  className="h-auto w-full"
                />
              </>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="order-4 col-span-1 lg:hidden">
            <BuffList className="h-[200px] w-full sm:h-[240px]" />
          </div>

          <div className="order-5 col-span-1 lg:hidden">
            <PlayerList
              players={sortedForList as any}
              className="h-[200px] w-full sm:h-[240px]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
