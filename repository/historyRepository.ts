import { SupabaseClient } from "@supabase/supabase-js";

/**
 * historyRepository.ts
 * Layer: Repository — raw database queries only.
 */
export const historyRepository = {
  /**
   * Fetch paginated history for a user.
   */
  async getUserGameHistory(
    userId: string,
    offset: number,
    limit: number,
    supabase: SupabaseClient
  ) {
    return supabase
      .from("user_games")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
  },

  /**
   * Fetch global user statistics.
   */
  async getUserStats(userId: string, supabase: SupabaseClient) {
    return supabase
      .from("users")
      .select("total_match, total_rank_1, placement_ratio")
      .eq("user_id", userId)
      .maybeSingle();
  },

  /**
   * Fetch game room details for a list of IDs.
   */
  async getGameRooms(roomIds: string[], supabase: SupabaseClient) {
    return supabase
      .from("game_rooms")
      .select("game_room_id, title, category")
      .in("game_room_id", roomIds);
  },
};
