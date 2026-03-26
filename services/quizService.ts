import { quizRepository } from "@/repository/quizRepository";
import { Answer } from "@/types";

// Domain types yang dipakai komponen

export interface QuizOption {
  /** answer_id dari DB — dikirim saat submit jawaban */
  id: string;
  /** A / B / C / D */
  label: string;
  /** teks jawaban */
  text: string;
  /** apakah ini jawaban yang benar */
  isCorrect: boolean;
}

export interface QuizQuestion {
  question_id: string;
  question_text: string;
  question_order: number;
  options: QuizOption[];
}

// Service

export const quizService = {
  /**
   * Fetch question + answers in parallel for a given round (order).
   * Returns null if the question doesn't exist (end of quiz).
   */
  async getQuestionWithAnswers(
    gameRoomId: string,
    order: number
  ): Promise<QuizQuestion | null> {
    const question = await quizRepository.getQuestion(gameRoomId, order);
    if (!question) return null;

    const rawAnswers = await quizRepository.getAnswers(question.question_id);

    // Sort answers by key (A → B → C → D) for consistent display
    const sorted = [...rawAnswers].sort((a, b) => a.key.localeCompare(b.key));

    const options: QuizOption[] = sorted.map((ans: Answer) => ({
      id: ans.answer_id,
      label: ans.key.toUpperCase(),
      text: ans.answer_text,
      isCorrect: ans.is_correct,
    }));

    return {
      question_id: question.question_id,
      question_text: question.question_text,
      question_order: question.question_order,
      options,
    };
  },

  /**
   * Submit user's selected answer.
   */
  async submitAnswer(
    userId: string,
    answerId: string,
    roundNumber: number
  ): Promise<boolean> {
    return quizRepository.submitAnswer(userId, answerId, roundNumber);
  },

  /**
   * getLobbyData(roomId)
   * Orkestrasi data: Panggil fetchDetailedRoom dan fetchParticipants.
   * Gabungkan data menjadi objek LobbyData yang bersih.
   */
  async getLobbyData(roomId: string) {
    const [roomData, participants] = await Promise.all([
      quizRepository.fetchDetailedRoom(roomId),
      quizRepository.fetchParticipants(roomId),
    ]);

    if (!roomData) return null;

    const uniqueUsers = new Map<string, any>();
    for (const p of participants) {
      if (p && typeof p === "object" && "user_id" in p) {
        uniqueUsers.set(p.user_id as string, p);
      }
    }

    return {
      roomData,
      participants: Array.from(uniqueUsers.values()),
    };
  },

  /**
   * joinRoomByCode(roomId, userId, roomCode)
   * Validasi kode lalu panggil postJoinRoom.
   */
  async joinRoomByCode(roomId: string, userId: string, roomCode?: string) {
    // If roomCode is provided, we can validate it against the roomData first
    if (roomCode) {
      const room = await quizRepository.fetchDetailedRoom(roomId);
      if (!room || room.room_code !== roomCode) {
        throw new Error("Kode room tidak valid");
      }
    }

    return quizRepository.postJoinRoom(roomId, userId);
  },

  /**
   * handleSoloModeInit(roomId, userId)
   * Jika data room menunjukkan mode solo, pastikan user ID terdaftar sebagai partisipan tunggal.
   */
  async handleSoloModeInit(roomId: string, userId: string) {
    const roomData = await quizRepository.fetchDetailedRoom(roomId);
    if (roomData && roomData.max_player === 1) {
      // Join directly
      return quizRepository.postJoinRoom(roomId, userId);
    }
    return null;
  },

  /**
   * duplicateRoom(roomId, maxPlayer, isSolo)
   * Create a new instance of a room.
   * @param isSolo - true untuk mode solo (max_player = 1), false untuk multi (max_player = 15/20/40)
   */
  async duplicateRoom(
    roomId: string,
    maxPlayer: number,
    isSolo: boolean = false
  ) {
    console.log(
      `[QuizService] duplicateRoom START - roomId: ${roomId}, maxPlayer: ${maxPlayer}, isSolo: ${isSolo}`
    );

    const res = await fetch(`/api/game-rooms/${roomId}/duplicate`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ max_player: maxPlayer, is_solo: isSolo }),
    });

    console.log(`[QuizService] Response status: ${res.status}, ok: ${res.ok}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[QuizService] ❌ duplicateRoom failed:`, errorText);
      throw new Error("Gagal menduplikasi room");
    }

    const json = await res.json();
    console.log(`[QuizService] ✅ Response:`, json);

    // Cek apakah response punya property 'data' atau langsung return object
    if (json.data) {
      console.log(`[QuizService] ✅ Returning data:`, json.data);
      return json.data;
    } else {
      console.log(
        `[QuizService] ⚠️ No 'data' property, returning json directly`
      );
      return json;
    }
  },
};
