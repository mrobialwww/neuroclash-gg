"use client";

import { cn } from "@/lib/utils/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MatchProgressBarProps {
    duration?: number;
    timeLeft: number;
    activeStepIndex?: number;
    isSolo?: boolean;
    isFinished?: boolean;
    steps?: { id: string; icon: string }[];
    className?: string;
}

const DEFAULT_STEPS = [
    { id: "book", icon: "/icons/book.svg" },
    { id: "battle-1", icon: "/icons/battle.svg" },
    { id: "battle-2", icon: "/icons/battle.svg" },
    { id: "battle-3", icon: "/icons/battle.svg" },
    { id: "battle-4", icon: "/icons/battle.svg" },
    { id: "battle-5", icon: "/icons/battle.svg" },
    { id: "treasure", icon: "/icons/treasure.svg" },
];

export function MatchProgressBar({
    duration = 30,
    timeLeft,
    activeStepIndex = 0,
    isSolo = false,
    isFinished = false,
    steps: customSteps,
    className,
}: MatchProgressBarProps) {
    const progressPercentage = (timeLeft / duration) * 100;

    const allSteps = customSteps ?? DEFAULT_STEPS;

    const steps = isSolo
        ? allSteps.filter((s) => s.id.startsWith("battle"))
        : allSteps;

    const effectiveActiveIndex = isSolo
        ? activeStepIndex - 1 // activeStepIndex=1 → index 0 (battle-1)
        : activeStepIndex;

    return (
        <div
            className={cn(
                "mx-auto w-full max-w-[95%] lg:max-w-[860px]",
                className,
            )}
        >
            {/* Wrapper Timer */}
            <div className="relative flex h-4 w-full items-center md:h-5">
                {/* Track Dasar */}
                <div
                    className={cn(
                        "absolute h-3 w-full rounded-full border border-white/40 bg-white/10 backdrop-blur-md transition-all duration-700 md:h-4",
                        isFinished ? "scale-y-75 opacity-30" : "opacity-100",
                    )}
                />

                {/* Progres Kiri */}
                <div className="pointer-events-none absolute left-0 right-1/2 flex h-full items-center justify-start pr-8 md:pr-11">
                    <div className="flex h-2.5 w-full justify-end overflow-hidden md:h-3">
                        <div
                            className={cn(
                                "h-full origin-right rounded-l-full bg-[#FFCB66] transition-all duration-1000 ease-linear",
                                isFinished
                                    ? "duration-500! opacity-0"
                                    : "opacity-100",
                            )}
                            style={{
                                width: isFinished
                                    ? "0%"
                                    : `${progressPercentage}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Progres Kanan */}
                <div className="pointer-events-none absolute left-1/2 right-0 flex h-full items-center justify-start pl-8 md:pl-11">
                    <div className="h-2.5 w-full overflow-hidden md:h-3">
                        <div
                            className={cn(
                                "h-full origin-left rounded-r-full bg-[#FFCB66] transition-all duration-1000 ease-linear",
                                isFinished
                                    ? "duration-500! opacity-0"
                                    : "opacity-100",
                            )}
                            style={{
                                width: isFinished
                                    ? "0%"
                                    : `${progressPercentage}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Timer Badge (Pusat) */}
                <div
                    className={cn(
                        "relative z-30 mx-auto flex h-6 items-center justify-center rounded-xl border border-white/40 shadow-2xl transition-all duration-500 ease-out md:h-8 md:rounded-2xl",
                        isFinished
                            ? "w-28 border-[#FFCB66]/40 bg-[#FFCB66]/20 md:w-32"
                            : "w-20 bg-[#0F111A] md:w-24",
                    )}
                >
                    <AnimatePresence mode="wait">
                        {!isFinished ? (
                            <motion.span
                                key="time"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                                className="text-lg font-bold text-white md:text-xl"
                            >
                                {timeLeft}
                            </motion.span>
                        ) : (
                            <motion.span
                                key="done"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="text-xs font-bold uppercase tracking-wider text-[#FFCB66] md:text-sm"
                            >
                                Selesai
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Icons Indicators */}
            <div className="mt-4 flex justify-center gap-2 sm:gap-4 md:gap-6">
                {steps.map((step, index) => {
                    const isActive = index === effectiveActiveIndex;

                    return (
                        <div
                            key={step.id}
                            className="relative flex flex-col items-center"
                        >
                            <div
                                className={cn(
                                    "relative h-4 w-4 transition-all duration-500 md:h-5 md:w-5",
                                    isActive
                                        ? "scale-110 text-[#FFCC00]"
                                        : "scale-100 text-white/40",
                                )}
                            >
                                <div
                                    className="h-full w-full bg-current"
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
