import { createClient } from "@/lib/supabase/server";
import { GameRoom, GameRoomWithPlayerCount } from "@/types/GameRoom";

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
      console.error("[GameRoomRepo] Error fetching room by code:", error.message);
      return null;
    }

    const rooms = data ?? [];
    if (!rooms.length) return null;

    return { ...rooms[0], player_count: 0 };
  },

  /**
   * Fetch N random public & open game rooms.
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
};
