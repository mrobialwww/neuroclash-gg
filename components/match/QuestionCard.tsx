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
  className?: string;
}

export const QuestionCard = ({
  question,
  options,
  onSelect,
  className,
}: QuestionCardProps) => {
  // Warna mapping untuk border dan teks label ABCD
  const optionColors: Record<string, string> = {
    A: "text-[#3B82F6] border-[#3B82F6]",
    B: "text-[#EAB308] border-[#EAB308]",
    C: "text-[#22C55E] border-[#22C55E]",
    D: "text-[#A855F7] border-[#A855F7]",
  };

  // Warna background /20 untuk opsi
  const optionBgColors: Record<string, string> = {
    A: "bg-[#3B82F6]/20",
    B: "bg-[#EAB308]/20",
    C: "bg-[#22C55E]/20",
    D: "bg-[#A855F7]/20",
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto flex flex-col gap-6", className)}>
      {/* Main Question Box */}
      <div className={cn(
        "relative p-8 md:p-12 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10",
        "flex items-center justify-center text-center",
        "flex-1 min-h-[160px] md:min-h-[220px]"
      )}>
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed tracking-tight">
          {question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        {options.map((option) => {
          const isLongText = option.text.length > 50;

          return (
            <button
              key={option.id}
              onClick={() => onSelect?.(option.id)}
              className={cn(
                "group relative flex items-center p-4 md:p-6 rounded-2xl",
                "bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 hover:border-white/40",
                "min-h-[100px] md:min-h-[140px]"
              )}
            >
              {/* Label Circle (A, B, C, D) */}
              <div
                className={cn(
                  "absolute top-4 left-4 w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm",
                  optionColors[option.label],
                  optionBgColors[option.label]
                )}
              >
                {option.label}
              </div>

              {/* Option Text */}
              <div className="w-full text-center px-6">
                <span
                  className={cn(
                    "text-white font-regular leading-snug block",
                    isLongText
                      ? "text-sm md:text-base"
                      : "text-lg md:text-xl"
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