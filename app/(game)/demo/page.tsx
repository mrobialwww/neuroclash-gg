"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { MainButton } from "@/components/common/MainButton";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerList } from "@/components/match/PlayerList";
import { PlayerCard } from "@/components/match/PlayerCard";
import { PlayerGridCard } from "@/components/match/PlayerGridCard";
import { AbilityCard } from "@/components/match/AbilityCard";
import { cn } from "@/lib/utils/utils";

import {
    useDemoStore,
    DemoPlayerState,
    ActiveBuff,
} from "@/store/useDemoStore";
import {
    TUTORIAL_MESSAGES,
    DEMO_PROF_BUBU,
    DEMO_TOTAL_ROUNDS,
    DEMO_SECONDS_PER_ROUND,
} from "@/lib/constants/demo-data";

function TIcon() {
    return <>{String.fromCodePoint(0x1f3c6)}</>;
}
function CIcon() {
    return <>{String.fromCodePoint(0x1f4b0)}</>;
}
function StarIcon() {
    return <>{String.fromCodePoint(0x1f31f)}</>;
}
function BookIcon() {
    return <>{String.fromCodePoint(0x1f4d6)}</>;
}
function GameIcon() {
    return <>{String.fromCodePoint(0x1f3ae)}</>;
}
function Check() {
    return <>{String.fromCodePoint(0x2705)}</>;
}
function Cross() {
    return <>{String.fromCodePoint(0x274c)}</>;
}

