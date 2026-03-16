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
    <main className="min-h-screen w-full px-4 sm:px-8 md:px-12 py-8 gap-4 flex flex-col items-center overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-[1400px] flex items-center justify-between mb-4">
        <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-4 md:px-6 py-1.5 rounded-lg font-semibold text-white text-sm md:text-base">
          {roomCode}
        </div>

        <div className="flex-1 hidden md:block px-10">
          <MatchProgressBar duration={30} />
        </div>

        <MainButton variant="white" className="px-6 h-9 text-sm md:text-base shrink-0">
          Keluar
        </MainButton>
      </header>

      {/* Arena Wrapper */}
      <div className="flex-1 w-full flex justify-center items-start">
        <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-[210px_minmax(600px,1fr)_210px] gap-6 items-stretch">

          {/* Left Column */}
          <div className="flex flex-col order-2 lg:order-1 self-stretch justify-between">
            <div className="max-h-[320px] overflow-hidden">
              <BuffList className="h-full" />
            </div>
            <PlayerCard player={me} isMe={true} className="shrink-0" />
          </div>

          {/* Center Column */}
          <div className="flex flex-col order-1 lg:order-2">
            <QuestionCard
              question={currentQuestion.question}
              options={currentQuestion.options}
              onSelect={handleSelectAnswer}
              className="w-full h-auto"
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col order-3 lg:order-3 self-stretch justify-between">
            <div className="max-h-[340px] overflow-hidden">
              <PlayerList players={players} className="h-full" />
            </div>
            <PlayerCard player={opponent} isMe={false} className="shrink-0" />
          </div>

        </div>
      </div>
    </main>
  );
}
