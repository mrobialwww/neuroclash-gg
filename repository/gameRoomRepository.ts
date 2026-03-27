import { createClient } from "@/lib/supabase/client";
import { GameRoom, GameRoomWithPlayerCount } from "@/types/GameRoom";
import { Answer } from "@/types/quiz";

export interface CreateRoomParams {
  user_id: string;
  room_code: string;
  category: string;
  title: string | null;
  max_player: number;
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
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const supabase = await createServerClient();

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

    const rooms = data ?? [];
    if (rooms.length === 0) return [];

    // Fetch user_games for these rooms
    const roomIds = rooms.map((r) => r.game_room_id);
    const { data: userGames } = await supabase
      .from("user_games")
      .select("game_room_id, user_id")
      .in("game_room_id", roomIds);

    const countMap = new Map<string, number>();
    const roomAvatarMap = new Map<
      string,
      { image: string; character: string }[]
    >();

    if (userGames && userGames.length > 0) {
      // Collect unique user IDs
      const userIds = Array.from(new Set(userGames.map((ug) => ug.user_id)));

      // Fetch active characters for these users
      const { data: userChars } = await supabase
        .from("user_characters")
        .select("user_id, characters!inner(image_url, base_character)")
        .in("user_id", userIds)
        .eq("is_used", true);

      // Map userId -> avatar object
      const avatarMap = new Map<string, { image: string; character: string }>();
      userChars?.forEach((uc: any) => {
        const charData = Array.isArray(uc.characters)
          ? uc.characters[0]
          : uc.characters;
        if (charData?.image_url) {
          avatarMap.set(uc.user_id, {
            image: charData.image_url,
            character: charData.base_character || "",
          });
        }
      });

      // Populate counts and avatars per room
      userGames.forEach((ug) => {
        countMap.set(ug.game_room_id, (countMap.get(ug.game_room_id) || 0) + 1);

        if (!roomAvatarMap.has(ug.game_room_id)) {
          roomAvatarMap.set(ug.game_room_id, []);
        }

        const avatars = roomAvatarMap.get(ug.game_room_id)!;
        if (avatars.length < 4) {
          const avatarData = avatarMap.get(ug.user_id);
          if (avatarData) {
            avatars.push(avatarData);
          }
        }
      });
    }

