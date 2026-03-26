"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BuffItem } from "./BuffItem";
import { OverlayMaterialCard } from "./OverlayMaterialCard";
import { OverlayAbilityCard } from "./OverlayAbilityCard";

interface Buff {
  id: string;
  name: string;
  type: "material" | "attack" | "heal" | "shield" | "coin" | "trophy";
  image: string;
  label: string;
}

const MOCK_BUFFS: Buff[] = [
  { id: "b1", name: "Materi A", type: "material", image: "/buff/material.webp", label: "Materi A" },
  { id: "b2", name: "Materi B", type: "material", image: "/buff/material.webp", label: "Materi B" },
  { id: "b3", name: "Materi C", type: "material", image: "/buff/material.webp", label: "Materi C" },
  { id: "b4", name: "Attack", type: "attack", image: "/buff/attack.webp", label: "Serangan" },
  { id: "b5", name: "Shield", type: "shield", image: "/buff/shield.webp", label: "Perisai" },
  { id: "b6", name: "Heal", type: "heal", image: "/buff/heal.webp", label: "Penyembuh" },
  { id: "b7", name: "Coin Buff", type: "coin", image: "/buff/coin-buff.webp", label: "Koin+" },
  { id: "b8", name: "Trophy Buff", type: "trophy", image: "/buff/trophy-buff.webp", label: "Trofi+" },
];

const MOCK_MATERIAL_CONTENT: Record<string, { materialName: string; content: string }> = {
  "Materi A": {
    materialName: "Sistem Pencernaan Manusia",
    content: "Sistem pencernaan manusia adalah rangkaian organ yang bekerja sama untuk memecah makanan menjadi nutrisi yang bisa diserap tubuh dan membuang sisa-sisanya.\n\nProses dimulai di mulut. Makanan dikunyah dan dicampur dengan air liur yang mengandung enzim amilase untuk memecah karbohidrat.\n\nSelanjutnya makanan melewati kerongkongan menuju lambung. Di lambung, asam klorida dan enzim pepsin memecah protein menjadi peptida yang lebih kecil.\n\nDi usus halus, nutrisi seperti karbohidrat, protein, lemak, vitamin, dan mineral diserap ke dalam darah. Dinding usus halus dilengkapi vili dan mikrovili yang memperluas area penyerapan.\n\nAkhirnya, usus besar menyerap air dan membentuk feses. Feses lalu dikeluarkan melalui anus. Seluruh proses ini memakan waktu 24 hingga 72 jam dan sangat penting untuk memberikan energi bagi tubuh.",
  },
  "Materi B": {
    materialName: "Sistem Pernapasan",
    content: "Sistem pernapasan manusia berfungsi untuk mengambil oksigen (O2) dari udara dan membuang karbon dioksida (CO2).\n\nUrutan organ pernapasan: Hidung -> Faring -> Laring -> Trakea -> Bronkus -> Bronkiolus -> Alveolus.\n\nDi Alveolus terjadi pertukaran gas secara difusi antara udara dan darah.",
  },
  "Materi C": {
    materialName: "Sistem Peredaran Darah",
    content: "Sistem peredaran darah terdiri dari Jantung, Pembuluh Darah, dan Darah.\n\nJantung berfungsi memompa darah ke seluruh tubuh. Darah mengangkut oksigen, nutrisi, dan hormon ke sel-sel tubuh.",
  },
};

const MOCK_ABILITIES: Record<string, any> = {
  "Attack": {
    id: "a1",
    name: "Serangan Tajam",
    description: "Meningkatkan kekuatan serangan dasar sebesar +10.",
    image: "/ability-card/attack-card.webp",
    emptyImage: "/ability-card/attack-card-empty.webp",
    stock: 2,
  },
  "Shield": {
    id: "a2",
    name: "Perisai Kokoh",
    description: "Menahan 50% damage yang diterima pada babak berikutnya.",
    image: "/ability-card/shield-card.webp",
    emptyImage: "/ability-card/shield-card-empty.webp",
    stock: 1,
  },
  "Heal": {
    id: "a3",
    name: "Ramuan Pemulih",
    description: "Memulihkan 20 HP secara instan.",
    image: "/ability-card/heal-card.webp",
    emptyImage: "/ability-card/heal-card-empty.webp",
    stock: 3,
  },
  "Coin Buff": {
    id: "a4",
    name: "Magnet Koin",
    description: "Mendapatkan koin 2x lebih banyak pada babak ini.",
    image: "/ability-card/coin-buff-card.webp",
    emptyImage: "/ability-card/coin-buff-card-empty.webp",
    stock: 1,
  },
  "Trophy Buff": {
    id: "a5",
    name: "Puncak Prestasi",
    description: "Mendapatkan tambahan trofi jika memenangkan duel.",
    image: "/ability-card/trophy-buff-card.webp",
    emptyImage: "/ability-card/trophy-buff-card-empty.webp",
    stock: 1,
  },
};

interface BuffListProps {
  buffs?: Buff[];
  className?: string;
}

export const BuffList = ({ buffs = [], className }: BuffListProps) => {
  const [selectedMaterial, setSelectedMaterial] = React.useState<Buff | null>(null);
  const [selectedAbility, setSelectedAbility] = React.useState<any>(null);

  const handleBuffClick = (buff: Buff) => {
    if (buff.type === "material") {
      setSelectedMaterial(buff);
    } else {
      const ability = MOCK_ABILITIES[buff.name];
      if (ability) {
        setSelectedAbility(ability);
      }
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative w-full p-2 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 shadow-2xl flex flex-col items-center",
          className
        )}
      >
        {/* Header Badge */}
        <div className="relative w-full max-w-[180px] h-[35px] md:h-[40px] shrink-0 flex items-center justify-center mb-3">
          <Image
            src="/match/match-badge.webp"
            alt="Badge"
            fill
            sizes="(max-width: 768px) 180px, 200px"
            className="object-contain"
            priority
          />
          <h2 className="relative z-10 text-white font-semibold text-[10px] xs:text-xs md:text-base tracking-tight mt-0.5">
            Materi & Kekuatan
          </h2>
        </div>

        {/* Buff Grid Container */}
        <div className="w-full flex-1 overflow-y-auto scrollbar-hide pb-2 flex flex-col">
          {buffs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4 text-center text-sm font-medium text-white/50">
              Belum ada materi dan kekuatan yang kamu dapat
            </div>
          ) : (
            <div
              className="grid gap-x-2 gap-y-1 mx-auto w-full"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(65px, 1fr))",
              }}
            >
              {buffs.map((buff) => (
                <BuffItem
                  key={buff.id}
                  buff={buff}
                  onClick={() => handleBuffClick(buff)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <OverlayMaterialCard
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        title={selectedMaterial?.name || ""}
        materialName={
          selectedMaterial ? MOCK_MATERIAL_CONTENT[selectedMaterial.name]?.materialName : ""
        }
        content={
          selectedMaterial ? MOCK_MATERIAL_CONTENT[selectedMaterial.name]?.content : ""
        }
      />

      <OverlayAbilityCard
        isOpen={!!selectedAbility}
        ability={selectedAbility}
        onClose={() => setSelectedAbility(null)}
        onUse={(id) => {
          console.log("Using ability:", id);
          // Backend logic will be added here
        }}
      />
    </>
  );
};
