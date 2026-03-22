import { create } from "zustand";
import { quizService, QuizQuestion } from "@/services/quizService";
import { gameService } from "@/services/gameService";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { Player } from "@/lib/constants/players";

export const SECONDS_PER_ROUND = 30;

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
  me: Player | null;
  opponent: Player | null;
  nextRoundUrl: string | null;

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
  me: null,
  opponent: null,
  nextRoundUrl: null,

  initializeMatch: async (roomCode, gameRoomId, initialRound) => {
    set({
      roomCode,
      gameRoomId,
      currentOrder: initialRound,
      isLoadingQuestion: true,
      selectedAnswerId: null,
      isSubmitting: false,
      isFinished: false,
      timeLeft: SECONDS_PER_ROUND,
      nextRoundUrl: null,
    });

    const room = await gameService.getGameRoomConfig(roomCode, gameRoomId);
    if (!room) {
      set({ isLoadingQuestion: false });
      return;
    }

    const maxPlayer = room.max_player || 40;
    const { me, opponent } = await gameService.loadMatchPlayers(maxPlayer);

    set({
      roomInfo: room,
      totalQuestions: room.total_question || null,
      me,
      opponent,
    });

    await get().loadQuestion(gameRoomId, initialRound);
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

    if (state.currentOrder % 5 === 0) {
      // Trigger navigation using state observer
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

    // Submit pure function no matter error
    await quizService.submitAnswer(userId, answerId);

    set({ isSubmitting: false });
    setTimeout(() => {
      get().advanceRound();
    }, 800);
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
      roomInfo: null,
      currentOrder: 1,
      totalQuestions: null,
      currentQuestion: null,
      isLoadingQuestion: true,
      selectedAnswerId: null,
      isSubmitting: false,
      isFinished: false,
      timeLeft: SECONDS_PER_ROUND,
      me: null,
      opponent: null,
      nextRoundUrl: null,
    });
  },
}));
