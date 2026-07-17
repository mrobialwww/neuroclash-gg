"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useMatchStore } from "@/store/useMatchStore";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerCard } from "@/components/match/PlayerCard";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { MainButton } from "@/components/common/MainButton";
import { BuffList } from "@/components/match/BuffList";
import { PlayerList } from "@/components/match/PlayerList";
import { useStarboxStore } from "@/store/useStarboxStore";

interface ProfBubuPhaseProps {
    gameRoomId: string;
    onPhaseComplete: () => void;
}

export const ProfBubuPhase = ({
    gameRoomId,
    onPhaseComplete,
}: ProfBubuPhaseProps) => {
    const { profBubuQuestion, currentUser, roomCode } = useMatchStore();
    const { myInventory } = useStarboxStore();

    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [correctAnswerId, setCorrectAnswerId] = useState<string | null>(null);

    // Get the correct answer ID from options
    useEffect(() => {
        if (profBubuQuestion) {
            const correctOpt = profBubuQuestion.options.find(
                (o: any) => o.isCorrect,
            );
            if (correctOpt) {
                setCorrectAnswerId(correctOpt.id);
            }
        }
    }, [profBubuQuestion]);

    const [isPhaseEnding, setIsPhaseEnding] = useState(false);

    // Timer Logic using setTimeout to avoid clearInterval race conditions
    useEffect(() => {
        if (isPhaseEnding) return;

        if (timeLeft <= 0) {
            setIsPhaseEnding(true);

            if (!isRevealed) {
                setIsRevealed(true);
                setIsCorrect(false);
            }

            // Karena kita menggunakan return kosong, timeout ini TIDAK AKAN PERNAH dibatalkan (cleared)
            // oleh React saat komponen re-render. Ini menjamin onPhaseComplete pasti dipanggil!
            setTimeout(() => {
                onPhaseComplete();
            }, 2000);
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, isPhaseEnding, isRevealed, onPhaseComplete]);

    const handleSelectAnswer = async (answerId: string) => {
        if (isRevealed || selectedId) return;

        setSelectedId(answerId);
        setIsRevealed(true);

        const correct = answerId === correctAnswerId;
        setIsCorrect(correct);

        if (correct) {
            // Berikan item materi ke user dengan memanggil API (simulasi drop StarBox / Ability Material)
            if (currentUser) {
                try {
                    // Beri ability material
                    await fetch("/api/drop-materials", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            game_room_id: gameRoomId,
                            user_id: currentUser.id,
                        }),
                    });

                    // Supaya inventory di client terupdate langsung setelah drop material
                    useStarboxStore
                        .getState()
                        .refreshMyInventory(gameRoomId, currentUser.id);
                } catch (err) {
                    console.error("Gagal menambahkan material", err);
                }
            }
        }

        // Timer biarkan tetap berjalan hingga 0, onPhaseComplete akan dipanggil oleh useEffect timer
    };

    const meCardData = currentUser
        ? {
              ...currentUser,
              health: 100, // Dummy health for visuals, doesn't actually decrease
              maxHealth: 100,
              status: "alive" as const,
              image: currentUser.avatar,
          }
        : null;

    const profBubuData = {
        id: "prof_bubu",
        username: "Prof. Bubu",
        avatar: "/mascot/mascot-match.webp",
        character: "ProfBubu",
        health: 100,
        maxHealth: 100,
        status: "alive" as const,
        image: "/mascot/mascot-match.webp",
    };

    return (
        <main className="relative z-50 flex min-h-screen w-full flex-col items-center gap-4 overflow-x-hidden px-4 py-6 sm:px-8 md:px-12">
            {/* Header Info */}
            <header className="mb-2 flex w-full max-w-[1400px] items-center justify-between">
                <div className="rounded-lg bg-[#A6A6A6]/40 px-2 py-1.5 text-sm font-semibold text-white backdrop-blur-xl md:px-4 md:text-base lg:px-6">
                    {roomCode}
                </div>

                <div className="block flex-1 px-2 md:px-4 lg:px-10">
                    {!isRevealed ? (
                        <div className="animate-in fade-in duration-300">
                            <MatchProgressBar
                                key="prof-bubu-progress"
                                duration={15}
                                timeLeft={timeLeft}
                                activeStepIndex={1}
                                isSolo={true}
                            />
                        </div>
                    ) : (
                        <div className="animate-in zoom-in fade-in slide-in-from-top-2 flex w-full items-center justify-center duration-500">
                            <div className="bg-linear-to-b relative flex items-center gap-3 rounded-full border-2 border-[#FFCB66]/60 from-[#2A1F0D]/90 to-[#0D0A04]/90 px-6 py-2 shadow-[0_0_30px_rgba(255,203,102,0.3)] backdrop-blur-xl">
                                <div className="absolute inset-0 rounded-full border border-white/10" />
                                <div className="relative h-5 w-5 animate-spin rounded-full border-[3px] border-[#FFCB66]/20 border-t-[#FFCB66] drop-shadow-[0_0_8px_rgba(255,203,102,1)]" />
                                <p className="relative animate-pulse text-sm font-black uppercase tracking-widest text-[#FFCB66] drop-shadow-[0_2px_8px_rgba(255,203,102,0.6)] md:text-base">
                                    Bonus Berakhir{" "}
                                    <span className="ml-1 text-white">
                                        {timeLeft}S
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <MainButton
                    variant="white"
                    className="h-8 shrink-0 px-2 text-sm md:px-4 md:text-base lg:h-9 lg:px-6"
                    onClick={() => {}} // Disabled in this phase
                    disabled
                >
                    Keluar
                </MainButton>
            </header>

            {/* Round indicator */}
            <p className="text-sm font-medium text-white/50">
                Bonus Soal Prof. Bubu
            </p>

            {/* Arena Wrapper */}
            <div className="flex w-full flex-1 items-start justify-center">
                <div className="grid w-full max-w-[1400px] grid-cols-2 items-stretch gap-x-4 gap-y-6 md:gap-6 lg:grid-cols-[210px_minmax(600px,1fr)_210px]">
                    {/* Kiri: User Card */}
                    <div className="order-1 flex h-full flex-col justify-end gap-4 self-stretch lg:order-1">
                        <div className="relative hidden min-h-[160px] flex-1 overflow-hidden lg:block">
                            <div className="absolute inset-0">
                                <BuffList
                                    buffs={myInventory}
                                    className="h-full"
                                />
                            </div>
                        </div>
                        <div className="w-full max-w-[320px] shrink-0 lg:max-w-none">
                            {meCardData ? (
                                <PlayerCard
                                    player={meCardData as any}
                                    isMe={true}
                                    className="w-full"
                                />
                            ) : (
                                <div className="h-[90px] w-full" />
                            )}
                        </div>
                    </div>

                    {/* Kanan: Prof Bubu Card */}
                    <div className="order-2 flex h-full flex-col items-end justify-end gap-4 self-stretch lg:order-3 lg:items-stretch">
                        <div className="relative hidden min-h-[160px] flex-1 overflow-hidden lg:block">
                            <div className="absolute inset-0">
                                <PlayerList players={[]} className="h-full" />
                            </div>
                        </div>
                        <div className="w-full max-w-[320px] shrink-0 lg:max-w-none">
                            <PlayerCard
                                player={profBubuData as any}
                                isMe={false}
                                hideHealthBar={true}
                                className="w-full border-4 border-[#FFA500] shadow-[0_0_20px_rgba(255,165,0,0.5)]"
                            />
                        </div>
                    </div>

                    {/* Tengah: Question Card */}
                    <div className="isolate order-3 col-span-2 mt-2 flex flex-col lg:order-2 lg:col-span-1 lg:mt-0">
                        {profBubuQuestion ? (
                            <QuestionCard
                                question={profBubuQuestion.question_text}
                                options={profBubuQuestion.options}
                                onSelect={handleSelectAnswer}
                                selectedId={selectedId}
                                disabled={isRevealed}
                                canAnswer={() => !isRevealed}
                                firstAnswerId={selectedId}
                                correctAnswerId={
                                    isRevealed ? correctAnswerId : null
                                }
                                lastAnswerCorrect={
                                    isRevealed ? isCorrect : null
                                }
                                opponentAnsweredFirst={false}
                                firstAnswerCorrect={isCorrect}
                                className="h-auto w-full"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/50">
                                Memuat Pertanyaan Prof. Bubu...
                            </div>
                        )}

                        {isRevealed && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 mt-4 flex flex-col items-center justify-center gap-4 duration-500">
                                {isCorrect === true && (
                                    <div className="rounded-xl border border-green-400 bg-green-500/20 px-6 py-3 text-center backdrop-blur-md">
                                        <p className="text-xl font-bold text-green-400">
                                            Tepat Sekali!
                                        </p>
                                        <p className="text-sm text-green-200">
                                            Materi Bacaan telah ditambahkan ke
                                            Inventory-mu.
                                        </p>
                                    </div>
                                )}

                                {isCorrect === false && (
                                    <div className="rounded-xl border border-red-400 bg-red-500/20 px-6 py-3 text-center backdrop-blur-md">
                                        <p className="text-xl font-bold text-red-400">
                                            Sayang Sekali!
                                        </p>
                                        <p className="text-sm text-red-200">
                                            Tetap semangat, perhatikan jawaban
                                            yang benar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};
