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
  className?: string;
}

export const QuestionCard = ({
  question,
  options,
  onSelect,
  selectedId,
  className,
}: QuestionCardProps) => {
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
    <div className={cn("w-full max-w-4xl mx-auto flex flex-col gap-4 lg:gap-6 relative isolate z-0 overflow-hidden p-2 -m-2", className)}>
      {/* Main Question Box */}
      <div className={cn(
        "relative p-6 md:p-10 lg:p-12 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border border-white/10 shadow-lg",
        "flex items-center justify-center text-center",
        "min-h-[120px] md:min-h-[180px] lg:min-h-[220px]"
      )}>
        <h2 className="text-white text-lg md:text-xl lg:text-3xl font-semibold leading-relaxed tracking-tight">
          {question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6 shrink-0">
        {options.map((option) => {
          const isLongText = option.text.length > 50;

          return (
            <button
              key={option.id}
              onClick={() => onSelect?.(option.id)}
              disabled={!!selectedId}
              className={cn(
                "group relative flex items-center p-4 lg:p-6 rounded-2xl",
                "bg-[#D9D9D9]/20 backdrop-blur-md border-2 transition-colors",
                "min-h-[70px] md:min-h-[100px] lg:min-h-[140px]",
                "outline-none focus:outline-none focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                selectedId === option.id
                  ? "border-white/60 bg-white/10 scale-[1.02]"
                  : selectedId
                    ? "border-white/10 opacity-50 cursor-not-allowed"
                    : "border-white/10 hover:border-white/40"
              )}
            >
              {/* Label Circle (A, B, C, D) */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 left-3 lg:top-4 lg:translate-y-0 lg:left-4",
                  "w-6 h-6 lg:w-8 lg:h-8 rounded-full border flex items-center justify-center font-bold text-[10px] lg:text-sm",
                  optionColors[option.label],
                  optionBgColors[option.label]
                )}
              >
                {option.label}
              </div>

              {/* Option Text */}
              <div className="w-full text-center px-8 lg:px-6">
                <span
                  className={cn(
                    "text-white font-medium leading-tight block",
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