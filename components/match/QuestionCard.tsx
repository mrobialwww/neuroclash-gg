"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  text: string;
}

interface QuestionCardProps {
  question: string;
  options: Option[];
  onSelect?: (optionId: string) => void;
  selectedId?: string | null;
  disabled?: boolean;
  canAnswer?: boolean | (() => boolean);
  firstAnswerPlayerId?: string | null;
  firstAnswerId?: string | null;
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
  className,
}: QuestionCardProps) => {
  const canUserAnswer =
    typeof canAnswer === "function" ? canAnswer() : canAnswer;

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

  return (
    <div
      className={cn(
        "relative isolate z-0 -m-2 mx-auto flex w-full max-w-4xl flex-col gap-4 overflow-hidden p-2 lg:gap-6",
        className
      )}
    >
      {/* Main Question Box */}
      <div
        className={cn(
          "relative rounded-2xl border border-white/10 bg-[#D9D9D9]/20 p-6 shadow-lg backdrop-blur-md md:p-10 lg:p-12",
          "flex items-center justify-center text-center",
          "min-h-[120px] md:min-h-[180px] lg:min-h-[220px]"
        )}
      >
        <h2 className="text-lg font-semibold leading-relaxed tracking-tight text-white md:text-xl lg:text-3xl">
          {question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-2 lg:gap-6">
        {options.map((option) => {
          const isLongText = option.text.length > 50;
          const isFirstAnswer = firstAnswerId === option.id;
          const isDisabled =
            disabled ||
            !canUserAnswer ||
            (!!selectedId && selectedId !== option.id);

          return (
            <button
              key={option.id}
              onClick={() => onSelect?.(option.id)}
              disabled={isDisabled}
              className={cn(
                "group relative flex items-center rounded-2xl p-4 lg:p-6",
                "border-2 bg-[#D9D9D9]/20 backdrop-blur-md transition-colors",
                "min-h-[70px] md:min-h-[100px] lg:min-h-[140px]",
                "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                isFirstAnswer && "border-yellow-400 bg-yellow-400/20",
                selectedId === option.id
                  ? "scale-[1.02] border-white/60 bg-white/10"
                  : isDisabled
                  ? "cursor-not-allowed border-white/10 opacity-50"
                  : "border-white/10 hover:border-white/40"
              )}
            >
              {/* Label Circle (A, B, C, D) */}
              <div
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 lg:left-4 lg:top-4 lg:translate-y-0",
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold lg:h-8 lg:w-8 lg:text-sm",
                  optionColors[option.label],
                  optionBgColors[option.label],
                  isFirstAnswer && "border-yellow-400 bg-white text-yellow-400"
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
              <div className="w-full px-8 text-center lg:px-6">
                <span
                  className={cn(
                    "block font-medium leading-tight text-white",
                    isLongText
                      ? "text-xs md:text-sm lg:text-base"
                      : "text-sm md:text-lg lg:text-xl"
                  )}
                >
                  {option.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
