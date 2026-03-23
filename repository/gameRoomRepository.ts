import { createClient } from "@/lib/supabase/server";
import { GameRoom, GameRoomWithPlayerCount } from "@/types/GameRoom";
import { Answer } from "@/types/quiz";

export interface CreateRoomParams {
  user_id: string;
  room_code: string;
  category: string;
  title: string | null;
  max_player: number;
  total_question: number;
  total_round: number;
  difficulty: string;
  image_url: string;
  room_status: string;
  room_visibility: string;
}

export const gameRoomRepository = {
  /**
   * Fetch all public & open game rooms with their player count.
   * Digunakan oleh Server Components — query Supabase langsung (tanpa HTTP round-trip).
   */
  async getPublicOpenRooms(): Promise<GameRoomWithPlayerCount[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("room_status", "open")
      .eq("room_visibility", "public")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GameRoomRepo] Error fetching rooms:", error.message);
      return [];
    }

    return (data ?? []).map((room) => ({ ...room, player_count: 0 }));
  },

  /**
   * Fetch a single game room by its code.
   * Digunakan oleh Server Components — query Supabase langsung.
   * Client Components menggunakan GET /api/game-rooms/code/[room_code] secara langsung.
   */
  async getRoomByCode(
    roomCode: string
  ): Promise<GameRoomWithPlayerCount | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("room_code", roomCode);

    if (error) {
      console.error(
        "[GameRoomRepo] Error fetching room by code:",
        error.message
      );
      return null;
    }

    const rooms = data ?? [];
    if (!rooms.length) return null;

    return { ...rooms[0], player_count: 0 };
  },

  /**
   * Fetch a single game room by ID.
   * Digunakan untuk duplicate feature.
   */
  async getRoomById(gameRoomId: string): Promise<GameRoom | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("game_room_id", gameRoomId)
      .single();

    if (error) {
      console.error("[GameRoomRepo] Error fetching room by ID:", error.message);
      return null;
    }

    return data ?? null;
  },

  /**
   * Fetch N random public open rooms.
   * Ambil semua lalu shuffle in-memory.
   */
  async getRandomPublicRooms(
    limit: number = 4
  ): Promise<GameRoomWithPlayerCount[]> {
    const rooms = await gameRoomRepository.getPublicOpenRooms();

    // Fisher-Yates shuffle
    const shuffled = [...rooms].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, limit);
  },

  /**
   * Update room status
   */
  async updateRoomStatus(
    roomId: string,
    status: "open" | "playing" | "finished"
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("game_rooms")
      .update({ room_status: status })
      .eq("game_room_id", roomId);

    if (error) {
      console.error("[GameRoomRepo] updateRoomStatus error:", error);
      throw error;
    }
  },

  /**
   * Create a new game room.
   * Digunakan untuk duplicate feature dan create room biasa.
   */
  async createRoom(params: CreateRoomParams): Promise<GameRoom | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_rooms")
      .insert({
        user_id: params.user_id,
        room_code: params.room_code,
        category: params.category,
        title: params.title,
        max_player: params.max_player,
        total_question: params.total_question,
        total_round: params.total_round,
        difficulty: params.difficulty,
        image_url: params.image_url,
        room_status: params.room_status,
        room_visibility: params.room_visibility,
      })
      .select()
      .single();

    if (error) {
      console.error("[GameRoomRepo] createRoom error:", error);
      console.error("[GameRoomRepo] Error code:", error.code);
      console.error("[GameRoomRepo] Error message:", error.message);
      console.error("[GameRoomRepo] Error details:", error.details);
      console.error("[GameRoomRepo] Error hint:", error.hint);
      console.error("[GameRoomRepo] Params:", params);
      return null;
    }

    console.log("[GameRoomRepo] ✅ Room created successfully:", data);
    return data ?? null;
  },

  /**
   * Insert questions + answers untuk room baru.
   * Digunakan untuk duplicate feature.
   */
  async insertQuestionsWithAnswers(
    gameRoomId: string,
    questions: any[]
  ): Promise<{ questionsInserted: number; answersInserted: number }> {
    const supabase = await createClient();

    let questionsInserted = 0;
    let answersInserted = 0;

    for (const question of questions) {
      // Insert question
      const { data: newQ } = await supabase
        .from("questions")
        .insert({
          game_room_id: gameRoomId,
          question_order: question.question_order,
          question_text: question.question_text,
        })
        .select()
        .single();

      if (!newQ) {
        console.error(
          "[GameRoomRepo] Failed to insert question:",
          question.question_order
        );
        continue;
      }

      questionsInserted++;

      // Insert answers untuk question ini
      if (question.answers && question.answers.length > 0) {
        for (const answer of question.answers) {
          const { data: answerData } = await supabase
            .from("answers")
            .insert({
              question_id: newQ.question_id,
              answer_text: answer.answer_text,
              is_correct: answer.is_correct,
              key: answer.key,
            })
            .select()
            .single();

          if (answerData) {
            answersInserted++;
          }
        }
      }
    }

    return {
      questionsInserted: questionsInserted,
      answersInserted: answersInserted,
    };
  },
};
