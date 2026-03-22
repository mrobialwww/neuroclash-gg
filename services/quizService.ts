import { quizRepository } from "@/repository/quizRepository";
import { Answer } from "@/types/Quiz";

// Domain types yang dipakai komponen

export interface QuizOption {
  /** answer_id dari DB — dikirim saat submit jawaban */
  id: string;
  /** A / B / C / D */
  label: string;
  /** teks jawaban */
  text: string;
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
    }));

    return {
      question_id: question.question_id,
      question_text: question.question_text,
      question_order: question.question_order,
      options,
    };
  },

  /**
   * Submit the user's selected answer.
   */
  async submitAnswer(userId: string, answerId: string): Promise<boolean> {
    return quizRepository.submitAnswer(userId, answerId);
  },
};
