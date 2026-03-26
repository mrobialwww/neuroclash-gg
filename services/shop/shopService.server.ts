import { invalidateCharacterCache } from "./shopService";

/**
 * Handle proses transaksi pembelian karakter/skin
 * Hanya untuk dipanggil di sisi SERVER (API Route atau Server Action)
 */
export async function buyCharacter({
  userId,
  characterId,
  cost,
  coin,
  baseCharacter,
  skinLevel,
}: {
  userId: string;
  characterId: number;
  cost: number;
  coin: number;
  baseCharacter: string;
  skinLevel: string;
}) {
  if (cost > coin) {
    throw new Error("Coin tidak mencukupi untuk membeli item ini");
  }

  // Import repository yang menggunakan supabase-server (Next.js headers)
  const { shopRepository } = await import("@/repository/shopRepository");

  try {
    await shopRepository.handleBuyItem(
      userId,
      characterId,
      cost,
      baseCharacter,
      skinLevel
    );

    // Invalidate cache (server-side)
    invalidateCharacterCache();
  } catch (error: any) {
    console.error("Error buying character:", error);
    throw new Error(error.message || "Gagal melakukan pembelian karakter.");
  }
}
