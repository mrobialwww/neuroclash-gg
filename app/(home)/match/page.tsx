"use client";

import React, { useState, useEffect } from "react";
import { MainButton } from "@/components/common/MainButton";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerList } from "@/components/match/PlayerList";
import { BuffList } from "@/components/match/BuffList";
import { PlayerCard } from "@/components/match/PlayerCard";
import { MOCK_PLAYERS, Player } from "@/lib/constants/players";

interface Option {
  id: string;
  label: string;
  text: string;
}

interface QuestionData {
  question: string;
  options: Option[];
}

export default function MatchPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [roomCode, setRoomCode] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [me, setMe] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setIsLoading(true);

        // Simulasi mapping data dari source constants
        const data = {
          roomCode: "127 089",
          players: MOCK_PLAYERS,
          me: MOCK_PLAYERS.find((p) => p.isMe) || MOCK_PLAYERS[0],
          opponent: MOCK_PLAYERS[5],
          questionData: {
            question: "Apa nama platform yang diusulkan oleh PT. Jalin Mayantara Indonesia?",
            options: [
              { id: "A", label: "A", text: "Jalin Digital Transformation" },
              { id: "B", label: "B", text: "Jalin AI Service Platform" },
              { id: "C", label: "C", text: "Centralized AI Gateway" },
              { id: "D", label: "D", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
            ]
          }
        };

        setRoomCode(data.roomCode);
        setPlayers(data.players);
        setMe(data.me);
        setOpponent(data.opponent);
        setCurrentQuestion(data.questionData);
      } catch (error) {
        console.error("Error fetching match data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchData();
  }, []);

  const handleSelectAnswer = async (optionId: string) => {
    console.log("Selected:", optionId);
  };

  // State loading
  if (isLoading || !me || !opponent || !currentQuestion) {
    return (
      <main className="min-h-screen w-full bg-[#0B0D14] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3D79F3] border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-semibold animate-pulse">Memuat Arena...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full px-4 sm:px-8 md:px-12 py-6 gap-4 flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-[1400px] flex items-center justify-between mb-2">
        <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-2 md:px-4 lg:px-6 py-1.5 rounded-lg font-semibold text-white text-sm md:text-base">
          {roomCode}
        </div>

        <div className="flex-1 block px-2 md:px-4 lg:px-10">
          <MatchProgressBar duration={30} />
        </div>

        <MainButton variant="white" className="px-2 md:px-4 lg:px-6 h-8 lg:h-9 text-sm md:text-base shrink-0">
          Keluar
        </MainButton>
      </header>

      {/* Arena Wrapper */}
      <div className="flex-1 w-full flex justify-center items-start">
        <div className="w-full max-w-[1400px] grid grid-cols-2 lg:grid-cols-[210px_minmax(600px,1fr)_210px] gap-x-4 gap-y-6 md:gap-6 items-stretch">

          {/* TOP ROW (Mobile: Pojok Kiri & Kanan) */}

          {/* My Player Card (Pojok Kiri) */}
          <div className="order-1 lg:order-1 flex flex-col justify-start lg:justify-between self-stretch">
            <div className="hidden lg:block max-h-[320px] overflow-hidden">
              <BuffList className="h-full" />
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              <PlayerCard player={me} isMe={true} className="w-full" />
            </div>
          </div>

          {/* Opponent Player Card (Pojok Kanan) */}
          <div className="order-2 lg:order-3 flex flex-col justify-start lg:justify-between items-end lg:items-stretch self-stretch">
            <div className="hidden lg:block max-h-[320px] overflow-hidden">
              <PlayerList players={players} className="h-full" />
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              <PlayerCard player={opponent} isMe={false} className="w-full" />
            </div>
          </div>

          {/* CENTER ROW (Question) */}
          <div className="col-span-2 lg:col-span-1 order-3 lg:order-2 flex flex-col mt-2 lg:mt-0 isolate">
            <QuestionCard
              question={currentQuestion.question}
              options={currentQuestion.options}
              onSelect={handleSelectAnswer}
              className="w-full h-auto"
            />
          </div>

          {/* BOTTOM ROW (Mobile Only Lists) */}

          {/* Buff List Mobile (Kiri) */}
          <div className="order-4 lg:hidden col-span-1">
            <BuffList className="w-full h-[200px] sm:h-[240px]" />
          </div>

          {/* Player List Mobile (Kanan) */}
          <div className="order-5 lg:hidden col-span-1">
            <PlayerList players={players} className="w-full h-[200px] sm:h-[240px]" />
          </div>

        </div>
      </div>
    </main>
  );
}
