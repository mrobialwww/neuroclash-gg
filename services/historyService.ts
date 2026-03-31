import { SupabaseClient } from "@supabase/supabase-js";
import { historyRepository } from "@/repository/historyRepository";

/**
 * historyService.ts
 * Layer: Service — business logic for history and statistics.
 */
export const historyService = {
  /**
   * Get paginated match history with global statistics.
   */
  async getPaginatedHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    supabase: SupabaseClient
  ) {
    const offset = (page - 1) * limit;

    // 1. Fetch user records from history
    const {
      data: userGamesData,
      error: userGamesError,
      count,
    } = await historyRepository.getUserGameHistory(userId, offset, limit, supabase);

    if (userGamesError) throw userGamesError;

    // 2. Fetch global statistics from user profile
    const { data: userData, error: userError } = await historyRepository.getUserStats(
      userId,
      supabase
    );
    if (userError) console.warn("[HistoryService] Warning getting user stats:", userError);

    // 3. Fetch Game Room details
    let combinedData = [];
    if (userGamesData && userGamesData.length > 0) {
      const roomIds = userGamesData.map((ug) => ug.game_room_id);
      const { data: roomsData, error: roomsError } = await historyRepository.getGameRooms(
        roomIds,
        supabase
      );

      if (roomsError) {
        console.error("[HistoryService] Error getting game rooms:", roomsError);
      }

      combinedData = userGamesData.map((ug) => ({
        ...ug,
        game_rooms: roomsData?.find((r) => r.game_room_id === ug.game_room_id) || {
          title: "Unknown Match",
          category: "General",
        },
      }));
    }

    // 4. Calculate formatted statistics (Source of Truth)
    const totalMatch = userData?.total_match || 0;
    const totalRank1 = userData?.total_rank_1 || 0;
    const placementRatio = userData?.placement_ratio || 0;

    // Win Rate: (total_rank_1 / total_match) * 100
    const winRate =
      totalMatch > 0
        ? ((totalRank1 / totalMatch) * 100).toFixed(2) + "%"
        : "0.00%";

    // Average Rank: (placement_ratio / total_match) * 100
    // Based on AGENTS.md formula: (Σ(placement / max_players) / total_match) * 100
    const averageRankPercent =
      totalMatch > 0
        ? ((placementRatio / totalMatch) * 100).toFixed(2)
        : "0.00";

    return {
      data: combinedData,
      pagination: {
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
      stats: {
        totalMatches: totalMatch,
        winRate,
        averageRank: averageRankPercent,
        firstPlaces: totalRank1,
      },
    };
  },
};
