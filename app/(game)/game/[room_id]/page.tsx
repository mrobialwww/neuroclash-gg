"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { MainButton } from "@/components/common/MainButton";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerList } from "@/components/match/PlayerList";
import { BuffList } from "@/components/match/BuffList";
import { PlayerCard } from "@/components/match/PlayerCard";
import { EliminationOverlay } from "@/components/game/EliminationOverlay";

import {
  useMatchStore,
  SECONDS_PER_ROUND,
  STARBOX_INTERVAL,
} from "@/store/useMatchStore";
import { quizRepository } from "@/repository/quizRepository";
import { createClient } from "@/lib/supabase/client";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const gameRoomId = params.room_id as string;
  const roomCodeQuery = searchParams.get("code") ?? gameRoomId;
  const initialRound = parseInt(searchParams.get("nextRound") ?? "1", 10);
  const userGameId = searchParams.get("ugid") ?? null;

  // Elimination overlay state
  const [showEliminationOverlay, setShowEliminationOverlay] = useState(false);
  const [eliminationData, setEliminationData] = useState<{
    placement: number;
    win: number;
    lose: number;
    trophyWon: number;
    coinsEarned: number;
    survivalTime: string;
    isWinner: boolean;
  } | null>(null);
  const [hasShownOverlay, setHasShownOverlay] = useState(false);
  const [isLoadingEliminationData, setIsLoadingEliminationData] =
    useState(false);

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
    isWaitingForAllBattles,
    lastAnswerCorrect,
    correctAnswerId,
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

  // Check if current user died and show elimination overlay
  const checkElimination = useCallback(async () => {
    if (!currentUser || !gameRoomId || hasShownOverlay || isSolo) return;
    if (isLoadingEliminationData) return;

    const currentPlayer = players.find((p) => p.id === currentUser.id);

    // Check if player is dead
    if (currentPlayer && !currentPlayer.is_alive && currentPlayer.health <= 0) {
      try {
        setIsLoadingEliminationData(true);
        const supabase = createClient();

        // Show loading state, then fetch data after delay to ensure user_games is updated
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Calculate placement based on elimination order from game_players
        const { data: allPlayers } = await supabase
          .from("game_players")
          .select("user_id, status, eliminated_at")
          .eq("game_room_id", gameRoomId)
          .order("eliminated_at", { ascending: true, nullsFirst: false });

        const totalPlayers = allPlayers?.length || 0;
        const myIndex =
          allPlayers?.findIndex((p) => p.user_id === currentUser.id) ?? 0;
        const placement = totalPlayers - myIndex;

        // Get user_games data for stats (should be updated by now)
        const { data: userGameData, error: userGameError } = await supabase
          .from("user_games")
          .select("win, lose, trophy_won, coins_earned, created_at, updated_at")
          .eq("game_room_id", gameRoomId)
          .eq("user_id", currentUser.id)
          .single();

        console.log("[GamePage] user_games data:", userGameData);
        if (userGameError) {
          console.error("[GamePage] Error fetching user_games:", userGameError);
        }

        // Calculate survival time
        let survivalTime = "00:00";
        if (userGameData?.created_at && userGameData?.updated_at) {
          const createdAt = new Date(userGameData.created_at).getTime();
          const updatedAt = new Date(userGameData.updated_at).getTime();
          const diffSeconds = Math.floor((updatedAt - createdAt) / 1000);
          const minutes = Math.floor(diffSeconds / 60);
          const seconds = diffSeconds % 60;
          survivalTime = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        }

        setEliminationData({
          placement,
          win: userGameData?.win || 0,
          lose: userGameData?.lose || 0,
          trophyWon: userGameData?.trophy_won || 0,
          coinsEarned: userGameData?.coins_earned || 0,
          survivalTime,
          isWinner: placement === 1,
        });

        setShowEliminationOverlay(true);
        setHasShownOverlay(true);
        setIsLoadingEliminationData(false);
      } catch (err) {
        console.error("Error fetching elimination data:", err);
        setIsLoadingEliminationData(false);
      }
    }
  }, [
    currentUser,
    gameRoomId,
    hasShownOverlay,
    isSolo,
    players,
    isLoadingEliminationData,
  ]);

  useEffect(() => {
    checkElimination();
  }, [checkElimination, players]);

  // Fetch elimination data when game is finished (for end screen)
  const fetchEndGameData = useCallback(async () => {
    if (!currentUser || !gameRoomId || eliminationData) return;

    try {
      const supabase = createClient();

      // Get user_games data for stats
      const { data: userGameData } = await supabase
        .from("user_games")
        .select("win, lose, trophy_won, coins_earned, created_at, updated_at")
        .eq("game_room_id", gameRoomId)
        .eq("user_id", currentUser.id)
        .single();

      // Calculate survival time
      let survivalTime = "00:00";
      if (userGameData?.created_at && userGameData?.updated_at) {
        const createdAt = new Date(userGameData.created_at).getTime();
        const updatedAt = new Date(userGameData.updated_at).getTime();
        const diffSeconds = Math.floor((updatedAt - createdAt) / 1000);
        const minutes = Math.floor(diffSeconds / 60);
        const seconds = diffSeconds % 60;
        survivalTime = `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }

      // Calculate placement based on elimination order
      const { data: allPlayers } = await supabase
        .from("game_players")
        .select("user_id, status, eliminated_at")
        .eq("game_room_id", gameRoomId)
        .order("eliminated_at", { ascending: true, nullsFirst: false });

      const totalPlayers = allPlayers?.length || 0;
      const myIndex =
        allPlayers?.findIndex((p) => p.user_id === currentUser.id) ?? 0;
      const placement = totalPlayers - myIndex;

      setEliminationData({
        placement,
        win: userGameData?.win || 0,
        lose: userGameData?.lose || 0,
        trophyWon: userGameData?.trophy_won || 0,
        coinsEarned: userGameData?.coins_earned || 0,
        survivalTime,
        isWinner: placement === 1,
      });
    } catch (err) {
      console.error("Error fetching end game data:", err);
    }
  }, [currentUser, gameRoomId, eliminationData]);

  useEffect(() => {
    if (isFinished && !eliminationData) {
      fetchEndGameData();
    }
  }, [isFinished, fetchEndGameData, eliminationData]);

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
    const battleOpponents = opponentIds
      .map((oppId) => players.find((p) => p.id === oppId))
      .filter((p): p is (typeof players)[0] => p !== undefined);

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

    // Prof. Bubu card untuk Solo mode (lawan)
    const profBubuCard = isSolo
      ? {
          id: "prof-bubu",
          name: "Prof. Bubu",
          character: "Prof. Bubu",
          image: "/mascot/mascot-match.webp",
          health: 100,
          maxHealth: 100,
        }
      : null;

    // Solo fallback: jika players belum terisi, gunakan data currentUser
    const soloMeCard =
      isSolo && !meData && currentUser
        ? {
            id: currentUser.id,
            name: currentUser.username,
            character: currentUser.character,
            image: currentUser.avatar || "/default/slime.webp",
            health: 100,
            maxHealth: 100,
          }
        : null;

    return {
      meCard: mapToCard(meData) ?? soloMeCard,
      opponentCard: isSolo ? profBubuCard : mapToCard(enemyData),
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
  }, [players, currentUser, opponentIds, isSolo]);

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

  // Tampilan ketika Menunggu Semua Battle Room Selesai
  if (isWaitingForAllBattles && !error) {
    return (
      <div className="fixed inset-0 z-50 flex min-h-screen w-full flex-col items-center justify-center space-y-6 bg-[#0B0D14]/95 backdrop-blur-sm">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent" />
        <div className="space-y-2 text-center">
          <p className="animate-pulse text-2xl font-bold text-white">
            Menunggu semua pertempuran selesai...
          </p>
          <p className="text-white/60">
            Ronde {currentOrder} akan segera berakhir
          </p>
        </div>
      </div>
    );
  }

  // Tampilan Layar Kemenangan / Selesai
  if (isFinished) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center space-y-6 bg-[#0B0D14] px-4">
        {/* Icon */}
        <p className="text-5xl">{eliminationData?.isWinner ? "🏆" : "🎮"}</p>

        {/* Title */}
        <h1 className="text-center text-3xl font-extrabold text-white">
          {eliminationData?.isWinner ? "SELAMAT!" : "Quiz Selesai!"}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-lg text-white/60">
          {eliminationData?.isWinner
            ? "Anda memenangkan pertandingan!"
            : `Kamu telah menyelesaikan semua ${
                totalQuestions ?? currentOrder - 1
              } soal.`}
        </p>

        {/* Stats Box */}
        {eliminationData && (
          <div className="w-full max-w-sm rounded-xl bg-white/5 p-4">
            <div className="grid grid-cols-4 gap-3">
              {/* Win */}
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-400">
                  {eliminationData.win}
                </span>
                <span className="mt-1 text-xs text-white/60">WIN</span>
              </div>

              {/* Lose */}
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-red-400">
                  {eliminationData.lose}
                </span>
                <span className="mt-1 text-xs text-white/60">LOSE</span>
              </div>

              {/* Trophy */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-2xl font-bold ${
                    eliminationData.trophyWon >= 0
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {eliminationData.trophyWon >= 0 ? "+" : ""}
                  {eliminationData.trophyWon}
                </span>
                <span className="mt-1 text-xs text-white/60">TROPHY</span>
              </div>

              {/* Coins */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-2xl font-bold ${
                    eliminationData.coinsEarned >= 0
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {eliminationData.coinsEarned >= 0 ? "+" : ""}
                  {eliminationData.coinsEarned}
                </span>
                <span className="mt-1 text-xs text-white/60">COINS</span>
              </div>
            </div>
          </div>
        )}

        {/* Survival Time */}
        {eliminationData && (
          <div className="flex items-center gap-2">
            <span className="text-white/60">Waktu Bertahan:</span>
            <span className="text-xl font-bold text-blue-400">
              {eliminationData.survivalTime}
            </span>
          </div>
        )}

        {/* Placement Badge */}
        {eliminationData && (
          <div
            className={`rounded-full px-6 py-2 ${
              eliminationData.isWinner
                ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                : eliminationData.placement === 2
                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                : eliminationData.placement === 3
                ? "bg-gradient-to-r from-amber-600 to-amber-700"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}
          >
            <span className="text-lg font-bold text-white">
              PERINGKAT {eliminationData.placement}
            </span>
          </div>
        )}

        {/* Back to Dashboard Button */}
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
            isSolo={isSolo}
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
          <div className="order-1 flex h-full flex-col justify-end gap-4 self-stretch lg:order-1">
            <div className="relative hidden min-h-[160px] flex-1 overflow-hidden lg:block">
              <div className="absolute inset-0">
                <BuffList className="h-full" />
              </div>
            </div>
            <div className="w-full max-w-[320px] shrink-0 lg:max-w-none">
              {meCard ? (
                <PlayerCard
                  player={meCard as any}
                  isMe={true}
                  className="w-full"
                />
              ) : (
                <div className="h-[90px] w-full" />
              )}
            </div>
          </div>

          {/* Opponent Player Card / Kanan */}
          <div className="order-2 flex h-full flex-col items-end justify-end gap-4 self-stretch lg:order-3 lg:items-stretch">
            <div className="relative hidden min-h-[160px] flex-1 overflow-hidden lg:block">
              <div className="absolute inset-0">
                {/* Always pass empty array for players in Solo to trigger the empty state text */}
                <PlayerList
                  players={isSolo ? [] : (sortedForList as any)}
                  className="h-full"
                />
              </div>
            </div>
            <div className="w-full max-w-[320px] shrink-0 lg:max-w-none">
              {opponentCard ? (
                <PlayerCard
                  player={opponentCard as any}
                  isMe={false}
                  hideHealthBar={isSolo}
                  className="w-full"
                />
              ) : (
                <div className="h-[90px] w-full" />
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
                  correctAnswerId={correctAnswerId}
                  lastAnswerCorrect={lastAnswerCorrect}
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

      {/* Elimination Overlay */}
      {(showEliminationOverlay || isLoadingEliminationData) && (
        <EliminationOverlay
          isOpen={showEliminationOverlay || isLoadingEliminationData}
          onClose={() => setShowEliminationOverlay(false)}
          placement={eliminationData?.placement || 0}
          win={eliminationData?.win || 0}
          lose={eliminationData?.lose || 0}
          trophyWon={eliminationData?.trophyWon || 0}
          coinsEarned={eliminationData?.coinsEarned || 0}
          survivalTime={eliminationData?.survivalTime || "00:00"}
          isWinner={eliminationData?.isWinner || false}
          isLoading={isLoadingEliminationData}
        />
      )}
    </main>
  );
}
