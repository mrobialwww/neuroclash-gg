"use client";

import { MainButton } from "@/components/common/MainButton";
import { GameIcon } from "./DemoIcons";
import { useDemoStore } from "@/store/useDemoStore";
import { TUTORIAL_MESSAGES } from "@/lib/constants/demo-data";

export function IntroPhase() {
    const startGame = useDemoStore((s) => s.startGame);

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center px-4">
            <div className="flex max-w-2xl flex-col items-center space-y-6 text-center">
                <p className="text-7xl">
                    <GameIcon />
                </p>
                <h1 className="text-3xl font-extrabold text-white md:text-4xl">
                    {TUTORIAL_MESSAGES.intro.title}
                </h1>
                <p className="text-base text-white/70 md:text-lg">
                    {TUTORIAL_MESSAGES.intro.subtitle}
                </p>
                <div className="w-full space-y-3 rounded-2xl border border-white/10 bg-[#172844]/80 p-6 text-left">
                    {TUTORIAL_MESSAGES.intro.items.map((item, i) => (
                        <p
                            key={i}
                            className="flex gap-3 text-sm text-white/80 md:text-base"
                        >
                            <span className="shrink-0 text-base font-bold text-[#3D79F3] md:text-lg">
                                {i + 1}.
                            </span>
                            {item}
                        </p>
                    ))}
                </div>
                <MainButton
                    variant="green"
                    hasShadow
                    className="rounded-xl px-10 py-4 text-base font-bold md:text-lg"
                    onClick={startGame}
                >
                    {TUTORIAL_MESSAGES.intro.buttonLabel}
                </MainButton>
            </div>
        </main>
    );
}
