import { Answer, Question } from "@/types";

// Fetch question by game_room_id + order
export const quizRepository = {
  /**
   * GET /api/quiz/questions/[game_room_id]?question_order=[order]
   * Returns the question row for a given room and round order.
   */
  async getQuestion(
    gameRoomId: string,
    order: number
  ): Promise<Question | null> {
    const res = await fetch(
      `/api/quiz/questions/${gameRoomId}?question_order=${order}`,
      { cache: "no-store", credentials: "include" }
    );

    if (!res.ok) {
      console.error("[QuizRepo] getQuestion failed:", res.status);
      return null;
    }

    const result = await res.json();
    const rows: Question[] = result.data ?? [];
    return rows[0] ?? null;
  },

  /**
   * GET /api/quiz/questions/answers/[question_id]
   * Returns the 4 answer options for a given question.
   */
  async getAnswers(questionId: string): Promise<Answer[]> {
    const res = await fetch(`/api/quiz/questions/answers/${questionId}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("[QuizRepo] getAnswers failed:", res.status);
      return [];
    }

    const result = await res.json();
    return result.data ?? [];
  },

  /**
   * POST /api/quiz/user-answer
   * Records a user's answer for the current question.
   */
  /**
   * GET /api/game-rooms/[roomId]
   * Returns the full game room data including questions.
   */
  async fetchDetailedRoom(
    roomId: string
  ): Promise<Record<string, unknown> | null> {
    const res = await fetch(`/api/game-rooms/${roomId}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      console.error("[QuizRepo] fetchDetailedRoom failed:", res.status);
      return null;
    }
    const result = await res.json();
    // Handles both `{ data: [...] }` and `{ data: {...} }` shapes
    const raw = result.data;
    return Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
  },

  /**
   * GET /api/user-game/participants/[roomId]
   * Returns all user_game records for a given room.
   */
  async fetchParticipants(roomId: string): Promise<Record<string, unknown>[]> {
    const res = await fetch(`/api/user-game/participants/${roomId}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data ?? [];
  },

  /**
   * POST /api/user-game/join/[roomId]
   * Inserts a new user_games record. Returns the created record.
   */
  async postJoinRoom(
    roomId: string,
    userId: string
  ): Promise<Record<string, unknown> | null> {
    const res = await fetch(`/api/user-game/join/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
      credentials: "include",
    });
    if (!res.ok) {
      console.error("[QuizRepo] postJoinRoom failed:", res.status);
      return null;
    }
    const result = await res.json();
    const raw = result.data;
    return Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
  },

  /**
   * DELETE /api/user-game/leave/[userGameId]
   * Removes the user_game record on exit.
   */
  async deleteLeaveRoom(userGameId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/user-game/leave/${userGameId}`, {
        method: "DELETE",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * POST /api/quiz/user-answer
   * Records a user's answer for current question.
   */
  async submitAnswer(
    userId: string,
    answerId: string,
    roundNumber: number
  ): Promise<boolean> {
    const res = await fetch("/api/quiz/user-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        answer_id: answerId,
        round_number: roundNumber,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("[QuizRepo] submitAnswer failed:", res.status);
      return false;
    }

    return true;
  },

  /**
   * PATCH /api/game-rooms/[roomId]/migrate
   * Updates the host of a room.
   */
  async updateRoomHost(roomId: string, newHostId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/game-rooms/${roomId}/migrate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_host_id: newHostId }),
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
