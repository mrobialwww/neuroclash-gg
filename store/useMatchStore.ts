import { create } from "zustand";
import { quizService, QuizQuestion } from "@/services/quizService";
import { gameService } from "@/services/gameService";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { PlayerMatchState } from "@/types/Quiz";
import { createClient } from "@/lib/supabase/client";
import { userClientService } from "@/services/auth/userClientService";

const supabase = createClient();

export const SECONDS_PER_ROUND = 30;
export const STARBOX_INTERVAL = 5;
export const INITIAL_ROUND = 1;

export interface MatchState {
  roomCode: string;
  gameRoomId: string;
  roomInfo: GameRoomWithPlayerCount | null;
  currentOrder: number;
  totalQuestions: number | null;
  currentQuestion: QuizQuestion | null;
  isLoadingQuestion: boolean;
  selectedAnswerId: string | null;
  isSubmitting: boolean;
  isFinished: boolean;
  timeLeft: number;
  players: PlayerMatchState[];
  currentUser: { id: string; username: string; avatar: string } | null;
  nextRoundUrl: string | null;
  error: string | null;

  initializeMatch: (
    roomCode: string,
    gameRoomId: string,
    initialRound: number
  ) => Promise<void>;
  loadQuestion: (gameRoomId: string, order: number) => Promise<void>;
  advanceRound: () => void;
  handleSelectAnswer: (userId: string, answerId: string) => Promise<void>;
  decrementTimer: () => void;
  resetMatch: () => void;
  syncPlayersFromDB: (roomId: string) => Promise<void>;
  setupRealtimeSubscription: (roomId: string) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  roomCode: "",
  gameRoomId: "",
  roomInfo: null,
  currentOrder: 1,
  totalQuestions: null,
  currentQuestion: null,
  isLoadingQuestion: true,
  selectedAnswerId: null,
  isSubmitting: false,
  isFinished: false,
  timeLeft: SECONDS_PER_ROUND,
  players: [],
  currentUser: null,
  nextRoundUrl: null,
  error: null,

  initializeMatch: async (roomCode, gameRoomId, initialRound) => {
    set({ isLoadingQuestion: true, error: null });

    try {
      // 1. Get Room Info first
      const room = await gameService.getGameRoomConfig(roomCode, gameRoomId);
      if (!room) {
        set({
          error: "Room tidak ditemukan atau sudah tidak aktif.",
          isLoadingQuestion: false,
        });
        return;
      }

      // Check Playing Status (Guard)
      if (room.room_status === "playing" && initialRound === INITIAL_ROUND) {
        set({
          error:
            "Arena sudah dimulai. Kamu tidak bisa bergabung di tengah pertandingan.",
          isLoadingQuestion: false,
        });
        return;
      }

      // 2. Get current user
      const user = await userClientService.getCurrentUserNavbarData();
      if (user) {
        set({ currentUser: user });
      }

      set({
        roomCode,
        gameRoomId,
        roomInfo: room,
        totalQuestions: room.total_question || null,
        currentOrder: initialRound,
        timeLeft: SECONDS_PER_ROUND,
      });

      // 3. Sync Players & Start Subscriptions
      await get().syncPlayersFromDB(gameRoomId);
      get().setupRealtimeSubscription(gameRoomId);
      await get().loadQuestion(gameRoomId, initialRound);
    } catch (err) {
      console.error("Failed to initialize match:", err);
      set({ error: "Gagal memuat arena.", isLoadingQuestion: false });
    }
  },

  syncPlayersFromDB: async (roomId) => {
    try {
      // API kembali ke flat (hanya kembalikan record user_games)
      const res = await fetch(`/api/user-game/participants/${roomId}`);
      if (!res.ok) return;

      const { data } = await res.json();
      const rawParticipants: any[] = data || [];

      // Resolve player details (username & character) for each raw ID
      const playerPromises = rawParticipants.map(async (raw) => {
        const details = await userClientService.getUserMatchData(raw.user_id);
        return {
          id: raw.user_id,
          name: details?.username || "Pemain",
          avatar: details?.avatar || "/default/Slime.webp",
          character: details?.character || "Slime",
          health: raw.health ?? 100,
          is_alive: (raw.health ?? 100) > 0,
          score: 0,
        } as PlayerMatchState;
      });

      const players = await Promise.all(playerPromises);

      // Sort by Health (Highest first)
      players.sort((a, b) => b.health - a.health);

      set({ players });
    } catch (err) {
      console.error("Failed to sync players:", err);
    }
  },

  setupRealtimeSubscription: (roomId) => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_games",
          filter: `game_room_id=eq.${roomId}`,
        },
        async () => {
          await get().syncPlayersFromDB(roomId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_answers",
        },
        async () => {
          // Optional: handle answer events in UI
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  loadQuestion: async (roomId, order) => {
    set({
      isLoadingQuestion: true,
      selectedAnswerId: null,
      timeLeft: SECONDS_PER_ROUND,
      nextRoundUrl: null,
    });

    const question = await quizService.getQuestionWithAnswers(roomId, order);

    if (!question) {
      set({ isFinished: true, isLoadingQuestion: false });
    } else {
      set({ currentQuestion: question, isLoadingQuestion: false });
    }
  },

  advanceRound: () => {
    const state = get();
    if (state.totalQuestions && state.currentOrder >= state.totalQuestions) {
      set({ isFinished: true });
      return;
    }

    if (state.currentOrder % STARBOX_INTERVAL === 0) {
      set({
        nextRoundUrl: `/starbox?roomId=${state.gameRoomId}&code=${
          state.roomCode
        }&nextRound=${state.currentOrder + 1}`,
      });
      return;
    }

    const nextOrder = state.currentOrder + 1;
    set({ currentOrder: nextOrder });
    get().loadQuestion(state.gameRoomId, nextOrder);
  },

  handleSelectAnswer: async (userId, answerId) => {
    const state = get();
    if (state.selectedAnswerId || state.isSubmitting) return;

    set({ selectedAnswerId: answerId, isSubmitting: true });

    try {
      await quizService.submitAnswer(userId, answerId);
    } catch (e) {
      console.error("Gagal submit answer:", e);
    }

    set({ isSubmitting: false });

    // Transition delay to let user see feedback before advancing
    const TRANSITION_DELAY_MS = 1500;
    setTimeout(() => {
      get().advanceRound();
    }, TRANSITION_DELAY_MS);
  },

  decrementTimer: () => {
    const {
      timeLeft,
      isLoadingQuestion,
      isFinished,
      selectedAnswerId,
      advanceRound,
    } = get();

    if (isLoadingQuestion || isFinished || selectedAnswerId) return;

    if (timeLeft <= 1) {
      set({ timeLeft: 0 });
      advanceRound();
      return;
    }

    set((state) => ({ timeLeft: state.timeLeft - 1 }));
  },

  resetMatch: () => {
    set({
      roomCode: "",
      gameRoomId: "",
      roomInfo: null,
      currentOrder: 1,
      totalQuestions: null,
      currentQuestion: null,
      isLoadingQuestion: true,
      selectedAnswerId: null,
      isSubmitting: false,
      isFinished: false,
      timeLeft: SECONDS_PER_ROUND,
      players: [],
      currentUser: null,
      nextRoundUrl: null,
      error: null,
    });
  },
}));
