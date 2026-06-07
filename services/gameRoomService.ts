import { gameRoomRepository } from "@/repository/gameRoomRepository";
import { GameRoomWithPlayerCount, GameRoom } from "@/types/GameRoom";
import { CreateRoomParams } from "@/repository/gameRoomRepository";

export interface GroupedGameRooms {
  topic: string;
  rooms: GameRoomWithPlayerCount[];
}

export const gameRoomService = {
  /**
   * Fetch public open rooms and group them by category.
   * Returns an array of { topic, rooms[] } for rendering CategorySections.
   */
  async getGroupedPublicRooms(): Promise<GroupedGameRooms[]> {
    const rooms = await gameRoomRepository.getPublicOpenRooms();

    // Group by category (acts as topic)
    const groupMap = new Map<string, GameRoomWithPlayerCount[]>();

    for (const room of rooms) {
      const topic = room.category;
      if (!groupMap.has(topic)) {
        groupMap.set(topic, []);
      }
      groupMap.get(topic)!.push(room);
    }

    // Convert map to sorted array
    return Array.from(groupMap.entries()).map(([topic, rooms]) => ({
      topic,
      rooms,
    }));
  },

  /**
   * Fetch all game rooms created by a user.
   */
  async getUserRooms(userId: string): Promise<GameRoomWithPlayerCount[]> {
    return await gameRoomRepository.getUserRooms(userId);
  },

  /**
   * Get a specific room by its code.
   */
  async getRoomByCode(
    roomCode: string
  ): Promise<GameRoomWithPlayerCount | null> {
    return await gameRoomRepository.getRoomByCode(roomCode);
  },

  /**
   * Fetch N random public open rooms (for homepage preview).
   */
  async getRandomPublicRooms(
    limit: number = 4
  ): Promise<GameRoomWithPlayerCount[]> {
    return await gameRoomRepository.getRandomPublicRooms(limit);
  },

  /**
   * Orchestrates creating a game room, mapping Gemini AI questions, and inserting ability materials.
   * This is called by POST /api/game-rooms
   */
  async createGameRoomFromAI(payload: any): Promise<GameRoom | null> {
    const { questions: listQuestions, ...restOfBody } = payload;
    const listAbilities = listQuestions?.ability_materials || [];

    // Fallback category to theme_materials if not provided!
    const finalCategory = restOfBody.category || listQuestions?.theme_materials || "General";

    const createParams: CreateRoomParams = {
      user_id: restOfBody.user_id,
      room_code: restOfBody.room_code || Math.random().toString(36).substring(2, 10).toUpperCase(),
      category: finalCategory,
      title: restOfBody.title,
      max_player: Number(restOfBody.max_player) || 20,
      total_round: Number(restOfBody.total_round) || listQuestions?.list_questions?.length || 10,
      difficulty: restOfBody.difficulty || "mudah",
      image_url: restOfBody.image_url || "/quiz-category/pemrograman.webp",
      room_status: restOfBody.room_status || "open",
      room_visibility: restOfBody.room_visibility || "public",
    };

    // 1. Create Game Room
    const room = await gameRoomRepository.createRoom(createParams);
    if (!room) {
      throw new Error("Gagal membuat game room.");
    }

    // 2. Map & Insert Questions
    const MappedQuestions = (listQuestions?.list_questions || []).map((q: any) => ({
      question_order: q.order || q.question_order,
      question_text: q.question || q.question_text,
      answers: (q.options || q.answers || []).map((opt: any) => ({
        answer_text: opt.text || opt.answer_text,
        is_correct: opt.is_correct || opt.isCorrect,
        key: opt.key,
      })),
    }));

    if (MappedQuestions.length > 0) {
      await gameRoomRepository.insertQuestionsWithAnswers(room.game_room_id, MappedQuestions);
    }

    // 3. Insert Ability Materials
    if (listAbilities.length > 0) {
      await gameRoomRepository.insertAbilityMaterials(room.game_room_id, listAbilities);
    }

    return room;
  },
};
