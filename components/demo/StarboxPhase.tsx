"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MainButton } from "@/components/common/MainButton";
import { PlayerGridCard } from "@/components/match/PlayerGridCard";
import { AbilityCard } from "@/components/match/AbilityCard";
import { TutorialOverlay } from "./DemoOverlays";
import { cn } from "@/lib/utils/utils";
import { useDemoStore } from "@/store/useDemoStore";
import { TUTORIAL_MESSAGES } from "@/lib/constants/demo-data";

const STARBOX_STEPS = [
    { id: "book", icon: "/icons/book.svg" },
    { id: "battle-1", icon: "/icons/battle.svg" },
    { id: "battle-2", icon: "/icons/battle.svg" },
    { id: "battle-3", icon: "/icons/battle.svg" },
    { id: "battle-4", icon: "/icons/battle.svg" },
    { id: "battle-5", icon: "/icons/battle.svg" },
    { id: "treasure", icon: "/icons/treasure.svg" },
];

export function StarboxPhase() {
    const router = useRouter();
    const {
        players,
        abilities,
        starboxTurnIndex,
        pickingAbilityId,
        allStarboxPicked,
        showTutorialOverlay,
        starboxProgress,
        userSelectAbility,
        nextStarboxTurn,
        dismissTutorialOverlay,
        resetStore,
    } = useDemoStore();

    const sortedHpPlayers = [...players].sort((a, b) => a.health - b.health);
    const cp = sortedHpPlayers[starboxTurnIndex];
    const isUserTurn = cp?.isMe ?? false;
    const remainingItems = abilities.reduce((sum, a) => sum + a.stock, 0);

    const handleExit = () => {
        resetStore();
        router.push("/dashboard");
    };

    return (
        <main className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden px-4 py-6 pt-4 md:px-8 md:pt-6 lg:px-12">
            {showTutorialOverlay && (
                <TutorialOverlay
                    title={"STARBOX"}
                    message={TUTORIAL_MESSAGES.starbox}
                    onDismiss={dismissTutorialOverlay}
                />
            )}

            <div className="max-w-350 relative z-10 flex w-full flex-col items-center gap-8 pb-8">
                <header className="mb-2 flex w-full items-center justify-between">
                    <div className="rounded-lg bg-[#A6A6A6]/40 px-2 py-1.5 text-sm font-semibold text-white backdrop-blur-xl md:px-4 md:text-base lg:px-6">
                        NEURO-DEMO
                    </div>
                    <div className="flex flex-1 justify-center gap-2 px-4 sm:gap-4 md:gap-6">
                        {STARBOX_STEPS.map((step, index) => {
                            const isActive = index === 6;
                            return (
                                <div
                                    key={step.id}
                                    className="relative flex flex-col items-center"
                                >
                                    <div
                                        className={cn(
                                            "relative flex h-5 w-5 items-center justify-center transition-all duration-500 md:h-6 md:w-6",
                                            isActive
                                                ? "text-[#FFCC00]"
                                                : "text-white/40",
                                        )}
                                    >
                                        <div
                                            className="h-[18px] w-[18px] bg-current md:h-[20px] md:w-[20px]"
                                            style={{
                                                maskImage: `url(${step.icon})`,
                                                WebkitMaskImage: `url(${step.icon})`,
                                                maskRepeat: "no-repeat",
                                                WebkitMaskRepeat: "no-repeat",
                                                maskPosition: "center",
                                                WebkitMaskPosition: "center",
                                                maskSize: "contain",
                                                WebkitMaskSize: "contain",
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <MainButton
                        variant="white"
                        className="h-8 shrink-0 px-2 text-sm md:px-4 md:text-base lg:h-9 lg:px-6"
                        onClick={handleExit}
                    >
                        Keluar
                    </MainButton>
                </header>

                <div className="flex flex-col items-center text-center">
                    <h1 className="text-balance text-xl font-bold tracking-tight text-white drop-shadow-lg md:text-2xl lg:text-3xl">
                        Takdir ada di tanganmu, pilih satu kekuatan!
                    </h1>
                    {!allStarboxPicked && cp && (
                        <div className="mt-2 flex flex-col items-center gap-2">
                            <p className="text-lg font-medium text-white/80">
                                Giliran:{" "}
                                <span
                                    className={
                                        isUserTurn
                                            ? "text-[#22C55E]"
                                            : "text-[#FFCB66]"
                                    }
                                >
                                    {isUserTurn ? "Kamu" : cp.name}
                                </span>
                                <span className="ml-2 text-sm text-white/60">
                                    (HP terendah memilih lebih awal)
                                </span>
                            </p>
                        </div>
                    )}
                    <p className="mt-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/60">
                        Sisa Item Keseluruhan:{" "}
                        <span className="text-white">
                            {remainingItems} Terakhir
                        </span>
                    </p>
                </div>

                {isUserTurn && !allStarboxPicked && (
                    <p className="animate-pulse text-sm font-semibold text-[#FFCC00]">
                        Ini giliranmu! Pilih{" "}
                        <strong>KITAB PENGETAHUAN</strong> - item paling OP
                        untuk ronde final!
                    </p>
                )}

                <div
                    className={cn(
                        "mx-auto flex w-full flex-wrap items-center justify-center gap-3 transition-all lg:gap-4",
                        !isUserTurn && !allStarboxPicked
                            ? "pointer-events-none opacity-70"
                            : "",
                    )}
                >
                    {abilities.map((a) => (
                        <div
                            key={a.id}
                            className="md:w-45 lg:w-50 relative w-40 shrink-0 transition-all duration-300"
                        >
                            <AbilityCard
                                name={a.name}
                                description={a.description}
                                image={a.image}
                                emptyImage={a.emptyImage}
                                stock={a.stock}
                                onClick={() => {
                                    if (!isUserTurn || pickingAbilityId)
                                        return;
                                    userSelectAbility(a.id);
                                    setTimeout(
                                        () => nextStarboxTurn(),
                                        1000,
                                    );
                                }}
                                className={cn(
                                    a.id === "1"
                                        ? "rounded-lg ring-2 ring-[#FFCC00] ring-offset-2 ring-offset-transparent"
                                        : "",
                                    pickingAbilityId === a.id
                                        ? "scale-105 rounded-lg ring-2 ring-white saturate-150"
                                        : "",
                                )}
                            />
                        </div>
                    ))}
                </div>

                <div className="max-w-300 relative mt-8 w-full overflow-visible rounded-3xl border border-white/10 bg-white/5 px-6 py-10 shadow-2xl backdrop-blur-md sm:px-8 lg:px-12">
                    {!allStarboxPicked && cp && (
                        <div className="max-w-100 absolute -top-5 left-1/2 z-30 flex w-full -translate-x-1/2 items-center justify-center px-4">
                            <div className="relative flex h-auto w-full items-center justify-center">
                                <Image
                                    src="/dashboard/trophy-badge.webp"
                                    alt="Badge Background"
                                    width={400}
                                    height={70}
                                    className="-z-10 block h-full w-full object-contain drop-shadow-xl"
                                    priority
                                />
                                <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8">
                                    <span className="text-center text-xs font-bold uppercase leading-tight text-white drop-shadow-md sm:text-sm md:text-base">
                                        {isUserTurn
                                            ? "Sekarang giliran kamu untuk memilih kekuatan!"
                                            : `Giliran ${cp.name}...`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className="grid gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12"
                        style={{
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(110px, 1fr))",
                        }}
                    >
                        {sortedHpPlayers.map((player, idx) => {
                            const isActiveTurn = starboxTurnIndex === idx;
                            const hasPicked = idx < starboxTurnIndex;
                            return (
                                <div
                                    key={`${player.id}-${idx}`}
                                    className="w-full"
                                >
                                    <PlayerGridCard
                                        player={{
                                            id: player.id,
                                            name: player.name,
                                            character: player.character,
                                            image: player.image,
                                            health: player.health,
                                            maxHealth: player.maxHealth,
                                            isMe: player.isMe,
                                        }}
                                        hideHealthBar={false}
                                        highlight={
                                            player.isMe
                                                ? "self"
                                                : undefined
                                        }
                                        hasPicked={hasPicked}
                                        isActiveTurn={
                                            isActiveTurn &&
                                            !allStarboxPicked
                                        }
                                        progress={
                                            isActiveTurn && !allStarboxPicked
                                                ? starboxProgress
                                                : 0
                                        }
                                        progressColor={
                                            player.isMe
                                                ? "bg-[#D46B1D]/80"
                                                : "bg-[#FDBB38]/80"
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {allStarboxPicked && (
                    <p className="animate-pulse text-sm font-medium text-[#22C55E]">
                        Semua pemain telah memilih! Menyiapkan babak
                        selanjutnya...
                    </p>
                )}
            </div>
        </main>
    );
}
