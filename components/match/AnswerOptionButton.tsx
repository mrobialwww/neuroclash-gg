"use client";

import { cn } from "@/lib/utils/utils";
import { QuizOption } from "@/types/quiz";

interface AnswerOptionButtonProps {
    option: QuizOption;
    isSelected: boolean;
    isCorrect: boolean;
    isFirstAnswer: boolean;
    isDisabled: boolean;
    buttonStyle: string;
    optionColors: Record<string, string>;
    optionBgColors: Record<string, string>;
    onSelect?: (optionId: string) => void;
    showExplanation?: boolean;
    explanationLabel?: string;
    explanationVariant?: "correct" | "incorrect";
}

export const AnswerOptionButton = ({
    option,
    isFirstAnswer,
    isDisabled,
    buttonStyle,
    optionColors,
    optionBgColors,
    onSelect,
    showExplanation = false,
    explanationLabel = "",
    explanationVariant = "correct",
}: AnswerOptionButtonProps) => {
    const isLongText = option.text.length > 50;

    return (
        <button
            onClick={() => onSelect?.(option.id)}
            disabled={isDisabled}
            className={cn(
                "group relative flex rounded-2xl p-4 lg:p-6 transition-all duration-300",
                "border-2 bg-[#D9D9D9]/20 backdrop-blur-md",
                showExplanation 
                    ? "flex-col items-start justify-start w-full text-left" 
                    : "items-center min-h-[70px] md:min-h-[100px] lg:min-h-[140px]",
                "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                buttonStyle,
            )}
        >
            {/* Label Circle (A, B, C, D) */}
            <div
                className={cn(
                    "absolute left-3 lg:left-4",
                    showExplanation 
                        ? "top-4 translate-y-0" 
                        : "top-1/2 -translate-y-1/2 lg:top-4 lg:translate-y-0",
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold lg:h-8 lg:w-8 lg:text-sm",
                    optionColors[option.label],
                    optionBgColors[option.label],
                    isFirstAnswer && "border-yellow-400 bg-white text-yellow-400",
                )}
            >
                {option.label}
                {isFirstAnswer && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] lg:text-[10px]">✓</span>
                    </div>
                )}
            </div>

            {/* Option Text */}
            <div className={cn(
                "w-full px-8 lg:px-6",
                showExplanation ? "text-left pl-8 lg:pl-10 mt-1" : "text-center"
            )}>
                <span
                    className={cn(
                        "block font-medium leading-tight text-white",
                        isLongText
                            ? "text-xs md:text-sm lg:text-base"
                            : "text-sm md:text-lg lg:text-xl",
                    )}
                >
                    {option.text}
                </span>

                {/* Explanation Content */}
                {showExplanation && (
                    <div className="mt-4 w-full border-t border-white/10 pt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className={cn(
                            "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1.5",
                            explanationVariant === "correct" ? "text-[#4ade80]" : "text-[#f87171]"
                        )}>
                            <span>{explanationVariant === "correct" ? "✓" : "✗"}</span>
                            <span>{explanationLabel}</span>
                        </div>
                        {option.explanation && (
                            <p className={cn(
                                "text-xs md:text-sm leading-relaxed font-normal normal-case",
                                explanationVariant === "correct" ? "text-[#4ade80]/90" : "text-[#f87171]/90"
                            )}>
                                {option.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
};
