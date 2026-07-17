"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";
import { TIcon, CIcon, StarIcon } from "./DemoIcons";
import { useDemoStore } from "@/store/useDemoStore";
import { TUTORIAL_MESSAGES, DEMO_TOTAL_ROUNDS } from "@/lib/constants/demo-data";
import { cn } from "@/lib/utils/utils";

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

    const top3 = sortedPlayers.slice(0, 3);
    const first = top3[0];
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
