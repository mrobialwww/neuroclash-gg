import { SupabaseClient } from "@supabase/supabase-js";
import { getWIBNow } from "@/lib/utils/dateUtils";

/**
 * endgameRepository.ts
 * Layer: Repository — raw database queries only, no business logic.
 * Supports passing a specific Supabase client (e.g., admin client) for server-side operations.
 */
export const endgameRepository = {
  /**
   * Fetch all participants in a game room with their health and user details.
   */
  async getGamePlayers(roomId: string, supabase: SupabaseClient) {
    return supabase
      .from("game_players")
      .select(
        "user_id, health, status, win, updated_at, users!inner(username, total_trophy)"
      )
      .eq("game_room_id", roomId);
  },

  /**
   * Fetch the active character for multiple users.
   */
  async getUserCharacters(userIds: string[], supabase: SupabaseClient) {
    return supabase
      .from("user_characters")
      .select("user_id, characters!inner(skin_name, image_url)")
      .in("user_id", userIds)
      .eq("is_used", true);
  },

  /**
   * Fetch all answers submitted by users in a room, including correctness data.
   */
  async getUserAnswers(roomId: string, supabase: SupabaseClient) {
    return supabase
      .from("user_answers")
      .select(
        `
        user_id,
        round_number,
        created_at,
        answers (
          is_correct
        )
      `
      )
      .eq("game_room_id", roomId);
  },

  /**
   * Fetch all battle rooms for a specific game room.
   */
  async getBattleRooms(roomId: string, supabase: SupabaseClient) {
    return supabase.from("battle_rooms").select("*").eq("game_room_id", roomId);
  },

  /**
   * Fetch correctness info for a list of answer IDs.
   */
  async getCorrectAnswers(answerIds: string[], supabase: SupabaseClient) {
    return supabase
      .from("answers")
      .select("answer_id, is_correct")
      .in("answer_id", answerIds);
  },

  /**
   * Fetch basic game room configuration.
   */
  async getGameRoom(roomId: string, supabase: SupabaseClient) {
    return supabase
      .from("game_rooms")
      .select("total_round, room_status, created_at, updated_at")
      .eq("game_room_id", roomId)
      .maybeSingle();
  },

  /**
   * Fetch rank details (e.g., max trophy limit).
   */
  async getRankInfo(rankId: number, supabase: SupabaseClient) {
    return supabase
      .from("ranks")
      .select("max_trophy")
      .eq("rank_id", rankId)
      .maybeSingle();
  },

  /**
   * Fetch abilities owned by a player in a specific room.
   */
  async getUserAbilities(
    roomId: string,
    userId: string,
    supabase: SupabaseClient
  ) {
    return supabase
      .from("ability_players")
      .select("ability_id, stock")
      .eq("user_id", userId)
      .eq("game_room_id", roomId);
  },

  /**
   * Fetch core user statistics and currency.
   */
  async getUserData(userId: string, supabase: SupabaseClient) {
    return supabase
      .from("users")
      .select("total_trophy, coin, total_match, total_rank_1, placement_ratio")
      .eq("user_id", userId)
      .maybeSingle();
  },

  /**
   * Update the user_games record for a player's match result.
   */
  async updateUserGame(
    userId: string,
    roomId: string,
    data: any,
    supabase: SupabaseClient
  ) {
    console.log(
      `[EndgameRepo] Upserting user_game for user=${userId}, room=${roomId}`
    );
    return supabase
      .from("user_games")
      .upsert(
        {
          user_id: userId,
          game_room_id: roomId,
          ...data,
          updated_at: getWIBNow(),
        },
        { onConflict: "game_room_id, user_id" }
      )
      .select();
  },

  /**
   * Update a user's global statistics (trophy, coin, matches, etc.).
   */
  async updateUserStats(userId: string, data: any, supabase: SupabaseClient) {
    console.log(`[EndgameRepo] Updating user_stats for user=${userId}`);
    return supabase
      .from("users")
      .update({
        ...data,
        updated_at: getWIBNow(),
      })
      .eq("user_id", userId)
      .select();
  },

  /**
   * Set the game room status to finished.
   */
  async updateGameRoomStatus(
    roomId: string,
    status: string,
    supabase: SupabaseClient
  ) {
    return supabase
      .from("game_rooms")
      .update({
        room_status: status,
        updated_at: getWIBNow(),
      })
      .eq("game_room_id", roomId);
  },

  /**
   * Get the start time of the first round for a more accurate match start.
   */
  async getEarliestRoundTime(roomId: string, supabase: SupabaseClient) {
    return supabase
      .from("match_rounds")
      .select("created_at")
      .eq("game_room_id", roomId)
      .order("round_number", { ascending: true })
      .limit(1)
      .maybeSingle();
  },
};
