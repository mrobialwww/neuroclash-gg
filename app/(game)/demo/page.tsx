"use client";

import React, { useEffect, useRef } from "react";
import { IntroPhase } from "@/components/demo/IntroPhase";
import { LobbyPhase } from "@/components/demo/LobbyPhase";
import { StarboxPhase } from "@/components/demo/StarboxPhase";
import { BattlePhase } from "@/components/demo/BattlePhase";
import { MatchResultScreen } from "@/components/demo/MatchResultScreen";
import { useDemoStore } from "@/store/useDemoStore";

export default function DemoPage() {
    const {
        phase,
        selectedAnswerId,
        botSimState,
        showTutorialOverlay,
        showKitabHint,
        players,
        starboxTurnIndex,
        allStarboxPicked,
        abilities,
        decrementTimer,
        nextStarboxTurn,
        selectAbility,
        finishStarboxAndContinue,
        setStarboxProgress,
    } = useDemoStore();

    // Navigation guard
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        const h = () =>
            window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", h);
        return () => window.removeEventListener("popstate", h);
    }, []);

    // Battle timer
    useEffect(() => {
        if (phase !== "battle") return;
        if (selectedAnswerId || botSimState !== "idle") return;
        if (showTutorialOverlay || showKitabHint) return;
        const t = setInterval(() => decrementTimer(), 1000);
        return () => clearInterval(t);
    }, [
        phase,
        selectedAnswerId,
        botSimState,
        showTutorialOverlay,
        showKitabHint,
        decrementTimer,
    ]);

    // Bot starbox turn
    const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (phase !== "starbox" || allStarboxPicked) return;
        if (showTutorialOverlay) return;
        const sortedByHp = [...players].sort((a, b) => a.health - b.health);
        const cp = sortedByHp[starboxTurnIndex];
        if (!cp || cp.isMe) return;
        const available = abilities.filter((a) => a.stock > 0);
        if (available.length === 0) {
            nextStarboxTurn();
            return;
        }

        botTimerRef.current = setTimeout(() => {
            const s = useDemoStore.getState();
            if (s.showTutorialOverlay) return;
            const avail = s.abilities.filter(
                (a) => a.stock > 0 && a.id !== "1",
            );
            const pick =
                avail.length > 0
                    ? avail[Math.floor(Math.random() * avail.length)]
                    : s.abilities.find((a) => a.stock > 0)!;
            selectAbility(pick.id);
            setTimeout(() => {
                const s2 = useDemoStore.getState();
                if (s2.showTutorialOverlay) return;
                nextStarboxTurn();
            }, 1000);
        }, 2000);
        return () => {
            if (botTimerRef.current) clearTimeout(botTimerRef.current);
        };
    }, [
        phase,
        starboxTurnIndex,
        allStarboxPicked,
        showTutorialOverlay,
        players,
        abilities,
        selectAbility,
        nextStarboxTurn,
    ]);

    // Auto-continue after starbox
    useEffect(() => {
        if (!allStarboxPicked) return;
        const t = setTimeout(() => finishStarboxAndContinue(), 1500);
        return () => clearTimeout(t);
    }, [allStarboxPicked, finishStarboxAndContinue]);

    // Starbox progress timer
    useEffect(() => {
        if (phase !== "starbox" || allStarboxPicked || showTutorialOverlay) {
            setStarboxProgress(0);
            return;
        }
        const TURN_DURATION = 4000;
        const TICK = 50;
        const startTime = Date.now();
        setStarboxProgress(0);
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, (elapsed / TURN_DURATION) * 100);
            setStarboxProgress(pct);
            if (elapsed >= TURN_DURATION) {
                clearInterval(interval);
            }
        }, TICK);
        return () => clearInterval(interval);
    }, [phase, starboxTurnIndex, allStarboxPicked, showTutorialOverlay, setStarboxProgress]);

    switch (phase) {
        case "intro":
            return <IntroPhase />;
        case "lobby":
            return <LobbyPhase />;
        case "starbox":
            return <StarboxPhase />;
        case "finished":
            return <MatchResultScreen />;
        case "battle":
            return <BattlePhase />;
        default:
            return null;
    }
}
