"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MatchProgressBarProps {
  duration?: number;
  activeStepIndex?: number;
  className?: string;
}

export function MatchProgressBar({
  duration = 30,
  activeStepIndex = 0,
  className
}: MatchProgressBarProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const progressPercentage = (timeLeft / duration) * 100;

  const steps = [
    { id: "book", icon: "/icons/book.svg" },
    { id: "battle-1", icon: "/icons/battle.svg" },
    { id: "battle-2", icon: "/icons/battle.svg" },
    { id: "battle-3", icon: "/icons/battle.svg" },
    { id: "treasure", icon: "/icons/treasure.svg" },
  ];

  return (
    <div className={cn("w-full max-w-[95%] lg:max-w-[860px] mx-auto px-2", className)}>
      <div className="relative flex items-center">
        {/* Track Dasar */}
        <div className="absolute h-3 md:h-4 w-full rounded-full border border-white/40 bg-white/10 backdrop-blur-md" />

        {/* Progres Kiri */}
        <div className="absolute left-0 right-1/2 flex justify-start items-center h-full pr-8 md:pr-11 pointer-events-none">
          <div className="w-full h-2.5 md:h-3 overflow-hidden flex justify-end">
            <div
              className="h-full bg-[#FFCB66] rounded-l-full transition-all duration-1000 ease-linear origin-right"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Progres Kanan */}
        <div className="absolute right-0 left-1/2 flex justify-start items-center h-full pl-8 md:pl-11 pointer-events-none">
          <div className="w-full h-2.5 md:h-3 overflow-hidden">
            <div
              className="h-full bg-[#FFCB66] rounded-r-full transition-all duration-1000 ease-linear origin-left"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Timer Badge (Pusat) */}
        <div className="relative z-30 mx-auto flex h-6 w-20 md:h-8 md:w-24 items-center justify-center rounded-xl md:rounded-2xl border border-white/40 bg-[#0F111A] shadow-2xl">
          <span className="text-lg md:text-xl font-bold text-white">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Icons Indicators */}
      <div className="mt-4 flex justify-center gap-6 md:gap-8">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;

          return (
            <div key={step.id} className="relative flex flex-col items-center">
              <div
                className={cn(
                  "relative h-4 w-4 md:h-5 md:w-5 transition-all duration-500",
                  isActive ? "text-[#FFCC00] scale-110" : "text-white/40 scale-100"
                )}
              >
                <div
                  className="w-full h-full bg-current"
                  style={{
                    maskImage: `url(${step.icon})`,
                    WebkitMaskImage: `url(${step.icon})`,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}