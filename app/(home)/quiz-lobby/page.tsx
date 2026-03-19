"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LobbyRoom } from "@/components/quiz/Lobby";

export default function QuizLobbyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-8">
      <LobbyRoom
        roomCode="127 089"
        roomTitle="Pemrograman Dasar"
        totalSlots={30}
        currentUser={{
          id: 1,
          name: "Budi_Gamer",
          character: "Slime",
          image: "/default/Slime.webp",
        }}
        host={{
          id: 2,
          name: "Andra",
          character: "Griffin",
          image: "/default/Griffin.webp",
          isHost: true,
        }}
        players={[
          { id: 3, name: "Citra", character: "Api", image: "/default/Api.webp" },
          { id: 4, name: "Dito", character: "Golem", image: "/default/Golem.webp" },
          { id: 5, name: "Eka", character: "Peri", image: "/default/Peri.webp" },
          { id: 6, name: "Fira", character: "Unicorn", image: "/default/Unicorn.webp" },
        ]}
        onLeave={() => router.push("/")}
      />
    </div>
  );
}
