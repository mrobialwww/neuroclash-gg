"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";
import { GameIcon, TIcon, CIcon, StarIcon } from "./DemoIcons";
import { useDemoStore } from "@/store/useDemoStore";
import { TUTORIAL_MESSAGES, DEMO_TOTAL_ROUNDS } from "@/lib/constants/demo-data";

export function IntroPhase() {
    const startGame = useDemoStore((s) => s.startGame);

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center px-4">
            <div className="flex max-w-lg flex-col items-center space-y-6 text-center">
                <p className="text-6xl">
                    <GameIcon />
                </p>
                <h1 className="text-3xl font-extrabold text-white">
                    {TUTORIAL_MESSAGES.intro.title}
                </h1>
                <p className="text-lg text-white/60">
                    {TUTORIAL_MESSAGES.intro.subtitle}
                </p>
                <div className="w-full space-y-2 rounded-2xl border border-white/10 bg-[#1A1B23]/80 p-5 text-left">
                    {TUTORIAL_MESSAGES.intro.items.map((item, i) => (
                        <p
                            key={i}
                            className="flex gap-2 text-sm text-white/80"
                        >
                            <span className="shrink-0 text-[#3D79F3]">
                                {i + 1}.
                            </span>
                            {item}
                        </p>
                    ))}
                </div>
                <MainButton
                    variant="green"
                    hasShadow
                    className="rounded-xl px-10 py-4 text-lg font-bold"
                    onClick={startGame}
                >
                    {TUTORIAL_MESSAGES.intro.buttonLabel}
                </MainButton>
            </div>
        </main>
    );
}
