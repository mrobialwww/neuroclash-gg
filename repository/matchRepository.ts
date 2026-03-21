import { createClient } from "@/lib/supabase/server";
import { PlayerMatchState } from "@/types/Quiz";

export const matchRepository = {
  /**
   * Ambil semua partisipan dalam suatu game room dari tabel user_games.
   * Melakukan join dengan tabel characters dan users untuk data UI.
   */
  async getParticipants(roomId: string): Promise<PlayerMatchState[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_games")
      .select(
        `
        user_id,
        health,
        status,
        users (
          username,
          user_characters (
            is_used,
            character: characters (
              name,
              image_url
            )
          )
        )
      `
      )
      .eq("game_room_id", roomId);

    if (error) {
      console.error("[MatchRepo] getParticipants error:", error);
      return [];
    }

    return (data || []).map((row: any) => {
      const user = row.users;
      const equippedChar = user?.user_characters?.find(
        (c: any) => c.is_used
      )?.character;

      return {
        id: row.user_id,
        name: user?.username || "Unknown",
        avatar: equippedChar?.image_url || "/default/Slime.webp",
        character: equippedChar?.name || "Slime",
        health: row.health ?? 100,
        is_alive: (row.health ?? 100) > 0,
        score: 0,
      };
    });
  },

  /**
   * Simpan jawaban user ke tabel user_answers.
   */
  async submitAnswer(userId: string, answerId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_answers")
      .insert({
        user_id: userId,
        answer_id: answerId,
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
   * Update health user di tabel user_games.
   */
  async updateHealth(userId: string, roomId: string, newHealth: number) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_games")
      .update({ health: newHealth })
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .select()
      .single();

    if (error) {
      console.error("[MatchRepo] updateHealth error:", error);
      throw error;
    }

    return data;
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
