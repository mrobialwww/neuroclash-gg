import { leaderboardRepository } from "@/repository/leaderboardRepository";
import { rankRepository } from "@/repository/rankRepository";
import { LeaderboardEntry, LeaderboardRankEntry } from "@/types";

export const leaderboardService = {
  async getLeaderboard(
    page: number,
    limit: number
  ): Promise<{
    data: LeaderboardRankEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { data, count, error } = await leaderboardRepository.getLeaderboard(
      page,
      limit
    );

    if (error || !data) {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const offset = (page - 1) * limit;

    // Enrich with rank data in parallel
    const enriched: LeaderboardRankEntry[] = await Promise.all(
      data.map(async (entry: LeaderboardEntry, i: number) => {
        const rank = await rankRepository.getRankByTrophy(entry.total_trophy);
        return {
          ...entry,
          position: offset + i + 1,
          rank: rank ?? null,
        };
      })
    );

    return {
      data: enriched,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  },

  async getUserLeaderboardEntry(
    userId: string
  ): Promise<LeaderboardRankEntry | null> {
    const entry = await leaderboardRepository.getUserLeaderboardEntry(userId);
    if (!entry) return null;

    const rank = await rankRepository.getRankByTrophy(entry.total_trophy);
    return { ...entry, rank: rank ?? null };
  },
};
