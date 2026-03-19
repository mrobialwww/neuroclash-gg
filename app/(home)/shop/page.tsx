"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Sidebar from "@/components/shop/sidebar";
import Card from "@/components/shop/card";

type Item = { id: string; name: string; type: "karakter" | "skin"; owned?: boolean };

export default function ShopPage() {
	const [filter, setFilter] = useState<"karakter" | "skin" | "dimiliki">("karakter");

	const items: Item[] = [
		{ id: "k1", name: "Karakter A", type: "karakter", owned: false },
		{ id: "k2", name: "Karakter B", type: "karakter", owned: true },
		{ id: "s1", name: "Skin X", type: "skin", owned: false },
		{ id: "s2", name: "Skin Y", type: "skin", owned: true },
	];

	const filtered = items.filter((it) => {
		if (filter === "dimiliki") return it.owned === true;
		return it.type === filter;
	});

	return (
		<div className="min-h-screen">
			
			<div className="flex relative">
				<Sidebar active={filter} onChange={(f) => setFilter(f)} />

				<main className="flex-1 p-4 md:ml-68">
					<h1 className="text-2xl font-bold mb-4">Toko</h1>

					<div className="mb-4 text-sm text-gray-600">Menampilkan: {filter}</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
						{filtered.map((it) => (
							<Card
								key={it.id}
								id={it.id}
								image_url={(it as any).image_url}
								skin_name={(it as any).skin_name ?? it.name}
								cost={(it as any).cost}
								skin_level={(it as any).skin_level ?? "default"}
								name={it.name}
								owned={it.owned}
							/>
						))}
					</div>
				</main>
			</div>
		</div>
	);
}