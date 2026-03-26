"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MainButton } from "@/components/common/MainButton";
import { EndgameRewardBadge } from "@/components/endgame/EndgameRewardBadge";
import { EndgamePodium, PodiumPlayer } from "@/components/endgame/EndgamePodium";
import { EndgameTable } from "@/components/endgame/EndgameTable";
import { EndgamePlayer } from "@/components/endgame/EndgameTableRow";

export default function EndgamePage() {
  const router = useRouter();

  // --- MOCK DATA ---
  const currentUserId = "user-123";

  const mockReward = {
    coinsEarned: 179,
    trophyWon: 89,
  };

  const mockPodiumPlayers: PodiumPlayer[] = [
    {
      userId: "u1",
      placement: 1,
      username: "Nama_User",
      baseCharacter: "Mecha Blaze",
      characterImage: "/legend/Mecha Blaze.webp",
    },
    {
      userId: "u2",
      placement: 2,
      username: "Nama_User",
      baseCharacter: "Jamur",
      characterImage: "/default/Jamur.webp",
    },
    {
      userId: "u3",
      placement: 3,
      username: "Nama_User",
      baseCharacter: "Batu Pendekar",
      characterImage: "/epic/Batu Pendekar.webp",
    },
  ];

  // Map to table players
  const mockTablePlayers: EndgamePlayer[] = [
    {
      id: "u1",
      position: 1,
      username: "Lorem_Ipsum_nama",
      baseCharacter: "Mecha Blaze",
      characterImage: "/legend/Mecha Blaze.webp",
      playTime: "15:04",
      wins: 7,
      losses: 5,
    },
    {
      id: "u2",
      position: 2,
      username: "Lorem_Ipsum_nama",
      baseCharacter: "Jamur",
      characterImage: "/default/Jamur.webp",
      playTime: "12:32",
      wins: 7,
      losses: 5,
    },
    {
      id: "u3",
      position: 3,
      username: "Lorem_Ipsum_nama",
      baseCharacter: "Batu Pendekar",
      characterImage: "/epic/Batu Pendekar.webp",
      playTime: "11:23",
      wins: 7,
      losses: 5,
    },
    {
      id: "user-123", // Matches current userId
      position: 4,
      username: "Lorem_Nama_User",
      baseCharacter: "Air",
      characterImage: "/default/Air.webp",
      playTime: "11:23",
      wins: 7,
      losses: 5,
    },
    {
      id: "u5",
      position: 5,
      username: "Lorem_Ipsum_nama",
      baseCharacter: "Akuatron",
      characterImage: "/legend/Akuatron.webp",
      playTime: "11:23",
      wins: 7,
      losses: 5,
    },
    {
      id: "u6",
      position: 6,
      username: "Lorem_Ipsum_nama",
      baseCharacter: "Api Baskara",
      characterImage: "/epic/Api Baskara.webp",
      playTime: "11:23",
      wins: 7,
      losses: 5,
    },
    { // Extra data to ensure list is filled as image shows multiple '5' (mocked)
      id: "u7",
      position: 7,
      username: "Lorem_Ipsum_nama",
      baseCharacter: "Robot",
      characterImage: "/default/Robot.webp",
      playTime: "11:23",
      wins: 7,
      losses: 5,
    },
  ];

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
            coinsEarned={mockReward.coinsEarned}
            trophyWon={mockReward.trophyWon}
          />
        </div>
      </header>

      {/* PODIUM SECTION */}
      <div className="relative z-10 w-full max-w-6xl mt-28 sm:mt-24 lg:mt-12 mb-4">
        <EndgamePodium players={mockPodiumPlayers} />
      </div>

      {/* TABLE SECTION */}
      <div className="relative z-20 w-full max-w-5xl -mt-32 sm:-mt-48 md:-mt-56 lg:-mt-64 mb-8">
        <EndgameTable
          players={mockTablePlayers}
          currentUserId={currentUserId}
        />
      </div>
    </main >
  );
}