    return rooms.map((room) => ({
      ...room,
      player_count: countMap.get(room.game_room_id) || 0,
      participants_avatars: roomAvatarMap.get(room.game_room_id) || [],
    }));
  },

  /**
   * Fetch all game rooms created by a specific user.
   */
  async getUserRooms(userId: string): Promise<GameRoomWithPlayerCount[]> {
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GameRoomRepo] Error fetching user rooms:", error.message);
      return [];
    }

    const rooms = data ?? [];
    if (rooms.length === 0) return [];

    // Fetch user_games for these rooms
    const roomIds = rooms.map((r) => r.game_room_id);
    const { data: userGames } = await supabase
      .from("user_games")
      .select("game_room_id, user_id")
      .in("game_room_id", roomIds);

    const countMap = new Map<string, number>();
    const roomAvatarMap = new Map<
      string,
      { image: string; character: string }[]
    >();

    if (userGames && userGames.length > 0) {
      // Collect unique user IDs
      const userIds = Array.from(new Set(userGames.map((ug) => ug.user_id)));

      // Fetch active characters for these users
      const { data: userChars } = await supabase
        .from("user_characters")
        .select("user_id, characters!inner(image_url, base_character)")
        .in("user_id", userIds)
        .eq("is_used", true);

      // Map userId -> avatar object
      const avatarMap = new Map<string, { image: string; character: string }>();
      userChars?.forEach((uc: any) => {
        const charData = Array.isArray(uc.characters)
          ? uc.characters[0]
          : uc.characters;
        if (charData?.image_url) {
          avatarMap.set(uc.user_id, {
            image: charData.image_url,
            character: charData.base_character || "",
          });
        }
      });

      // Populate counts and avatars per room
      userGames.forEach((ug) => {
        countMap.set(ug.game_room_id, (countMap.get(ug.game_room_id) || 0) + 1);

        if (!roomAvatarMap.has(ug.game_room_id)) {
          roomAvatarMap.set(ug.game_room_id, []);
        }

        const avatars = roomAvatarMap.get(ug.game_room_id)!;
        if (avatars.length < 4) {
          const avatarData = avatarMap.get(ug.user_id);
          if (avatarData) {
            avatars.push(avatarData);
          }
        }
      });
    }

    return rooms.map((room) => ({
      ...room,
      player_count: countMap.get(room.game_room_id) || 0,
      participants_avatars: roomAvatarMap.get(room.game_room_id) || [],
    }));
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
        total_round: params.total_round,
        difficulty: params.difficulty,
        image_url: params.image_url,
        room_status: params.room_status,
        room_visibility: params.room_visibility,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "[GameRoomRepo] createRoom error:",
        JSON.stringify(error, null, 2)
      );
      console.error(
        "[GameRoomRepo] Params that caused error:",
        JSON.stringify(params, null, 2)
      );
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

    console.log(`[GameRoomRepo] insertQuestionsWithAnswers START`);
    console.log(`[GameRoomRepo] Target game_room_id: ${gameRoomId}`);
    console.log(
      `[GameRoomRepo] Number of questions to insert: ${questions.length}`
    );

    let questionsInserted = 0;
    let answersInserted = 0;

    for (const question of questions) {
      console.log(
        `[GameRoomRepo] Processing question ${question.question_order}`
      );
      console.log(
        `[GameRoomRepo] Question text: ${question.question_text?.substring(
          0,
          50
        )}...`
      );
      console.log(
        `[GameRoomRepo] Number of answers: ${question.answers?.length || 0}`
      );

      // Insert question
      const { data: newQ, error: qError } = await supabase
        .from("questions")
        .insert({
          game_room_id: gameRoomId,
          question_order: question.question_order,
          question_text: question.question_text,
        })
        .select()
        .single();

      if (qError) {
        console.error("[GameRoomRepo] ❌ Failed to insert question:", qError);
        console.error("[GameRoomRepo] Error code:", qError.code);
        console.error("[GameRoomRepo] Error message:", qError.message);
        console.error("[GameRoomRepo] Question data:", question);
        continue;
      }

      if (!newQ) {
        console.error(
          "[GameRoomRepo] ❌ Question insertion returned null:",
          question.question_order
        );
        continue;
      }

      console.log(`[GameRoomRepo] ✅ Question inserted: ${newQ.question_id}`);
      questionsInserted++;

      // Insert answers untuk question ini
      if (question.answers && question.answers.length > 0) {
        console.log(
          `[GameRoomRepo] Inserting ${question.answers.length} answers for question ${question.question_order}`
        );

        for (const answer of question.answers) {
          console.log(
            `[GameRoomRepo] Inserting answer: ${answer.answer_text?.substring(
              0,
              30
            )}...`
          );

          const { data: answerData, error: aError } = await supabase
            .from("answers")
            .insert({
              question_id: newQ.question_id,
              answer_text: answer.answer_text,
              is_correct: answer.is_correct === true,
              key: answer.key,
            })
            .select()
            .single();

          if (aError) {
            console.error("[GameRoomRepo] ❌ Failed to insert answer:", aError);
            console.error("[GameRoomRepo] Error code:", aError.code);
            console.error("[GameRoomRepo] Error message:", aError.message);
            console.error("[GameRoomRepo] Answer data:", answer);
            continue;
          }

          if (answerData) {
            console.log(
              `[GameRoomRepo] ✅ Answer inserted: ${answerData.answer_id}`
            );
            answersInserted++;
          } else {
            console.error(
              "[GameRoomRepo] ❌ Answer insertion returned null:",
              answer
            );
          }
        }
      } else {
        console.warn(
          `[GameRoomRepo] ⚠️ No answers found for question ${question.question_order}`
        );
      }
    }

    console.log(`[GameRoomRepo] insertQuestionsWithAnswers COMPLETE`);
    console.log(`[GameRoomRepo] Questions inserted: ${questionsInserted}`);
    console.log(`[GameRoomRepo] Answers inserted: ${answersInserted}`);

    return {
      questionsInserted: questionsInserted,
      answersInserted: answersInserted,
    };
  },

  /**
   * Insert ability materials untuk room baru.
   */
  async insertAbilityMaterials(
    gameRoomId: string,
    materials: any[]
  ): Promise<number> {
    const supabase = await createClient();
    let insertedCount = 0;

    for (const ability of materials) {
      const { data } = await supabase
        .from("ability_materials")
        .insert({
          game_room_id: gameRoomId,
          title: ability.title,
          content: ability.text ?? ability.content,
        })
        .select()
        .single();

      if (data) insertedCount++;
    }

    return insertedCount;
  },
};
