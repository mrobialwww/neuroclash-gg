"use client";

import React, { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { MainButton } from "@/components/common/MainButton";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerList } from "@/components/match/PlayerList";
import { BuffList } from "@/components/match/BuffList";
import { PlayerCard } from "@/components/match/PlayerCard";
import { MOCK_PLAYERS } from "@/lib/constants/players";

import { useMatchStore, SECONDS_PER_ROUND } from "@/store/useMatchStore";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const gameRoomId = params.room_id as string;
  const roomCodeQuery = searchParams.get("code") ?? gameRoomId;
  const initialRound = parseInt(searchParams.get("nextRound") ?? "1", 10);
  // user_game_id passed from lobby so we can delete on exit
  const userGameId = searchParams.get("ugid") ?? null;

  const {
    roomCode,
    roomInfo,
    currentOrder,
    totalQuestions,
    currentQuestion,
    isLoadingQuestion,
    selectedAnswerId,
    isFinished,
    timeLeft,
    me,
    opponent,
    nextRoundUrl,
    initializeMatch,
    handleSelectAnswer,
    decrementTimer,
  } = useMatchStore();

  const activeStepIndex = ((currentOrder - 1) % 5) + 1;
  const isSolo = roomInfo?.max_player === 1;

  // 1. Initialize Match Room Data
  useEffect(() => {
    initializeMatch(roomCodeQuery, gameRoomId, initialRound);
  }, [initializeMatch, roomCodeQuery, gameRoomId, initialRound]);

  // Navigation Guard: prevent accidental back-button exit
  useEffect(() => {
    // Push a duplicate history entry so back() stays on this page
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      // Re-push to trap the user on this page
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

  // 2. Local Timer execution loop
  useEffect(() => {
    if (isLoadingQuestion || isFinished || selectedAnswerId) return;

    const timer = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isLoadingQuestion,
    isFinished,
    selectedAnswerId,
    decrementTimer,
  ]);

  // 3. Answer Action Dispatcher
  const onSelectAnswer = (answerId: string) => {
    const userId = me?.id ? String(me.id) : "guest";
    handleSelectAnswer(userId, answerId);
  };

  // Exit handler: clean up user_game record then navigate
  const handleExit = async () => {
    if (userGameId) {
      try {
        await fetch(`/api/user-game/leave/${userGameId}`, { method: "DELETE" });
      } catch {
        // Best-effort cleanup, ignore errors
      }
    }
    router.push("/dashboard");
  };

  // Tampilan ketika Loading Data (awal)
  if (isLoadingQuestion && !currentQuestion) {
    return (
      <main className="min-h-screen w-full bg-[#0B0D14] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3D79F3] border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-semibold animate-pulse">
          Memuat Arena...
        </p>
      </main>
    );
  }

  // Tampilan Layar Kemenangan / Selesai
  if (isFinished) {
    return (
      <main className="min-h-screen w-full bg-[#0B0D14] flex flex-col items-center justify-center space-y-6 px-4">
        <p className="text-5xl">🏆</p>
        <h1 className="text-white text-3xl font-extrabold text-center">
          Quiz Selesai!
        </h1>
        <p className="text-white/60 text-lg text-center">
          Kamu telah menyelesaikan semua {totalQuestions ?? currentOrder - 1}{" "}
          soal.
        </p>
        <MainButton
          variant="green"
          hasShadow
          className="px-10 py-4 text-lg font-bold rounded-xl"
          onClick={() => router.push("/dashboard")}
        >
          Kembali ke Dashboard
        </MainButton>
      </main>
    );
  }

  // Tampilan Game / Arena Utama
  return (
    <main className="min-h-screen w-full px-4 sm:px-8 md:px-12 py-6 gap-4 flex flex-col items-center overflow-x-hidden">
      {/* Header Info */}
      <header className="w-full max-w-[1400px] flex items-center justify-between mb-2">
        <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-2 md:px-4 lg:px-6 py-1.5 rounded-lg font-semibold text-white text-sm md:text-base">
          {roomCode}
        </div>

        <div className="flex-1 block px-2 md:px-4 lg:px-10">
          <MatchProgressBar
            key={`round-${currentOrder}`}
            duration={SECONDS_PER_ROUND}
            timeLeft={timeLeft}
            activeStepIndex={activeStepIndex}
          />
        </div>

        <MainButton
          variant="white"
          className="px-2 md:px-4 lg:px-6 h-8 lg:h-9 text-sm md:text-base shrink-0"
          onClick={handleExit}
        >
          Keluar
        </MainButton>
      </header>

      {/* Round indicator */}
      <p className="text-white/50 text-sm font-medium">
        Soal {currentOrder}
        {totalQuestions ? ` / ${totalQuestions}` : ""}
      </p>

      {/* Arena Wrapper */}
      <div className="flex-1 w-full flex justify-center items-start">
        <div className="w-full max-w-[1400px] grid grid-cols-2 lg:grid-cols-[210px_minmax(600px,1fr)_210px] gap-x-4 gap-y-6 md:gap-6 items-stretch">
          {/* My Player Card / Kiri */}
          <div className="order-1 lg:order-1 flex flex-col justify-start lg:justify-between self-stretch">
            <div className="hidden lg:block max-h-[320px] overflow-hidden">
              <BuffList className="h-full" />
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              {me && <PlayerCard player={me} isMe={true} className="w-full" />}
            </div>
          </div>

          {/* Opponent Player Card / Kanan */}
          <div className="order-2 lg:order-3 flex flex-col justify-start lg:justify-between items-end lg:items-stretch self-stretch">
            <div className="hidden lg:block max-h-[320px] overflow-hidden">
              <PlayerList players={MOCK_PLAYERS} className="h-full" />
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              {opponent && (
                <PlayerCard
                  player={opponent}
                  isMe={false}
                  hideHealthBar={isSolo}
                  className="w-full"
                />
              )}
            </div>
          </div>

          {/* Kolom Tengah Utama — Area Pertanyaan */}
          <div className="col-span-2 lg:col-span-1 order-3 lg:order-2 flex flex-col mt-2 lg:mt-0 isolate">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion.question_text}
                options={currentQuestion.options}
                onSelect={onSelectAnswer}
                selectedId={selectedAnswerId}
                className="w-full h-auto"
              />
            )}
          </div>

          {/* Mobile Layout — List Buff dan Lawan pindah ke bawah */}
          <div className="order-4 lg:hidden col-span-1">
            <BuffList className="w-full h-[200px] sm:h-[240px]" />
          </div>

          <div className="order-5 lg:hidden col-span-1">
            <PlayerList
              players={MOCK_PLAYERS}
              className="w-full h-[200px] sm:h-[240px]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
