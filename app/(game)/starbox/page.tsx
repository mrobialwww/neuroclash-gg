"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";
import { AbilityCard } from "@/components/match/AbilityCard";
import { PlayerGridCard } from "@/components/match/PlayerGridCard";
import { MOCK_PLAYERS, Player } from "@/lib/constants/players";
import { cn } from "@/lib/utils";

export default function StarboxPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps = [
    { id: "book", icon: "/icons/book.svg" },
    { id: "battle-1", icon: "/icons/battle.svg" },
    { id: "battle-2", icon: "/icons/battle.svg" },
    { id: "battle-3", icon: "/icons/battle.svg" },
    { id: "battle-4", icon: "/icons/battle.svg" },
    { id: "battle-5", icon: "/icons/battle.svg" },
    { id: "treasure", icon: "/icons/treasure.svg" },
  ];

  // Ability Data
  const abilities = [
    {
      id: "1",
      name: "KITAB PENGETAHUAN",
      description: "Mendapatkan materi untuk menjawab soal berikutnya",
      stock: 2,
      image: "/ability-card/material-card.webp",
      emptyImage: "/ability-card/material-card-empty.webp"
    },
    {
      id: "2",
      name: "SERANGAN TAJAM",
      description: "Meningkatkan kekuatan serangan dasar sebesar +10.",
      stock: 0,
      image: "/ability-card/attack-card.webp",
      emptyImage: "/ability-card/attack-card-empty.webp"
    },
    {
      id: "3",
      name: "RAMUAN PENYEMBUH",
      description: "Memulihkan 20 poin HP secara instan",
      stock: 2,
      image: "/ability-card/heal-card.webp",
      emptyImage: "/ability-card/heal-card-empty.webp"
    },
    {
      id: "4",
      name: "PERISAI KOKOH",
      description: "Mendapatkan pertahanan sebesar 20 poin",
      stock: 2,
      image: "/ability-card/shield-card.webp",
      emptyImage: "/ability-card/shield-card-empty.webp"
    },
    {
      id: "5",
      name: "PIALA KEJAYAAN",
      description: "Menambah jumlah trophy yang diperoleh sebesar 5%",
      stock: 2,
      image: "/ability-card/trophy-buff-card.webp",
      emptyImage: "/ability-card/trophy-buff-card-empty.webp"
    },
    {
      id: "6",
      name: "KANTONG HARTA",
      description: "Menambah jumlah koin yang diperoleh sebesar 5%",
      stock: 2,
      image: "/ability-card/coin-buff-card.webp",
      emptyImage: "/ability-card/coin-buff-card-empty.webp"
    },
  ];

  useEffect(() => {
    const fetchStarboxData = async () => {
      try {
        setIsLoading(true);
        // Simulasi fetching data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const data = {
          roomCode: "127 089",
          players: Array(5).fill(MOCK_PLAYERS).flat().slice(0, 40),
          activeStep: 6, // Treasure
        };

        setRoomCode(data.roomCode);
        setPlayers(data.players);
        setActiveStepIndex(data.activeStep);
      } catch (error) {
        console.error("Error fetching starbox data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStarboxData();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3D79F3] border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-semibold animate-pulse">Menyiapkan Starbox...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-6 px-4 md:px-8 lg:px-12 relative overflow-x-hidden pt-4 md:pt-6">

      <div className="relative z-10 w-full max-w-[1400px] flex flex-col items-center gap-8 pb-8">
        {/* Header */}
        <header className="w-full flex items-center justify-between mb-2">
          <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-2 md:px-4 lg:px-6 py-1.5 rounded-lg font-semibold text-white text-sm md:text-base">
            {roomCode}
          </div>

          {/* Icons Indicators */}
          <div className="flex-1 flex justify-center gap-2 sm:gap-4 md:gap-6 px-4">
            {steps.map((step, index) => {
              const isActive = index === activeStepIndex;

              return (
                <div key={step.id} className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "relative h-5 w-5 md:h-6 md:w-6 transition-all duration-500 flex items-center justify-center",
                      isActive ? "text-[#FFCC00]" : "text-white/40"
                    )}
                  >
                    <div
                      className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] bg-current"
                      style={{
                        maskImage: `url(${step.icon})`,
                        WebkitMaskImage: `url(${step.icon})`,
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <MainButton variant="white" className="px-2 md:px-4 lg:px-6 h-8 lg:h-9 text-sm md:text-base shrink-0">
            Keluar
          </MainButton>
        </header>

        {/* Title Section */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold tracking-tight drop-shadow-lg">
            Takdir ada di tanganmu, pilih satu kekuatan!
          </h1>
        </div>

        {/* Ability Selection Grid */}
        <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-4 w-full mx-auto">
          {abilities.map((ability) => (
            <div key={ability.id} className="w-[160px] md:w-[180px] lg:w-[200px] shrink-0">
              <AbilityCard
                name={ability.name}
                description={ability.description}
                image={ability.image}
                emptyImage={ability.emptyImage}
                stock={ability.stock}
              />
            </div>
          ))}
        </div>

        {/* Player Grid Container */}
        <div className="w-full py-6 px-4 sm:px-8 lg:px-10 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 shadow-2xl">
          <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 items-center justify-items-center">
            {players.map((player, idx) => (
              <PlayerGridCard
                key={`${player.id}-${idx}`}
                player={player}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
