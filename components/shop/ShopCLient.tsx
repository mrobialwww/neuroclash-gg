"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getAllCharacters,
  getUserCharacters,
  UserCharacterWithDetails,
} from "@/services/shop/shopService";
import Card from "./CharacterCard";
import { Sidebar } from "./Sidebar";

type Filter = "karakter" | "skin" | "dimiliki";

/**
 * Tentukan tipe berdasarkan skin_level:
 * - default = karakter (hijau)
 * - epic = skin (ungu)
 * - legend = skin (oranye)
 */
function getItemType(skinLevel: string): "karakter" | "skin" {
  return skinLevel === "default" ? "karakter" : "skin";
}

/**
 * Merge data all characters dengan owned characters
 * Menandai mana yang owned dan mana yang tidak
 */
function mergeCharacterData(
  allChars: UserCharacterWithDetails[],
  ownedCharIds: Set<number>
): (UserCharacterWithDetails & { owned: boolean })[] {
  return allChars.map((char) => ({
    ...char,
    owned: ownedCharIds.has(char.character_id),
  }));
}

type Props = {
  userId: string;
};

export default function ShopClient({ userId }: Props) {
  const [filter, setFilter] = useState<Filter>("karakter");
  const [allCharacters, setAllCharacters] = useState<
    (UserCharacterWithDetails & { owned: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch semua data yang dibutuhkan saat pertama kali mount
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch kategori katalog (cached)
      const allChars = await getAllCharacters();

      // Fetch karakter yang dimiliki user
      const userChars = await getUserCharacters(userId);
      const ownedCharIds = new Set(userChars.map((char) => char.character_id));

      // Merge data
      const merged = mergeCharacterData(allChars, ownedCharIds);
      setAllCharacters(merged);
    } catch (err) {
      console.error("Error loading shop data:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data toko");
      setAllCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Load data saat component mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Filter items berdasarkan active filter
   */
  const getFilteredItems = () => {
    switch (filter) {
      case "karakter":
        // Hanya items dengan skin_level === "default"
        // Sort: yang tidak owned dulu, baru yang owned (owned di akhir)
        return allCharacters
          .filter((it) => getItemType(it.skin_level) === "karakter")
          .sort((a, b) => {
            // false (tidak owned) datang terlebih dahulu
            // true (owned) datang di akhir
            if (a.owned === b.owned) return 0;
            return a.owned ? 1 : -1;
          });

      case "skin":
        // Hanya items dengan skin_level === "epic" atau "legend"
        // Sort: legend dulu baru epic, dengan owned di akhir
        return allCharacters
          .filter((it) => getItemType(it.skin_level) === "skin")
          .sort((a, b) => {
            // Prioritas 1: yang tidak owned datang dulu
            if (a.owned !== b.owned) {
              return a.owned ? 1 : -1;
            }

            // Prioritas 2: legend datang dulu, baru epic
            const levelOrder: Record<string, number> = {
              legend: 0,
              epic: 1,
            };
            const levelA = levelOrder[a.skin_level] ?? 2;
            const levelB = levelOrder[b.skin_level] ?? 2;
            return levelA - levelB;
          });

      case "dimiliki":
        // Hanya items yang owned === true
        // Sort berdasarkan skin_level (legend dulu baru epic/default)
        return allCharacters
          .filter((it) => it.owned === true)
          .sort((a, b) => {
            const levelOrder: Record<string, number> = {
              legend: 0,
              epic: 1,
              default: 2,
            };
            const levelA = levelOrder[a.skin_level] ?? 3;
            const levelB = levelOrder[b.skin_level] ?? 3;
            return levelA - levelB;
          });

      default:
        return [];
    }
  };

  const displayed = getFilteredItems();

  return (
    <div className="min-h-screen">
      <div className="relative flex">
        <Sidebar
          active={filter}
          onChange={(f) => {
            setFilter(f);
            setError(null);
          }}
        />

        <main className="md:ml-68 flex-1 min-h-screen">
          <div className="mx-auto max-w-[1400px] px-6 py-10 pb-20 md:px-8 lg:px-12">
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-5 text-red-400 backdrop-blur-sm">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Memuat {filter}...</p>
              </div>
            ) : (
              <>
                {displayed.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-white/30 text-lg font-medium italic">Tidak ada {filter} untuk ditampilkan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {displayed.map((item) => (
                      <Card
                        key={`${item.character_id}-${item.skin_level}`}
                        id={String(item.character_id)}
                        image_url={item.image_url}
                        skin_name={item.skin_name}
                        cost={item.cost}
                        skin_level={item.skin_level}
                        name={item.base_character}
                        owned={item.owned}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
