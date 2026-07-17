"use client";

import { MainButton } from "@/components/common/MainButton";
import { PlayerGridCard } from "@/components/match/PlayerGridCard";
import { TutorialOverlay } from "./DemoOverlays";
import { useDemoStore } from "@/store/useDemoStore";
import { TUTORIAL_MESSAGES } from "@/lib/constants/demo-data";

export function LobbyPhase() {
    const {
        players,
        showTutorialOverlay,
        dismissTutorialOverlay,
    } = useDemoStore();

    return (
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
            {showTutorialOverlay && (
                <TutorialOverlay
                    message={TUTORIAL_MESSAGES.lobby}
                    onDismiss={dismissTutorialOverlay}
                />
            )}
            <div className="flex w-full max-w-2xl flex-col items-center space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-extrabold text-white">
                        Room Tutorial
                    </h1>
                    <p className="inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/60">
                        Kode: NEURO-DEMO
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                    {players.map((p) => (
                        <PlayerGridCard
                            key={p.id}
                            player={{
                                id: p.id,
                                name: p.name,
                                character: p.character,
                                image: p.image,
                                health: p.health,
                                maxHealth: p.maxHealth,
                                isMe: p.isMe,
                            }}
                            lobbyMode
                            hideHealthBar
                        />
                    ))}
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-sm text-white/60">
                        4 pemain siap &bull; Maks. 40 pemain di mode
                        sungguhan
                    </p>
                    <p className="text-xs text-white/60">
                        Hanya Host yang bisa memulai pertandingan
                    </p>
                </div>
                <MainButton
                    variant="green"
                    hasShadow
                    className="rounded-xl px-10 py-4 text-lg font-bold"
                    onClick={() => {
                        dismissTutorialOverlay();
                        useDemoStore.getState().loadBattleRound(1);
                    }}
                >
                    Mulai Pertandingan
                </MainButton>
            </div>
        </main>
    );
}
