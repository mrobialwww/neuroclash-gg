import { Question, Answer } from "@/types/Quiz";

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
      { cache: "no-store" }
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
  async submitAnswer(userId: string, answerId: string): Promise<boolean> {
    const res = await fetch("/api/quiz/user-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, answer_id: answerId }),
    });

    if (!res.ok) {
      console.error("[QuizRepo] submitAnswer failed:", res.status);
      return false;
    }

    return true;
  },
};
