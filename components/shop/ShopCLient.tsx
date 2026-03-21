"use client";

import React, { useState, useEffect, useCallback } from "react";

import Sidebar from "@/components/shop/sidebar";
import Card from "@/components/shop/card";
import { getAllCharacters, getUserCharacters, UserCharacterWithDetails } from "@/services/shop/shopService";

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
	const [allCharacters, setAllCharacters] = useState<(UserCharacterWithDetails & { owned: boolean })[]>([]);
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
		
			<div className="flex relative">
				<Sidebar active={filter} onChange={(f) => { setFilter(f); setError(null); }} />

				<main className="flex-1 p-4 md:ml-68">
					

					{error && (
						<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
							{error}
						</div>
					)}

					{loading ? (
						<div className="text-center py-12 text-gray-600">
							Memuat {filter}...
						</div>
					) : (
						<>
							

							{displayed.length === 0 ? (
								<div className="text-center py-12 text-gray-500">
									Tidak ada {filter} untuk ditampilkan
								</div>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
				</main>
			</div>
		</div>
	);
}
