import { HistoryItem } from "@/types/HistoryItem";
import { formatToWIBTime, formatToWIBDate } from "@/lib/utils/dateUtils";

/**
 * API Response dari user-game/history endpoint
 */
export interface UserGameHistory {
  game_room_id: string;
  user_id: string;
  trophy_won: number;
  coins_earned: number;
  placement: number | null;
  win: number;
  lose: number;
  created_at: string;
  updated_at: string;
  user_game_id: string;
  game_rooms?: {
    title: string;
    category: string;
  };
}

export interface PaginatedUserGameHistory {
  history: HistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalMatches: number;
    winRate: string;
    averageRank: string;
    firstPlaces: number;
  };
}

export interface UserGameHistoryWithStats {
  history: HistoryItem[];
  stats: {
    totalMatches: number;
    winRate: string;
    averageRank: string;
    firstPlaces: number;
  };
}

// Cache untuk history data — berlaku untuk session
let historyCache: Map<
  string,
  { data: PaginatedUserGameHistory; timestamp: number }
> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

/**
 * Transform API response ke HistoryItem format
 * @param rawData - Data dari API endpoint
 * @returns HistoryItem yang siap ditampilkan
 */
function transformToHistoryItem(rawData: UserGameHistory): HistoryItem {
  const timeStr = formatToWIBTime(rawData.created_at);
  const dateStr = formatToWIBDate(rawData.created_at);

  // Simplified: we'll use a fixed placeholder or fetch character later.
  // For now, let's at least show the win/loss as material fallback if empty
  const category = rawData.game_rooms?.category || "umum";
  const title = rawData.game_rooms?.title || "Pertandingan";
  const placement = rawData.placement ? `${rawData.placement}` : "-";

  return {
    id: rawData.user_game_id,
    avatar: "", // Will be mapped in HistoryTable using current equipped avatar
    time: timeStr,
    date: dateStr,
    material: title,
    category: category,
    rank: placement,
    trophy: rawData.trophy_won,
    coin: rawData.coins_earned,
    win: rawData.win,
    lose: rawData.lose,
  };
}

/**
 * Fetch user game history berdasarkan user_id dengan caching
 *
 * @param userId - ID user yang akan diquery
 * @param page - Halaman yang diminta (default 1)
 * @param limit - Jumlah item per halaman (default 10)
 * @returns Array dari history items dan metadata pagination
 */
export async function getUserGameHistory(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedUserGameHistory> {
  if (!userId) {
    return {
      history: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      stats: {
        totalMatches: 0,
        winRate: "0%",
        averageRank: "0",
        firstPlaces: 0,
      },
    };
  }
  try {
    const cacheKey = `${userId}_p${page}_l${limit}`;
    // Cek cache
    const cached = historyCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(
        "[Cache] Using cached history for user:",
        userId,
        "page:",
        page
      );
      return cached.data;
    }

    // Fetch dari API
    const url = new URL(
      `/api/user-game/history/${userId}`,
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        : window.location.origin
    );
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());

    const response = await fetch(url.toString(), {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    const result = await response.json();
    const rawHistoryData: UserGameHistory[] = result.data || [];
    const pagination = result.pagination || {
      total: rawHistoryData.length,
      page,
      limit,
      totalPages: 1,
    };

    // Transform ke HistoryItem
    const historyItems = rawHistoryData.map(transformToHistoryItem);

    const paginatedResult = {
      history: historyItems,
      pagination,
      stats: result.stats,
    };

    // Simpan ke cache
    historyCache.set(cacheKey, {
      data: paginatedResult,
      timestamp: now,
    });

    console.log(
      "[Cache] History data cached until",
      new Date(now + CACHE_DURATION)
    );
    return paginatedResult;
  } catch (error) {
    console.error("Error fetching user game history:", error);

    const cacheKey = `${userId}_p${page}_l${limit}`;
    // Fallback ke cache lama jika masih ada (any page might do if current fails, but ideally same key)
    const cached = historyCache.get(cacheKey);
    if (cached) {
      console.warn("[Cache] Using stale cache due to fetch error");
      return cached.data;
    }

    throw error;
  }
}

/**
 * Invalidate history cache untuk user tertentu
 * Gunakan setelah ada perubahan data
 *
 * @param userId - Optional, jika tidak di-pass akan clear semua cache
 */
export function invalidateHistoryCache(userId?: string) {
  if (userId) {
    historyCache.delete(userId);
    console.log("[Cache] History cache invalidated for user:", userId);
  } else {
    historyCache.clear();
    console.log("[Cache] All history cache invalidated");
  }
}
export type { HistoryItem };
