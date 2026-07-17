"use client";

import { MainButton } from "@/components/common/MainButton";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerList } from "@/components/match/PlayerList";
import { PlayerCard } from "@/components/match/PlayerCard";
import { DemoBuffPanel } from "./DemoBuffPanel";
import { TutorialOverlay, KitabOverlay } from "./DemoOverlays";
import { cn } from "@/lib/utils/utils";
import {
    useDemoStore,
    DemoPlayerState,
} from "@/store/useDemoStore";
import {
    DEMO_PROF_BUBU,
    DEMO_TOTAL_ROUNDS,
    DEMO_SECONDS_PER_ROUND,
} from "@/lib/constants/demo-data";

const DEMO_STEPS = [
    { id: "book", icon: "/icons/book.svg" },
    { id: "battle-1", icon: "/icons/battle.svg" },
    { id: "battle-2", icon: "/icons/battle.svg" },
    { id: "battle-3", icon: "/icons/battle.svg" },
    { id: "treasure", icon: "/icons/treasure.svg" },
    { id: "battle-4", icon: "/icons/battle.svg" },
];

export function BattlePhase() {
    const {
        currentRound,
        currentQuestionText,
        currentOptions,
        selectedAnswerId,
        isCorrectAnswer,
        timeLeft,
        players,
        userPlayer,
        botPlayers,
        currentOpponentId,
        roundScript,
        botSimState,
        roundResultMessage,
        tutorialMessage,
        showTutorialOverlay,
        activeBuffs,
        showKitabHint,
        kitabHintText,
        selectAnswer,
        useBuff,
        dismissTutorialOverlay,
        closeKitab,
        decrementTimer,
        resetStore,
    } = useDemoStore();

    const getOpponent = (): DemoPlayerState | null => {
        if (!currentOpponentId) return null;
        if (currentOpponentId === DEMO_PROF_BUBU.id) {
            return {
                id: DEMO_PROF_BUBU.id,
                name: DEMO_PROF_BUBU.name,
                character: DEMO_PROF_BUBU.character,
                image: DEMO_PROF_BUBU.image,
                health: 100,
                maxHealth: 100,
                isMe: false,
                isBot: false,
                isAlive: true,
            };
        }
        const found = players.find((p) => p.id === currentOpponentId);
        return found ?? botPlayers[0];
    };

    const opponent = getOpponent();
    const isProfBubuRound = roundScript?.isProfBubu ?? false;

    const activeStepIndex =
        currentRound >= 5 ? 5 : currentRound - 1;

    const handleExit = () => {
        resetStore();
        window.location.href = "/dashboard";
    };

    const mapToCard = (p: DemoPlayerState) => ({
        id: p.id,
        name: p.name,
        character: p.character,
        image: p.image,
        health: p.health,
        maxHealth: p.maxHealth,
    });
    const meCard = mapToCard(userPlayer);
    const oppCard = opponent ? mapToCard(opponent) : null;
    const playerListData = players.map((p) => ({
        id: p.id,
        name: p.name,
        character: p.character,
        image: p.image,
        health: p.health,
        maxHealth: p.maxHealth,
        isMe: p.isMe,
    }));

    return (
        <main className="flex min-h-screen w-full flex-col items-center gap-4 overflow-x-hidden px-4 py-6 sm:px-8 md:px-12">
            {showKitabHint && (
                <KitabOverlay hint={kitabHintText} onDismiss={closeKitab} />
            )}
            {showTutorialOverlay && tutorialMessage && (
                <TutorialOverlay
                    title={roundScript?.title}
                    message={tutorialMessage}
                    onDismiss={dismissTutorialOverlay}
                />
            )}

            <header className="mb-2 flex w-full max-w-[1400px] items-center justify-between">
                <div className="rounded-lg bg-[#A6A6A6]/40 px-2 py-1.5 text-sm font-semibold text-white backdrop-blur-xl md:px-4 md:text-base lg:px-6">
                    NEURO-DEMO
                </div>
                <div className="block flex-1 px-2 md:px-4 lg:px-10">
                    <MatchProgressBar
                        key={`round-${currentRound}`}
                        duration={DEMO_SECONDS_PER_ROUND}
                        timeLeft={timeLeft}
                        activeStepIndex={activeStepIndex}
                        steps={DEMO_STEPS}
                    />
                </div>
                <MainButton
                    variant="white"
                    className="h-8 shrink-0 px-2 text-sm md:px-4 md:text-base lg:h-9 lg:px-6"
                    onClick={handleExit}
                >
                    Keluar
                </MainButton>
            </header>

            <p className="text-sm font-medium text-white/70 md:text-base">
                Soal {currentRound} / {DEMO_TOTAL_ROUNDS}
            </p>

            <div className="flex w-full flex-1 items-start justify-center">
                <div className="w-full max-w-[1400px]">
                    {/* Result Message - above the grid */}
                    {roundResultMessage && botSimState === "resolved" && (
                        <div
                            className={cn(
                                "mx-auto mb-4 w-full max-w-xl rounded-xl px-4 py-3 text-center text-sm font-bold transition-all md:text-base",
                                isCorrectAnswer
                                    ? "border border-green-500/40 bg-green-500/20 text-green-300"
                                    : selectedAnswerId
                                    ? "border border-red-500/40 bg-red-500/20 text-red-300"
                                    : "border border-yellow-500/40 bg-yellow-500/20 text-yellow-300",
                            )}
                        >
                            {roundResultMessage}
                        </div>
                    )}

                    <div className="grid w-full grid-cols-2 items-stretch gap-x-4 gap-y-6 md:gap-6 lg:grid-cols-[210px_minmax(600px,1fr)_210px]">
                        {/* LEFT: User + Buff panel */}
                        <div className="order-1 flex flex-col justify-start self-stretch lg:order-1 lg:justify-between">
                            <div className="hidden h-[320px] lg:block">
                                <DemoBuffPanel
                                    buffs={activeBuffs}
                                    onUse={useBuff}
                                    className="h-full"
                                />
                            </div>
                            <div className="w-full max-w-[320px] lg:max-w-none">
                                <PlayerCard
                                    player={meCard}
                                    isMe
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* RIGHT: Opponent + Player list */}
                        <div className="order-2 flex flex-col items-end justify-start self-stretch lg:order-3 lg:items-stretch lg:justify-between">
                            <div className="hidden h-[320px] lg:block">
                                <PlayerList
                                    players={playerListData}
                                    className="h-full"
                                />
                            </div>
                            <div className="w-full max-w-[320px] lg:max-w-none">
                                {oppCard && (
                                    <PlayerCard
                                        player={oppCard}
                                        isMe={false}
                                        hideHealthBar={isProfBubuRound}
                                        className="w-full"
                                    />
                                )}
                            </div>
                        </div>

                        {/* CENTER: Question */}
                        <div className="isolate order-3 col-span-2 mt-2 flex flex-col items-center lg:order-2 lg:col-span-1 lg:mt-0">
                            <QuestionCard
                                question={currentQuestionText}
                                options={currentOptions.map((o) => ({
                                    id: o.id,
                                    label: o.key,
                                    text: o.text,
                                    isCorrect: o.isCorrect,
                                }))}
                                onSelect={selectAnswer}
                                selectedId={selectedAnswerId}
                                className="h-auto w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
