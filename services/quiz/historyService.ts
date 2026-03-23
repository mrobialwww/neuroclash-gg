import { HistoryItem } from "@/types/HistoryItem";

/**
 * API Response dari user-game/history endpoint
 */
export interface UserGameHistory {
  game_room_id: string;
  user_id: string;
  trophy_won: number;
  coins_earned: number;
  created_at: string;
  updated_at: string;
  user_game_id: string;
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
let historyCache: Map<string, { data: HistoryItem[]; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

/**
 * Transform API response ke HistoryItem format
 * @param rawData - Data dari API endpoint
 * @returns HistoryItem yang siap ditampilkan
 */
function transformToHistoryItem(rawData: UserGameHistory): HistoryItem {
  const date = new Date(rawData.created_at);
  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h12",
  });
  const dateStr = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    id: rawData.user_game_id,
    avatar: "/default/Slime.webp", // Default avatar, bisa dikembangkan untuk fetch character avatar
    time: timeStr,
    date: dateStr,
    material: "Quiz", // Bisa dikembangkan untuk fetch material dari game_room
    rank: "-", // Bisa dikembangkan untuk fetch rank dari game_room
    trophy: rawData.trophy_won,
    coin: rawData.coins_earned,
  };
}

/**
 * Fetch user game history berdasarkan user_id dengan caching
 *
 * @param userId - ID user yang akan diquery
 * @returns Array dari history items
 */
export async function getUserGameHistory(userId: string): Promise<HistoryItem[]> {
  try {
    // Cek cache
    const cached = historyCache.get(userId);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log("[Cache] Using cached history for user:", userId);
      return cached.data;
    }

    // Fetch dari API
    const url = new URL(
      `/api/user-game/history/${userId}`,
      typeof window === "undefined"
        ? process.env.NEXTAUTH_URL || "http://localhost:3000"
        : window.location.origin
    );

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    const result = await response.json();
    const rawHistoryData: UserGameHistory[] = result.data || [];

    // Transform ke HistoryItem
    const historyItems = rawHistoryData.map(transformToHistoryItem);

    // Simpan ke cache
    historyCache.set(userId, {
      data: historyItems,
      timestamp: now,
    });

    console.log(
      "[Cache] History data cached until",
      new Date(now + CACHE_DURATION)
    );
    return historyItems;
  } catch (error) {
    console.error("Error fetching user game history:", error);

    // Fallback ke cache lama jika masih ada
    const cached = historyCache.get(userId);
    if (cached) {
      console.warn("[Cache] Using stale cache due to fetch error");
      return cached.data;
    }

    throw error;
  }
}

/**
 * Calculate statistics dari history data
 *
 * @param historyItems - Array dari history items
 * @returns Object berisi statistics
 */
export function calculateHistoryStats(historyItems: HistoryItem[]) {
  const totalMatches = historyItems.length;
  const firstPlaces = historyItems.filter(
    (item) => item.rank === "1" || item.rank.startsWith("1/")
  ).length;
  const winRate =
    totalMatches > 0
      ? ((firstPlaces / totalMatches) * 100).toFixed(2) + "%"
      : "0%";

  // Extract numeric rank untuk average calculation
  const ranks = historyItems
    .map((item) => {
      const match = item.rank.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((rank) => rank > 0);

  const averageRank =
    ranks.length > 0
      ? (ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(2)
      : "0";

  return {
    totalMatches,
    winRate,
    averageRank,
    firstPlaces,
  };
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

