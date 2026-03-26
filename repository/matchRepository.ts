import { createClient } from "@/lib/supabase/client";
import { PlayerMatchState } from "@/types/quiz";
import { gamePlayerRepository } from "./gamePlayerRepository";

export const matchRepository = {
  /**
   * Ambil semua partisipan dalam suatu game room dari tabel game_players.
   * Melakukan join dengan tabel characters dan users untuk data UI.
   */
  async getParticipants(roomId: string): Promise<PlayerMatchState[]> {
    return gamePlayerRepository.getPlayers(roomId);
  },

  /**
   * Simpan jawaban user ke tabel user_answers.
   */
  async submitAnswer(
    userId: string,
    answerId: string,
    roomId: string,
    roundNumber: number
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_answers")
      .insert({
        user_id: userId,
        answer_id: answerId,
        game_room_id: roomId,
        round_number: roundNumber,
      })
      .select()
      .single();

    if (error) {
      console.error("[MatchRepo] submitAnswer error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Update health user di tabel game_players.
   */
  async updateHealth(userId: string, roomId: string, newHealth: number) {
    return gamePlayerRepository.updateHealth(userId, roomId, newHealth);
  },

  /**
   * Mendapatkan detail jawaban (apakah benar) dari answerId.
   */
  async getAnswerDetail(answerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("answers")
      .select("is_correct, question_id")
      .eq("answer_id", answerId)
      .single();

    if (error) {
      console.error("[MatchRepo] getAnswerDetail error:", error);
      return null;
    }
    return data;
  },

  /**
   * Mendapatkan semua jawaban untuk suatu pertanyaan tertentu di room tertentu.
   * Berguna untuk menentukan siapa yang tercepat.
   */
  async getQuestionAnswers(questionId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_answers")
      .select("user_id, created_at, answer_id, answers(is_correct)")
      .eq("answer_id", questionId); // Wait, user_answers links to answer_id, which links to question_id.

    // Correction: need to join with answers to filter by question_id
    const { data: correctData, error: correctError } = await supabase
      .from("user_answers")
      .select(
        `
        user_id,
        created_at,
        answer: answers!inner (
          is_correct,
          question_id
        )
      `
      )
      .eq("answer.question_id", questionId)
      .order("created_at", { ascending: true });

    if (correctError) {
      console.error("[MatchRepo] getQuestionAnswers error:", correctError);
      return [];
    }
    return correctData;
  },
};