function TutorialOverlay({
    message,
    onDismiss,
    title,
}: {
    message: string;
    onDismiss: () => void;
    title?: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-white/20 bg-[#1A1B23] p-6 text-center shadow-2xl md:p-8">
                {title && (
                    <h2 className="text-xl font-extrabold text-white">
                        {title}
                    </h2>
                )}
                <p className="whitespace-pre-line text-sm leading-relaxed text-white/80 md:text-base">
                    {message}
                </p>
                <MainButton
                    variant="green"
                    hasShadow
                    className="rounded-xl px-8 py-3 text-base font-bold"
                    onClick={onDismiss}
                >
                    Mengerti!
                </MainButton>
            </div>
        </div>
    );
}

function KitabOverlay({
    hint,
    onDismiss,
}: {
    hint: string;
    onDismiss: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg space-y-4 rounded-2xl border border-[#FFCC00]/40 bg-[#1A1B23] p-6 text-center shadow-2xl md:p-8">
                <p className="text-5xl">
                    <BookIcon />
                </p>
                <h2 className="text-xl font-extrabold text-white">
                    Kitab Pengetahuan
                </h2>
                <div className="rounded-xl border border-[#FFCC00]/20 bg-[#0B0D14] p-4">
                    <p className="text-sm leading-relaxed text-white/80">
                        {hint}
                    </p>
                </div>
                <p className="text-xs text-white/60">
                    Gunakan petunjuk ini untuk menjawab soal!
                </p>
                <MainButton
                    variant="green"
                    hasShadow
                    className="rounded-xl px-8 py-3 text-base font-bold"
                    onClick={onDismiss}
                >
                    Tutup Kitab
                </MainButton>
            </div>
        </div>
    );
}

function PlayerResultLine({
    playerName,
    isCorrect,
    delayMs,
    revealed,
}: {
    playerName: string;
    isCorrect: boolean;
    delayMs: number;
    revealed: boolean;
}) {
    if (!revealed) {
        return (
            <div className="flex animate-pulse items-center gap-2 text-xs text-white/60 md:text-sm">
                <span className="h-3 w-3 rounded-full border border-white/30" />
                <span>{playerName}: berpikir...</span>
            </div>
        );
    }
    return (
        <div
            className={cn(
                "flex items-center gap-2 text-xs transition-all duration-300 md:text-sm",
                isCorrect ? "text-green-400" : "text-red-400",
            )}
        >
            <span className="text-base">
                {isCorrect ? <Check /> : <Cross />}
            </span>
            <span>
                {playerName}: {isCorrect ? "Benar" : "Salah"} (
                {(delayMs / 1000).toFixed(1)}s)
            </span>
        </div>
    );
}

function DemoBuffItem({
    buff,
    onClick,
}: {
    buff: ActiveBuff;
    onClick: () => void;
}) {
    return (
        <motion.div
            whileHover={buff.used ? undefined : { scale: 1.05 }}
            whileTap={buff.used ? undefined : { scale: 0.95 }}
            onClick={buff.used ? undefined : onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                buff.used
                    ? "cursor-default opacity-40"
                    : "group cursor-pointer",
            )}
        >
            <div className="relative h-12 w-12 md:h-14 md:w-14">
                <div className="absolute inset-0 rounded-full bg-white/0 blur-xl transition-all duration-300 group-hover:bg-white/10" />
                <Image
                    src={buff.image}
                    alt={buff.name}
                    fill
                    sizes="56px"
                    className="relative z-10 object-contain drop-shadow-md"
                />
            </div>
            <span className="text-center text-xs font-semibold text-white md:text-sm">
                {buff.label}
            </span>
            {buff.used ? (
                <span className="text-[10px] text-green-400">Terpakai</span>
            ) : (
                <span className="text-[10px] text-white/60">
                    Klik untuk pakai
                </span>
            )}
        </motion.div>
    );
}

function DemoBuffPanel({
    buffs,
    onUse,
    className,
}: {
    buffs: ActiveBuff[];
    onUse: (id: string) => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative flex w-full flex-col items-center rounded-2xl border-2 border-white/10 bg-[#D9D9D9]/20 p-2 shadow-2xl backdrop-blur-md",
                className,
            )}
        >
            <div className="relative mb-3 flex h-[35px] w-full max-w-[180px] shrink-0 items-center justify-center md:h-[40px]">
                <Image
                    src="/match/match-badge.webp"
                    alt="Badge"
                    fill
                    sizes="180px"
                    className="object-contain"
                    priority
                />
                <h2 className="xs:text-xs relative z-10 mt-0.5 text-[10px] font-semibold tracking-tight text-white md:text-base">
                    Materi & Kekuatan
                </h2>
            </div>
            <div className="scrollbar-hide w-full flex-1 overflow-y-auto pb-2">
                {buffs.length > 0 ? (
                    <div
                        className="grid gap-x-2 gap-y-4"
                        style={{
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(70px, 1fr))",
                        }}
                    >
                        {buffs.slice(0, 5).map((buff) => (
                            <DemoBuffItem
                                key={buff.id}
                                buff={buff}
                                onClick={() => onUse(buff.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-xs text-white/60">
                            Belum ada item
                        </p>
                        <p className="mt-1 text-[10px] text-white/20">
                            Item StarBox akan muncul di sini
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MatchResultScreen() {
    const router = useRouter();
    const {
        players,
        userPlayer,
        roundsWon,
        trophyEarned,
        coinsEarned,
        userPickedAbilityName,
        roundHistory,
    } = useDemoStore();
    const sortedPlayers = [...players].sort((a, b) => b.health - a.health);

    const top3 = sortedPlayers.slice(0, 3);
    const first = top3.find((p) => p.isMe || sortedPlayers.indexOf(p) === 0) ?? top3[0];
    const second = top3[1];
    const third = top3[2];

    return (
        <main className="flex min-h-screen w-full flex-col items-center px-4 py-8 md:px-6 md:py-12">
            <div className="flex w-full max-w-5xl flex-col items-center space-y-8">
                {/* Title */}
                <p className="text-7xl">
                    <TIcon />
                </p>
                <h1 className="text-center text-3xl font-extrabold text-white md:text-4xl">
                    {TUTORIAL_MESSAGES.finished.title}
                </h1>
                <p className="text-center text-lg text-white/60 md:text-xl">
                    {TUTORIAL_MESSAGES.finished.message}
                </p>

                {/* Podium */}
                <div className="relative flex w-full items-end justify-center gap-4 pt-24 pb-4 sm:gap-8">
                    {/* 2nd place */}
                    {second && (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-bold text-white md:text-base">
                                {second.name}
                                {second.isMe ? " (Kamu)" : ""}
                            </span>
                            <div
                                className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-gray-300 shadow-lg sm:h-20 sm:w-20 md:h-24 md:w-24"
                                style={{ backgroundColor: "var(--bg, #333)" }}
                            >
                                <Image
                                    src={second.image}
                                    alt={second.character}
                                    fill
                                    sizes="96px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex h-16 w-20 items-center justify-center rounded-t-lg bg-gray-400 text-lg font-extrabold text-black sm:h-20 sm:w-24 sm:text-xl md:h-24 md:w-28 md:text-2xl">
                                2
                            </div>
                        </div>
                    )}

                    {/* 1st place */}
                    {first && (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-base font-bold text-yellow-400 md:text-lg">
                                {first.name}
                                {first.isMe ? " (Kamu)" : ""}
                            </span>
                            <div
                                className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] sm:h-24 sm:w-24 md:h-28 md:w-28"
                                style={{ backgroundColor: "var(--bg, #333)" }}
                            >
                                <Image
                                    src={first.image}
                                    alt={first.character}
                                    fill
                                    sizes="112px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex h-20 w-24 items-center justify-center rounded-t-lg bg-yellow-500 text-xl font-extrabold text-black sm:h-24 sm:w-28 sm:text-2xl md:h-28 md:w-32 md:text-3xl">
                                1
                            </div>
                        </div>
                    )}

                    {/* 3rd place */}
                    {third && (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-bold text-white md:text-base">
                                {third.name}
                                {third.isMe ? " (Kamu)" : ""}
                            </span>
                            <div
                                className="relative h-14 w-14 overflow-hidden rounded-full border-4 border-amber-700 shadow-lg sm:h-16 sm:w-16 md:h-20 md:w-20"
                                style={{ backgroundColor: "var(--bg, #333)" }}
                            >
                                <Image
                                    src={third.image}
                                    alt={third.character}
                                    fill
                                    sizes="80px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex h-12 w-18 items-center justify-center rounded-t-lg bg-amber-700 text-base font-extrabold text-white sm:h-14 sm:w-20 sm:text-lg md:h-16 md:w-24 md:text-xl">
                                3
                            </div>
                        </div>
                    )}
                </div>

                {/* Leaderboard Table */}
                <div className="w-full overflow-hidden rounded-2xl bg-[#1A1B23]/80 p-4 shadow-xl sm:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Klasemen Akhir
                    </h3>
                    <div className="scrollbar-hide w-full overflow-x-auto">
                        <div className="min-w-[500px]">
                            <div className="mb-2 grid grid-cols-[60px_minmax(120px,1fr)_100px_100px] items-center gap-3 rounded-lg bg-white/10 px-4 py-2.5 md:grid-cols-[80px_minmax(140px,1fr)_120px_120px] md:gap-4 md:px-6">
                                <span className="text-center text-xs font-bold text-white/80 md:text-sm">Rank</span>
                                <span className="text-xs font-bold text-white/80 md:text-sm">Pemain</span>
                                <span className="text-center text-xs font-bold text-white/80 md:text-sm">Status</span>
                                <span className="text-center text-xs font-bold text-white/80 md:text-sm">HP</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {sortedPlayers.map((p, i) => {
                                    const bg = p.isMe ? "bg-[#3D79F3]/30" : "bg-white/5";
                                    return (
                                        <div
                                            key={p.id}
                                            className={`grid grid-cols-[60px_minmax(120px,1fr)_100px_100px] items-center gap-3 rounded-lg px-4 py-2.5 md:grid-cols-[80px_minmax(140px,1fr)_120px_120px] md:gap-4 md:px-6 ${bg}`}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span
                                                    className={cn(
                                                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold md:h-8 md:w-8 md:text-sm",
                                                        i === 0 ? "bg-yellow-500 text-black"
                                                            : i === 1 ? "bg-gray-300 text-black"
                                                            : i === 2 ? "bg-amber-700 text-white"
                                                            : "bg-white/20 text-white/60",
                                                    )}
                                                >
                                                    {i + 1}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div
                                                    className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-white sm:h-9 sm:w-9 md:h-10 md:w-10"
                                                    style={{ backgroundColor: "var(--bg, #333)" }}
                                                >
                                                    <Image
                                                        src={p.image}
                                                        alt={p.character}
                                                        fill
                                                        sizes="40px"
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <span className="truncate text-sm font-semibold text-white md:text-base">
                                                    {p.name}
                                                    {p.isMe ? " (Kamu)" : ""}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                {!p.isAlive ? (
                                                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 md:text-xs">
                                                        ELIMINASI
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400 md:text-xs">
                                                        HIDUP
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <span
                                                    className={cn(
                                                        "text-sm font-bold md:text-base",
                                                        p.health > 50 ? "text-green-400"
                                                            : p.health > 0 ? "text-yellow-400"
                                                            : "text-red-400",
                                                    )}
                                                >
                                                    {p.health}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hasil Kamu */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#1A1B23]/80 p-5 md:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Hasil Kamu
                    </h3>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="text-lg font-extrabold text-white md:text-xl">
                                #{sortedPlayers.findIndex((p) => p.isMe) + 1}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/60 md:text-xs">Peringkat</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="text-lg font-extrabold text-green-400 md:text-xl">
                                {userPlayer.health}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/60 md:text-xs">HP Tersisa</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="text-lg font-extrabold text-[#3D79F3] md:text-xl">
                                {roundsWon}/{DEMO_TOTAL_ROUNDS}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/60 md:text-xs">Ronde Menang</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="truncate text-lg font-extrabold text-[#FFCC00] md:text-xl">
                                {userPickedAbilityName ?? "-"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/60 md:text-xs">Item StarBox</p>
                        </div>
                    </div>
                </div>

                {/* Pendapatan */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#1A1B23]/80 p-5 md:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Pendapatan
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
                            <p className="text-xl font-extrabold text-yellow-400 md:text-2xl">
                                +<TIcon /> {trophyEarned}
                            </p>
                            <p className="mt-1 text-xs text-white/60">Trophy</p>
                        </div>
                        <div className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                            <p className="text-xl font-extrabold text-amber-400 md:text-2xl">
                                +<CIcon /> {coinsEarned}
                            </p>
                            <p className="mt-1 text-xs text-white/60">Koin</p>
                        </div>
                    </div>
                </div>

                {/* Penjelasan Sistem */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#1A1B23]/80 p-5 md:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Penjelasan Sistem
                    </h3>
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                            <span className="shrink-0 text-2xl"><TIcon /></span>
                            <div>
                                <p className="text-sm font-semibold text-white">Trophy & Ranking</p>
                                <p className="mt-1 text-xs text-white/80">
                                    Trophy menentukan peringkatmu (Bronze, Silver, Gold, Platinum, Diamond).
                                    Semakin tinggi peringkat, semakin bergengsi akunmu.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                            <span className="shrink-0 text-2xl"><CIcon /></span>
                            <div>
                                <p className="text-sm font-semibold text-white">Koin & Skin</p>
                                <p className="mt-1 text-xs text-white/80">
                                    Koin digunakan untuk membeli karakter dan skin di toko.
                                    Skin memberikan tampilan unik dan skill khusus.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                            <span className="shrink-0 text-2xl"><StarIcon /></span>
                            <div>
                                <p className="text-sm font-semibold text-white">StarBox & Item</p>
                                <p className="mt-1 text-xs text-white/80">
                                    Item dari StarBox disimpan di panel kiri atas arena.
                                    Klik item untuk menggunakannya saat dibutuhkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Riwayat Ronde */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#1A1B23]/80 p-5 md:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Riwayat Ronde
                    </h3>
                    <div className="space-y-2">
                        {roundHistory.map((h) => (
                            <div
                                key={h.round}
                                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white/80 md:text-base"
                            >
                                <span>Ronde {h.round} vs {h.opponentName}</span>
                                <span className={h.userCorrect ? "text-green-400" : "text-red-400"}>
                                    {h.userCorrect ? "Benar" : "Salah"}
                                    {h.userTookDamage ? ` (-${h.damage} HP)` : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex w-full max-w-md flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <MainButton
                        variant="green"
                        hasShadow
                        className="flex-1 rounded-xl px-6 py-3 text-base font-bold md:py-4 md:text-lg"
                        onClick={() => {
                            useDemoStore.getState().resetStore();
                            router.push("/dashboard");
                        }}
                    >
                        {TUTORIAL_MESSAGES.finished.button1}
                    </MainButton>
                    <MainButton
                        variant="white"
                        className="flex-1 rounded-xl px-6 py-3 text-base font-bold md:py-4 md:text-lg"
                        onClick={() => {
                            useDemoStore.getState().resetStore();
                            router.push("/dashboard");
                        }}
                    >
                        {TUTORIAL_MESSAGES.finished.button2}
                    </MainButton>
                </div>
            </div>
        </main>
    );
}

export default function DemoPage() {
    const router = useRouter();

    const {
        phase,
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
        abilities,
        starboxTurnIndex,
        pickingAbilityId,
        allStarboxPicked,
        activeBuffs,
        showKitabHint,
        kitabHintText,
        starboxProgress,
        resetStore,
        startGame,
        selectAnswer,
        selectAbility,
        nextStarboxTurn,
        userSelectAbility,
        finishStarboxAndContinue,
        useBuff,
        dismissTutorialOverlay,
        closeKitab,
        decrementTimer,
        setStarboxProgress,
    } = useDemoStore();

    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        const h = () =>
            window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", h);
        return () => window.removeEventListener("popstate", h);
    }, []);

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

    useEffect(() => {
        if (!allStarboxPicked) return;
        const t = setTimeout(() => finishStarboxAndContinue(), 1500);
        return () => clearTimeout(t);
    }, [allStarboxPicked, finishStarboxAndContinue]);

    // StarBox progress timer
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

    const DEMO_STEPS = [
        { id: "book", icon: "/icons/book.svg" },
        { id: "battle-1", icon: "/icons/battle.svg" },
        { id: "battle-2", icon: "/icons/battle.svg" },
        { id: "battle-3", icon: "/icons/battle.svg" },
        { id: "treasure", icon: "/icons/treasure.svg" },
        { id: "battle-4", icon: "/icons/battle.svg" },
    ];

    const activeStepIndex =
        phase === "starbox"
            ? 4
            : phase === "battle" && currentRound >= 5
            ? 5
            : currentRound - 1;

    const handleExit = () => {
        resetStore();
        router.push("/dashboard");
    };

    // --- INTRO ---
    if (phase === "intro") {
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

    // --- LOBBY ---
    if (phase === "lobby") {
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

    // --- STARBOX ---
    if (phase === "starbox") {
        const sortedHpPlayers = [...players].sort(
            (a, b) => a.health - b.health,
        );
        const cp = sortedHpPlayers[starboxTurnIndex];
        const isUserTurn = cp?.isMe ?? false;
        const remainingItems = abilities.reduce((sum, a) => sum + a.stock, 0);

        const starboxSteps = [
            { id: "book", icon: "/icons/book.svg" },
            { id: "battle-1", icon: "/icons/battle.svg" },
            { id: "battle-2", icon: "/icons/battle.svg" },
            { id: "battle-3", icon: "/icons/battle.svg" },
            { id: "battle-4", icon: "/icons/battle.svg" },
            { id: "battle-5", icon: "/icons/battle.svg" },
            { id: "treasure", icon: "/icons/treasure.svg" },
        ];

        return (
            <main className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden px-4 py-6 pt-4 md:px-8 md:pt-6 lg:px-12">
                {showTutorialOverlay && (
                    <TutorialOverlay
                        title={"🌟 STARBOX"}
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
                            {starboxSteps.map((step, index) => {
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

    // --- FINISHED ---
    if (phase === "finished") return <MatchResultScreen />;

    // --- BATTLE ---
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

            <p className="text-sm font-medium text-white/60">
                Soal {currentRound} / {DEMO_TOTAL_ROUNDS}
            </p>

            <div className="flex w-full flex-1 items-start justify-center">
                <div className="grid w-full max-w-[1400px] grid-cols-2 items-stretch gap-x-4 gap-y-6 md:gap-6 lg:grid-cols-[210px_minmax(600px,1fr)_210px]">
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
                        {roundResultMessage && botSimState === "resolved" && (
                            <div
                                className={cn(
                                    "mb-4 w-full max-w-3xl rounded-xl px-4 py-3 text-center text-sm font-bold transition-all md:text-base",
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
        </main>
    );
}
