"use client";

import { cn } from "@/lib/utils/utils";
import { QuizOption } from "@/types/quiz";
import { AnswerOptionButton } from "./AnswerOptionButton";

interface QuestionCardProps {
    question: string;
    options: QuizOption[];
    onSelect?: (optionId: string) => void;
    selectedId?: string | null;
    disabled?: boolean;
    canAnswer?: boolean | (() => boolean);
    firstAnswerPlayerId?: string | null;
    firstAnswerId?: string | null;
    /** ID of the correct answer — revealed after answering (Solo mode) */
    correctAnswerId?: string | null;
    /** Whether the last answer was correct (Solo mode) — null means not yet answered */
    lastAnswerCorrect?: boolean | null;
    /** Whether the opponent (not the current user) answered first */
    opponentAnsweredFirst?: boolean;
    /** Display name of the first-answering opponent */
    opponentName?: string;
    /** Whether the opponent's first answer was correct */
    firstAnswerCorrect?: boolean | null;
    className?: string;
}

export const QuestionCard = ({
    question,
    options,
    onSelect,
    selectedId,
    disabled = false,
    canAnswer = true,
    firstAnswerPlayerId,
    firstAnswerId,
    correctAnswerId,
    lastAnswerCorrect,
    opponentAnsweredFirst = false,
    opponentName,
    className,
}: QuestionCardProps) => {
    const canUserAnswer =
        typeof canAnswer === "function" ? canAnswer() : canAnswer;

    // Whether we should show the correct/wrong reveal (Solo mode or after user answers)
    const shouldReveal =
        selectedId !== null &&
        selectedId !== undefined &&
        lastAnswerCorrect !== null &&
        lastAnswerCorrect !== undefined;

    // Helper states for inline explanation placement
    const chosenId = selectedId ?? (opponentAnsweredFirst ? firstAnswerId : null);
    const hasAnswered =
        (!!selectedId && lastAnswerCorrect !== null && lastAnswerCorrect !== undefined) ||
        opponentAnsweredFirst;
    const shouldShowExplanation = hasAnswered && !!correctAnswerId;
    const chosenIsCorrect = chosenId === correctAnswerId;

    const optionColors: Record<string, string> = {
        A: "text-[#3B82F6] border-[#3B82F6]",
        B: "text-[#EAB308] border-[#EAB308]",
        C: "text-[#22C55E] border-[#22C55E]",
        D: "text-[#A855F7] border-[#A855F7]",
    };

    const optionBgColors: Record<string, string> = {
        A: "bg-[#3B82F6]/20",
        B: "bg-[#EAB308]/20",
        C: "bg-[#22C55E]/20",
        D: "bg-[#A855F7]/20",
    };

    const getButtonStyle = (option: QuizOption) => {
        const isSelected = selectedId === option.id;
        const isCorrect = correctAnswerId === option.id;
        const isFirstAnswer = firstAnswerId === option.id;

        // Solo/post-submit reveal mode
        if (shouldReveal) {
            if (isCorrect) {
                return "border-[#008130] bg-[#008130]/30 scale-[1.02]";
            }
            if (isSelected && !lastAnswerCorrect) {
                return "border-[#B40000] bg-[#B40000]/30 scale-[1.02]";
            }
            return "border-white/10 opacity-40 cursor-not-allowed";
        }

        // Opponent answered first — highlight their answer and the correct answer
        if (opponentAnsweredFirst && correctAnswerId) {
            if (isCorrect) {
                return "border-[#008130] bg-[#008130]/30 scale-[1.02]";
            }
            if (isFirstAnswer && !isCorrect) {
                return "border-[#B40000] bg-[#B40000]/30 scale-[1.02]";
            }
            return "border-white/10 opacity-40 cursor-not-allowed";
        }

        // Multiplayer / normal logic
        if (isFirstAnswer) return "border-yellow-400 bg-yellow-400/20";
        if (isSelected) return "scale-[1.02] border-white/60 bg-white/10";

        const isDisabled =
            disabled ||
            !canUserAnswer ||
            (!!selectedId && selectedId !== option.id);
        if (isDisabled) return "cursor-not-allowed border-white/10 opacity-50";

        return "border-white/10 hover:border-white/40";
    };

    return (
        <div
            className={cn(
                "relative isolate z-0 -m-2 mx-auto flex w-full max-w-4xl flex-col gap-4 overflow-hidden p-2 lg:gap-6",
                className,
            )}
        >
            {/* Main Question Box */}
            <div
                className={cn(
                    "relative rounded-2xl border border-white/10 bg-[#D9D9D9]/20 p-6 shadow-lg backdrop-blur-md md:p-10 lg:p-12",
                    "flex items-center justify-center text-center",
                    "min-h-[120px] md:min-h-[180px] lg:min-h-[220px]",
                )}
            >
                <h2 className="text-lg font-semibold leading-relaxed tracking-tight text-white md:text-xl lg:text-3xl">
                    {question}
                </h2>
            </div>

            {/* Options Grid */}
            <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-2 lg:gap-6">
                {options.map((option) => {
                    const isFirstAnswer = firstAnswerId === option.id;
                    const isDisabled =
                        shouldReveal ||
                        opponentAnsweredFirst ||
                        disabled ||
                        !canUserAnswer ||
                        (!!selectedId && selectedId !== option.id);

                    const isCorrectOption = correctAnswerId === option.id;
                    const isChosenOption = chosenId === option.id;

                    let showOptionExplanation = false;
                    let optionExplanationLabel = "";
                    let optionExplanationVariant: "correct" | "incorrect" = "correct";

                    if (shouldShowExplanation) {
                        if (isCorrectOption) {
                            showOptionExplanation = true;
                            optionExplanationVariant = "correct";
                            if (isChosenOption) {
                                if (opponentAnsweredFirst && !selectedId) {
                                    optionExplanationLabel = `${opponentName || "Musuh"} menjawab benar!`;
                                } else {
                                    optionExplanationLabel = "Jawaban kamu benar!";
                                }
                            } else {
                                optionExplanationLabel = "Jawaban yang benar";
                            }
                        } else if (isChosenOption) {
                            showOptionExplanation = true;
                            optionExplanationVariant = "incorrect";
                            if (opponentAnsweredFirst && !selectedId) {
                                optionExplanationLabel = `${opponentName || "Musuh"} menjawab salah!`;
                            } else {
                                optionExplanationLabel = "Jawaban kamu salah!";
                            }
                        }
                    }

                    return (
                        <AnswerOptionButton
                            key={option.id}
                            option={option}
                            isSelected={selectedId === option.id}
                            isCorrect={correctAnswerId === option.id}
                            isFirstAnswer={isFirstAnswer}
                            isDisabled={isDisabled}
                            buttonStyle={getButtonStyle(option)}
                            optionColors={optionColors}
                            optionBgColors={optionBgColors}
                            onSelect={onSelect}
                            showExplanation={showOptionExplanation}
                            explanationLabel={optionExplanationLabel}
                            explanationVariant={optionExplanationVariant}
                        />
                    );
                })}
            </div>
        </div>
    );
};
