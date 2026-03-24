"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getAllCharacters,
  getUserCharacters,
  invalidateCharacterCache,
  UserCharacterWithDetails,
} from "@/services/shop/shopService";
import CharacterCard from "./CharacterCard";
import Sidebar from "./Sidebar";
import { ToastOverlay } from "@/components/common/ToastOverlay";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

import ShowroomView from "./ShowroomView";

type Filter = "karakter" | "skin" | "dimiliki" | "room";

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
  userCharsWithStatus: any[]
): (UserCharacterWithDetails & { owned: boolean; is_used?: boolean })[] {
  const ownedMap = new Map<number, { is_used: boolean }>();
  userCharsWithStatus.forEach(uc => {
    // is_used ada di dalam array user_characters hasil join!inner
    const isUsed = uc.user_characters?.[0]?.is_used || false;
    ownedMap.set(uc.character_id, { is_used: isUsed });
  });

  return allChars.map((char) => ({
    ...char,
    owned: ownedMap.has(char.character_id),
    is_used: ownedMap.get(char.character_id)?.is_used || false,
  }));
}

type Props = {
  userId: string;
};

export default function ShopClient({ userId }: Props) {
  const [filter, setFilter] = useState<Filter>("karakter");
  const [allCharacters, setAllCharacters] = useState<
    (UserCharacterWithDetails & { owned: boolean; is_used?: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { coins: coin, updateCoins } = useUserStore();
  const [purchasing, setPurchasing] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title?: string;
    message?: React.ReactNode;
    isFailed: boolean;
    customImage?: string;
    primaryText?: string;
    secondaryText?: string;
    onPrimary?: () => void;
    onSecondary?: () => void;
  }>({ isOpen: false, isFailed: false });

  /**
   * Fetch semua data yang dibutuhkan saat pertama kali mount
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user coin
      const userRes = await fetch(`/api/users/${userId}`);
      if (userRes.ok) {
        const userResult = await userRes.json();
        const userData = Array.isArray(userResult.data) ? userResult.data[0] : userResult.data;
        updateCoins(userData?.coin || 0);
      }

      // Fetch kategori katalog (cached)
      const allChars = await getAllCharacters();

      // Fetch karakter yang dimiliki user (beserta status is_used)
      const userChars = await getUserCharacters(userId);

      // Merge data
      const merged = mergeCharacterData(allChars, userChars);
      setAllCharacters(merged);
    } catch (err) {
      console.error("Error loading shop data:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data toko");
      setAllCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [userId, updateCoins]);

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

      case "room":
      default:
        return [];
    }
  };

  const handlePurchaseClick = (item: any) => {
    if (item.cost > coin) {
      setModal({
        isOpen: true,
        isFailed: true,
        title: "Koin Tidak Cukup!",
        message: "Maaf, koin kamu tidak cukup untuk membeli item ini. Main terus dan kumpulkan koin yang banyak!",
        primaryText: "Oke",
        onPrimary: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    if (item.skin_level !== "default") {
      const baseChar = allCharacters.find(
        (c) => c.base_character === item.base_character && c.skin_level === "default"
      );
      const hasDefault = baseChar?.owned;

      if (!hasDefault) {
        setModal({
          isOpen: true,
          isFailed: true,
          title: "Tidak Bisa Membeli Skin",
          customImage: baseChar?.image_url,
          message: (
            <span>
              Kamu belum memiliki karakter base <strong className="text-[#FFC300] font-bold">{item.base_character}</strong>. Beli karakter base terlebih dahulu sebelum membeli skin ini!
            </span>
          ),
          primaryText: "Oke",
          onPrimary: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }
    }

    // Confirmation
    setModal({
      isOpen: true,
      isFailed: false,
      title: "Konfirmasi Pembelian",
      customImage: item.image_url,
      message: (
        <div className="flex flex-col items-center gap-2">
          <span>Apakah kamu yakin ingin membeli <strong className="text-[#FFC300] font-bold">{item.skin_name || item.base_character}</strong> seharga</span>
          <div className="flex items-center justify-center gap-1.5 font-bold text-lg text-[#FFC300]">
            <Image src="/icons/coin-color.svg" width={20} height={20} alt="coin" />
            <span>{item.cost?.toLocaleString("id-ID")}</span>
          </div>
          <span className="text-white/60 text-sm mt-1">Koinmu akan tersisa <strong className="text-[#FFC300] font-bold">{(coin - item.cost).toLocaleString("id-ID")}</strong> koin.</span>
        </div>
      ),
      primaryText: "Beli",
      secondaryText: "Batal",
      onPrimary: () => executePurchase(item),
      onSecondary: () => setModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const executePurchase = async (item: any) => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      setModal(prev => ({ ...prev, isOpen: false }));

      const res = await fetch('/api/user-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          character_id: item.character_id,
          cost: item.cost,
          coin: coin,
          base_character: item.base_character,
          skin_level: item.skin_level,
        })
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Gagal membeli item");

      // Success
      setModal({
        isOpen: true,
        isFailed: false,
        title: "Pembelian Berhasil!",
        customImage: item.image_url,
        message: (
          <span>
            Berhasil membeli <strong className="text-[#FFC300] font-bold">{item.skin_name || item.base_character}</strong>!
          </span>
        ),
        primaryText: "Oke",
        onPrimary: () => {
          setModal((prev) => ({ ...prev, isOpen: false }));
          invalidateCharacterCache();
          loadData();
        },
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        isFailed: true,
        title: "Pembelian Gagal",
        message: err.message || "Telah terjadi kesalahan sistem",
        primaryText: "Oke",
        onPrimary: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setPurchasing(false);
    }
  };

  const displayed = getFilteredItems();

  return (
    <div className={cn(
      "w-full",
      filter === "room" ? "h-[calc(100dvh-72px)] overflow-hidden overscroll-none" : "min-h-screen"
    )}>
      <div className="relative flex w-full">
        <Sidebar
          active={filter}
          onChange={(f) => {
            setFilter(f);
            setError(null);
          }}
        />

        <main className={cn(
          "flex-1",
          filter === "room" ? "h-[calc(100dvh-72px)] overflow-hidden overscroll-none" : "min-h-screen",
          "md:ml-68"
        )}>
          <div className={cn(
            filter === "room"
              ? "w-full max-w-none p-0"
              : "max-w-[1400px] mx-auto px-6 py-10 pb-20 md:px-8 lg:px-12"
          )}>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-5 text-red-400 backdrop-blur-sm">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Memuat {filter === 'room' ? 'Ruang Ganti' : filter}...</p>
              </div>
            ) : filter === "room" ? (
              <ShowroomView
                userId={userId}
                allCharacters={allCharacters}
                loadData={loadData}
                onPurchaseClick={handlePurchaseClick}
              />
            ) : (
              <>
                {displayed.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-white/30 text-lg font-medium italic">Tidak ada {filter} untuk ditampilkan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {displayed.map((item) => (
                      <CharacterCard
                        key={`${item.character_id}-${item.skin_level}`}
                        id={String(item.character_id)}
                        image_url={item.image_url}
                        skin_name={item.skin_name}
                        cost={item.cost}
                        skin_level={item.skin_level}
                        name={item.base_character}
                        owned={item.owned}
                        onPurchase={() => handlePurchaseClick(item)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <ToastOverlay
        isOpen={modal.isOpen}
        onClose={() => {
          if (modal.onSecondary) modal.onSecondary();
          else if (modal.onPrimary) modal.onPrimary();
          else setModal(prev => ({ ...prev, isOpen: false }));
        }}
        title={modal.title}
        message={modal.message}
        isFailed={modal.isFailed}
        customImage={modal.customImage}
        primaryButtonText={modal.primaryText}
        secondaryButtonText={modal.secondaryText}
        onPrimaryClick={modal.onPrimary}
        onSecondaryClick={modal.onSecondary}
      />
    </div>
  );
}