/**
 * userGameRepository.ts
 * Layer: Repository — raw API calls only, no business logic.
 * All calls go through API routes (no direct supabase on client).
 */

export interface UserGameRecord {
  user_game_id: string;
  game_room_id: string;
  user_id: string;
  trophy_won: number;
  coins_earned: number;
  created_at: string;
  updated_at: string;
}

export interface ParticipantRecord {
  user_game_id: string;
  game_room_id: string;
  user_id: string;
  trophy_won: number;
  coins_earned: number;
  created_at: string;
  updated_at: string;
}

export const userGameRepository = {
  /**
   * POST /api/user-game/join/[game_room_id]
   * Inserts a new record into user_games for the given user + room.
   */
  async joinGame(
    gameRoomId: string,
    userId: string
  ): Promise<UserGameRecord | null> {
    const res = await fetch(`/api/user-game/join/${gameRoomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("[UserGameRepo] joinGame failed:", await res.text());
      return null;
    }

    const result = await res.json();
    const data = result.data;
    return Array.isArray(data) ? data[0] ?? null : data ?? null;
  },

  /**
   * GET /api/user-game/participants/[game_room_id]
   * Returns all user_games records for a given room.
   */
  async getParticipants(gameRoomId: string): Promise<ParticipantRecord[]> {
    const res = await fetch(`/api/user-game/participants/${gameRoomId}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("[UserGameRepo] getParticipants failed:", await res.text());
      return [];
    }

    const result = await res.json();
    return result.data ?? [];
  },

  /**
   * DELETE /api/user-game/leave/[user_game_id]
   * Removes the user_game record (used on exit / quiz completion).
   * NOTE: If this API route doesn't exist yet, we handle gracefully.
   */
  async leaveGame(userGameId: string): Promise<boolean> {
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
};
