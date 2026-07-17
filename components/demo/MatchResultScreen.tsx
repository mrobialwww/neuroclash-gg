"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MainButton } from "@/components/common/MainButton";
import { TIcon, CIcon, StarIcon } from "./DemoIcons";
import { EndgamePodium, PodiumPlayer } from "@/components/endgame/EndgamePodium";
import { useDemoStore } from "@/store/useDemoStore";
import { TUTORIAL_MESSAGES, DEMO_TOTAL_ROUNDS } from "@/lib/constants/demo-data";
import { cn } from "@/lib/utils/utils";
import { getCurrentUserNavbarData } from "@/hooks/useUserClient";

export function MatchResultScreen() {
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

    const [displayName, setDisplayName] = useState("Kamu");

    useEffect(() => {
        getCurrentUserNavbarData().then((data) => {
            if (data?.username) setDisplayName(data.username);
        });
    }, []);

    const podiumPlayers: PodiumPlayer[] = sortedPlayers.slice(0, 3).map((p, i) => ({
        userId: p.id,
        username: p.isMe ? displayName : p.name,
        characterImage: p.image,
        baseCharacter: p.character,
        placement: (i + 1) as 1 | 2 | 3,
    }));

    return (
        <main className="flex min-h-screen w-full flex-col items-center px-4 py-8 md:px-6 md:py-12">
            <div className="flex w-full max-w-5xl flex-col items-center space-y-8">
                {/* Title */}
                <h1 className="text-center text-3xl font-extrabold text-white md:text-4xl">
                    {TUTORIAL_MESSAGES.finished.title}
                </h1>
                <p className="text-center text-lg text-white/70 md:text-xl">
                    {TUTORIAL_MESSAGES.finished.message}
                </p>

                {/* Podium */}
                <div className="mt-32 w-full">
                    <EndgamePodium players={podiumPlayers} />
                </div>

                {/* Leaderboard Table */}
                <div className="relative z-10 -mt-64 w-full overflow-hidden rounded-2xl bg-[#172844] p-4 shadow-xl sm:p-6">
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
                                                            : "bg-white/20 text-white/70",
                                                    )}
                                                >
                                                    {i + 1}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div
                                                    className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full sm:h-9 sm:w-9 md:h-10 md:w-10"
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
                                                    {p.isMe ? displayName : p.name}
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
                <div className="w-full rounded-2xl border border-white/10 bg-[#172844] p-5 md:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Hasil Kamu
                    </h3>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="text-lg font-extrabold text-white md:text-xl">
                                #{sortedPlayers.findIndex((p) => p.isMe) + 1}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/70 md:text-xs">Peringkat</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="text-lg font-extrabold text-green-400 md:text-xl">
                                {userPlayer.health}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/70 md:text-xs">HP Tersisa</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="text-lg font-extrabold text-[#3D79F3] md:text-xl">
                                {roundsWon}/{DEMO_TOTAL_ROUNDS}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/70 md:text-xs">Ronde Menang</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="truncate text-lg font-extrabold text-[#FFCC00] md:text-xl">
                                {userPickedAbilityName ?? "-"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/70 md:text-xs">Item StarBox</p>
                        </div>
                    </div>
                </div>

                {/* Pendapatan */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#172844] p-5 md:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Pendapatan
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
                            <p className="text-xl font-extrabold text-yellow-400 md:text-2xl">
                                +<TIcon /> {trophyEarned}
                            </p>
                            <p className="mt-1 text-xs text-white/70 md:text-sm">Trophy</p>
                        </div>
                        <div className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                            <p className="text-xl font-extrabold text-amber-400 md:text-2xl">
                                +<CIcon /> {coinsEarned}
                            </p>
                            <p className="mt-1 text-xs text-white/70 md:text-sm">Koin</p>
                        </div>
                    </div>
                </div>

                {/* Penjelasan Sistem */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#172844] p-5 md:p-6">
                    <h3 className="mb-4 text-center text-2xl font-extrabold text-white md:text-3xl">
                        Penjelasan Sistem
                    </h3>
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                            <span className="shrink-0 text-2xl"><TIcon /></span>
                            <div>
                                <p className="text-sm font-semibold text-white md:text-base">Trophy & Ranking</p>
                                <p className="mt-1 text-xs text-white/80 md:text-sm">
                                    Trophy menentukan peringkatmu (Bronze, Silver, Gold, Platinum, Diamond).
                                    Semakin tinggi peringkat, semakin bergengsi akunmu.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                            <span className="shrink-0 text-2xl"><CIcon /></span>
                            <div>
                                <p className="text-sm font-semibold text-white md:text-base">Koin & Skin</p>
                                <p className="mt-1 text-xs text-white/80 md:text-sm">
                                    Koin digunakan untuk membeli karakter dan skin di toko.
                                    Skin memberikan tampilan unik dan skill khusus.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                            <span className="shrink-0 text-2xl"><StarIcon /></span>
                            <div>
                                <p className="text-sm font-semibold text-white md:text-base">StarBox & Item</p>
                                <p className="mt-1 text-xs text-white/80 md:text-sm">
                                    Item dari StarBox disimpan di panel kiri atas arena.
                                    Klik item untuk menggunakannya saat dibutuhkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Riwayat Ronde */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#172844] p-5 md:p-6">
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
