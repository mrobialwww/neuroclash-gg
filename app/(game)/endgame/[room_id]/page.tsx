"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { MainButton } from "@/components/common/MainButton";
import { EndgameRewardBadge } from "@/components/endgame/EndgameRewardBadge";
import { EndgamePodium, PodiumPlayer } from "@/components/endgame/EndgamePodium";
import { EndgameTable } from "@/components/endgame/EndgameTable";
import { EndgamePlayer } from "@/components/endgame/EndgameTableRow";
import { useMatchStore } from "@/store/useMatchStore";

export default function EndgamePage({ params }: { params: Promise<{ room_id: string }> }) {
  const router = useRouter();
  const { currentUser } = useMatchStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);
  const roomId = resolvedParams.room_id;

  useEffect(() => {
    async function fetchEndgame() {
      try {
        const res = await fetch(`/api/endgame/${roomId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setResults(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch endgame data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      fetchEndgame();
    }
  }, [roomId, currentUser]);

  const currentUserId = currentUser?.id || "unknown";
  const myResult = results.find((r) => r.userId === currentUserId);

  const reward = {
    coinsEarned: myResult?.coinsEarned || 0,
    trophyWon: myResult?.trophyWon || 0,
    coinBoost: myResult?.coinBoost || 0,
    trophyBoost: myResult?.trophyBoost || 0,
  };

  const podiumPlayers: PodiumPlayer[] = results
    .filter((r) => r.placement <= 3)
    .map((r) => ({
      userId: r.userId,
      placement: r.placement,
      username: r.username,
      baseCharacter: r.baseCharacter,
      characterImage: r.characterImage,
    }));

  const tablePlayers: EndgamePlayer[] = results.map((r) => ({
    id: r.userId,
    position: r.placement,
    username: r.username,
    baseCharacter: r.baseCharacter,
    characterImage: r.characterImage,
    playTime: r.survivalTime || (r.isAlive ? "Bertahan" : "-"),
    wins: r.win || 0,
    losses: r.lose || 0,
  }));

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <p className="text-white text-xl animate-pulse">Menghitung hasil pertandingan...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center overflow-x-hidden px-4 py-6 sm:px-8 md:px-12 relative">
      {/* HEADER SECTION */}
      <header className="relative z-20 flex w-full max-w-7xl flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-8 md:mb-12">
        {/* Buttons first on mobile, but second in order on desktop */}
        <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center sm:justify-end">
          <MainButton
            variant="white"
            className="text-sm font-bold md:text-base lg:text-lg h-8 lg:h-10 px-4 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            Kembali ke Dashboard
          </MainButton>
        </div>

        {/* Reward second on mobile, but first on desktop */}
        <div className="order-2 sm:order-1">
          <EndgameRewardBadge
            coinsEarned={reward.coinsEarned}
            trophyWon={reward.trophyWon}
            coinBoost={reward.coinBoost}
            trophyBoost={reward.trophyBoost}
          />
        </div>
      </header>

      {/* PODIUM SECTION */}
      <div className="relative z-10 w-full max-w-6xl mt-28 sm:mt-24 lg:mt-12 mb-4">
        <EndgamePodium players={podiumPlayers} />
      </div>

      {/* TABLE SECTION */}
      <div className="relative z-20 w-full max-w-5xl -mt-32 sm:-mt-48 md:-mt-56 lg:-mt-64 mb-8">
        <EndgameTable
          players={tablePlayers}
          currentUserId={currentUserId}
        />
      </div>
    </main>
  );
}
