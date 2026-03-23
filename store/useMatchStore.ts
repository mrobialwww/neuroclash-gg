import { create } from "zustand";
import { quizService, QuizQuestion } from "@/services/quizService";
import { gameService } from "@/services/gameService";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { PlayerMatchState } from "@/types/quiz";
import { createClient } from "@/lib/supabase/client";
import { userClientService } from "@/services/auth/userClientService";

const supabase = createClient();

export const SECONDS_PER_ROUND = 30;
export const STARBOX_INTERVAL = 5;
export const INITIAL_ROUND = 1;

interface BattleRoom {
  battle_room_id: string;
  game_room_id: string;
  round_number: number;
  player1_id: string;
  player2_id: string;
  player3_id: string | null;
  question_id: string;
  first_answer_user_id: string | null;
  first_answer_id: string | null;
  status: "waiting" | "ongoing" | "finished" | "timeout";
  created_at: string;
  updated_at: string;
}

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
  currentBattleRoom: BattleRoom | null;
  opponentIds: string[];
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
  syncBattleRoomFromDB: () => Promise<void>;
  setupRealtimeSubscription: (roomId: string) => void;
  isOpponent: (playerId: string) => boolean;
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
  currentBattleRoom: null,
  opponentIds: [],
  nextRoundUrl: null,
  error: null,

  isOpponent: (playerId: string) => {
    return get().opponentIds.includes(playerId);
  },

  initializeMatch: async (roomCode, gameRoomId, initialRound) => {
    console.log(
      `[MatchStore] initializeMatch called: ${gameRoomId}, round: ${initialRound}`
    );
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

      console.log(`[MatchStore] Room status: ${room.room_status}`);

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

      // 4. Sync Battle Room for current user
      await get().syncBattleRoomFromDB();

      // 5. Load Question
      await get().loadQuestion(gameRoomId, initialRound);
    } catch (err) {
      console.error("Failed to initialize match:", err);
      set({ error: "Gagal memuat arena.", isLoadingQuestion: false });
    }
  },

  syncPlayersFromDB: async (roomId) => {
    console.log(`[MatchStore] syncPlayersFromDB START - roomId: ${roomId}`);

    try {
      const res = await fetch(`/api/match/participants/${roomId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[MatchStore] API error response text: ${errorText}`);
        return;
      }

      const { data } = await res.json();
      const players: PlayerMatchState[] = data || [];

      console.log(`[MatchStore] Synced ${players.length} players`);

      set({ players });
    } catch (err) {
      console.error("[MatchStore] Failed to sync players:", err);
    }
  },

  syncBattleRoomFromDB: async () => {
    const { gameRoomId, currentUser, currentOrder } = get();

    if (!gameRoomId || !currentUser) {
      console.log(
        "[MatchStore] Cannot sync battle room - missing gameRoomId or currentUser"
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/battle/my-room?game_room_id=${gameRoomId}&user_id=${currentUser.id}&round_number=${currentOrder}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[MatchStore] API error: ${errorText}`);
        set({ currentBattleRoom: null, opponentIds: [] });
        return;
      }

      const battleRoom: BattleRoom | null = await res.json();

      if (battleRoom) {
        const opponentIds = [
          battleRoom.player1_id,
          battleRoom.player2_id,
          battleRoom.player3_id,
        ].filter((id): id is string => id !== null && id !== currentUser.id);

        console.log(
          `[MatchStore] Synced battle room with opponents:`,
          opponentIds
        );

        set({
          currentBattleRoom: battleRoom,
          opponentIds,
        });
      } else {
        console.log(
          `[MatchStore] No battle room found for round ${currentOrder}`
        );
        set({ currentBattleRoom: null, opponentIds: [] });
      }
    } catch (err) {
      console.error("[MatchStore] Failed to sync battle room:", err);
      set({ currentBattleRoom: null, opponentIds: [] });
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
          table: "game_players",
          filter: `game_room_id=eq.${roomId}`,
        },
        async () => {
          await get().syncPlayersFromDB(roomId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battle_rooms",
          filter: `game_room_id=eq.${roomId}`,
        },
        async () => {
          // Sync battle room when updated
          await get().syncBattleRoomFromDB();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_rounds",
          filter: `game_room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Handle round changes
          if (payload.eventType === "UPDATE") {
            const { new: newRound, old: oldRound } = payload;
            if (
              oldRound.status === "waiting" &&
              newRound.status === "ongoing"
            ) {
              // Round baru dimulai
              await get().syncBattleRoomFromDB();
              const state = get();
              await get().loadQuestion(roomId, newRound.round_number);
            }
          }
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
          // Sync battle room when someone answers
          await get().syncBattleRoomFromDB();
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
    set({
      currentOrder: nextOrder,
      selectedAnswerId: null,
      timeLeft: SECONDS_PER_ROUND,
    });

    // Sync battle room for the new round
    get().syncBattleRoomFromDB();

    // Load question for the new round
    get().loadQuestion(state.gameRoomId, nextOrder);
  },

  handleSelectAnswer: async (userId, answerId) => {
    const state = get();
    if (state.selectedAnswerId || state.isSubmitting) return;

    // Check if someone already answered in this battle room
    if (state.currentBattleRoom?.first_answer_user_id) {
      console.log("[MatchStore] Someone already answered in this battle room");
      return;
    }

    set({ selectedAnswerId: answerId, isSubmitting: true });

    try {
      // Submit answer to battle API
      const res = await fetch("/api/battle/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          answer_id: answerId,
          battle_room_id: state.currentBattleRoom?.battle_room_id,
          game_room_id: state.gameRoomId,
          round_number: state.currentOrder,
        }),
      });

      if (!res.ok) {
        console.error("Failed to submit answer");
      } else {
        const result = await res.json();
        console.log("[MatchStore] Answer result:", result);
      }
    } catch (e) {
      console.error("Gagal submit answer:", e);
    }

    set({ isSubmitting: false });

    // Don't auto-advance - wait for server to handle round progression
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
      currentBattleRoom: null,
      opponentIds: [],
      nextRoundUrl: null,
      error: null,
    });
  },
}));
