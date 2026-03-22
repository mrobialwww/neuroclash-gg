import { gameRoomRepository } from "@/repository/gameRoomRepository";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";

export interface GroupedGameRooms {
  topic: string;
  rooms: GameRoomWithPlayerCount[];
}

export const gameRoomService = {
  /**
   * Fetch public open rooms and group them by topic_material.
   * Returns an array of { topic, rooms[] } for rendering CategorySections.
   */
  async getGroupedPublicRooms(): Promise<GroupedGameRooms[]> {
    const rooms = await gameRoomRepository.getPublicOpenRooms();

    // Group by topic_material (acts as category)
    const groupMap = new Map<string, GameRoomWithPlayerCount[]>();

    for (const room of rooms) {
      const topic = room.topic_material;
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
};
