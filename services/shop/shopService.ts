import { Character, UserCharacter } from "@/types";

export interface UserCharacterWithDetails extends Character {
  user_characters: Pick<UserCharacter, "user_id" | "is_used">[];
}

// Cache untuk semua characters — berlaku untuk session
let characterCache: UserCharacterWithDetails[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

/**
 * Fetch semua character dari katalog Supabase dengan caching
 * Data di-cache agar tidak fetch ulang setiap kali masuk shop
 *
 * @returns Array of all characters
 */
export async function getAllCharacters(): Promise<UserCharacterWithDetails[]> {
  try {
    // Cek apakah cache masih valid
    const now = Date.now();
    if (characterCache && now - cacheTimestamp < CACHE_DURATION) {
      console.log("[Cache] Using cached characters");
      return characterCache;
    }

    // Fetch dari API
    const url = new URL(
      `/api/characters`,
      typeof window === "undefined"
        ? process.env.NEXTAUTH_URL || "http://localhost:3000"
        : window.location.origin
    );

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch all characters: ${response.statusText}`);
    }

    const result = await response.json();
    const characters = result.data || [];

    // Simpan ke cache
    characterCache = characters;
    cacheTimestamp = now;

    console.log("[Cache] Character data cached until", new Date(now + CACHE_DURATION));
    return characters;
  } catch (error) {
    console.error("Error fetching all characters:", error);
    // Fallback ke cache lama jika masih ada
    if (characterCache) {
      console.warn("[Cache] Using stale cache due to fetch error");
      return characterCache;
    }
    throw error;
  }
}

/**
 * Invalidate character cache (gunakan setelah ada perubahan)
 */
export function invalidateCharacterCache() {
  characterCache = null;
  cacheTimestamp = 0;
  console.log("[Cache] Character cache invalidated");
}

/**
 * Fetch daftar character/skin yang dimiliki user dengan semua skin_level
 * Menggunakan inner join antara characters dan user_characters
 *
 * @param userId - ID user yang akan diquery
 * @param isUsed - Optional filter untuk hanya yang sedang digunakan (true/false)
 * @returns Array of characters with user_characters details (owned by user)
 */
export async function getUserCharacters(
  userId: string,
  isUsed?: boolean
): Promise<UserCharacterWithDetails[]> {
  try {
    const url = new URL(
      `/api/user-character/${userId}`,
      typeof window === "undefined"
        ? process.env.NEXTAUTH_URL || "http://localhost:3000"
        : window.location.origin
    );

    if (isUsed !== undefined) {
      url.searchParams.append("is_used", String(isUsed));
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch user characters: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching user characters:", error);
    throw error;
  }
}

/**
 * Fetch semua character yang dimiliki user dan sedang digunakan
 *
 * @param userId - ID user
 * @returns Character yang sedang digunakan
 */
export async function getUsedCharacter(userId: string): Promise<UserCharacterWithDetails | null> {
  try {
    const characters = await getUserCharacters(userId, true);
    return characters.length > 0 ? characters[0] : null;
  } catch (error) {
    console.error("Error fetching used character:", error);
    throw error;
  }
}
