"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { GameRecap } from "@/modules/histories/history.schema";
import { ChevronLeft, Clock } from "lucide-react";

const RecapExplanation = dynamic(
    () =>
        import("@/components/recap/RecapExplanation").then(
            (mod) => mod.RecapExplanation,
        ),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-white/10 bg-white p-5 shadow-sm md:p-6"
                    >
                        <div className="mb-3 h-5 w-24 rounded bg-gray-200" />
                        <div className="mb-4 h-4 w-full rounded bg-gray-200" />
                        <div className="space-y-2.5">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="h-14 rounded-xl bg-gray-100"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
);

export default function RecapPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<GameRecap | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userGameId = params?.user_game_id as string;
        if (!userGameId) return;

        fetch(`/api/user-game/${userGameId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [params?.user_game_id]);

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl animate-pulse px-4 py-8 md:px-6 md:py-12">
                {/* Back button */}
                <div className="mb-6 h-9 w-24 rounded-lg bg-white/10" />

                {/* Rank badge */}
                <div className="relative mb-8 flex justify-center">
                    <div className="h-[68px] w-full max-w-[360px] rounded-lg bg-white/10" />
                </div>

                {/* Trophy & Coin */}
                <div className="mb-8 flex items-center justify-center gap-6">
                    <div className="h-5 w-16 rounded bg-white/10" />
                    <div className="h-5 w-16 rounded bg-white/10" />
                </div>

                {/* Stats row */}
                <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md"
                        >
                            <div className="mx-auto h-3 w-16 rounded bg-white/20" />
                            <div className="mx-auto mt-3 h-8 w-10 rounded bg-white/20" />
                        </div>
                    ))}
                </div>

                {/* Pembahasan heading */}
                <div className="mb-5 h-7 w-48 rounded bg-white/10" />

                {/* Question cards */}
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-md md:p-6"
                        >
                            <div className="mb-3 h-5 w-24 rounded bg-white/20" />
                            <div className="mb-4 h-4 w-full rounded bg-white/20" />
                            <div className="space-y-2.5">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <div
                                        key={j}
                                        className="h-14 rounded-xl bg-white/10"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center md:px-6">
                <p className="text-white/70">Data tidak ditemukan</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 cursor-pointer text-sm text-white underline underline-offset-2"
                >
                    Kembali
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#4D70E8] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#3D5BD8] md:px-4 md:py-2 md:text-sm"
            >
                <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" /> Kembali
            </button>

            {/* Rank badge — trophy-badge.webp like "Pemain Teratas" */}
            <div className="relative mb-8 flex justify-center">
                <div className="relative w-full max-w-[360px]">
                    <div className="relative flex h-auto w-full items-center justify-center">
                        <Image
                            src="/dashboard/trophy-badge.webp"
                            alt="Rank Badge"
                            width={360}
                            height={68}
                            className="-z-10 block h-full w-full object-contain drop-shadow-sm"
                            sizes="360px"
                            priority
                        />
                        <div className="absolute inset-0 flex items-center justify-center px-4">
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold tracking-wide text-white drop-shadow-sm md:text-xl">
                                {data.room_title || "Pertandingan"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trophy & Coin — directly on dark bg, so white text */}
            <div className="mb-8 flex items-center justify-center gap-6 text-base md:text-lg text-white font-bold">
                <div className="flex items-center gap-1.5">
                    <div className="relative h-5 w-5 md:h-6 md:w-6">
                        <Image
                            src="/icons/trophy-color.svg"
                            alt="Trophy"
                            fill
                            sizes="24px"
                            className="object-contain"
                        />
                    </div>
                    <span>{data.trophy_won >= 0 ? "+" : ""}{data.trophy_won}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="relative h-5 w-5 md:h-6 md:w-6">
                        <Image
                            src="/icons/coin-color.svg"
                            alt="Coin"
                            fill
                            sizes="24px"
                            className="object-contain"
                        />
                    </div>
                    <span>{data.coins_earned >= 0 ? "+" : ""}{data.coins_earned}</span>
                </div>
            </div>

                {/* Stats row — cards have glassmorphism */}
                <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-center shadow-lg backdrop-blur-md">
                        <p className="text-xs md:text-sm text-white/80 font-semibold">Total Soal</p>
                        <p className="mt-1 text-xl md:text-2xl font-bold text-white">
                            {data.total_soal}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-center shadow-lg backdrop-blur-md">
                        <p className="text-xs md:text-sm text-white/80 font-semibold">Total Benar</p>
                        <p className="mt-1 text-xl md:text-2xl font-bold text-emerald-400">
                            {data.total_benar}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-center shadow-lg backdrop-blur-md">
                        <p className="text-xs md:text-sm text-white/80 font-semibold">Total Salah</p>
                        <p className="mt-1 text-xl md:text-2xl font-bold text-red-400">
                            {data.total_salah}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-center shadow-lg backdrop-blur-md">
                        <p className="text-xs md:text-sm text-white/80 font-semibold">Tidak Terjawab</p>
                        <p className="mt-1 text-xl md:text-2xl font-bold text-white">
                            {data.tidak_terjawab}
                        </p>
                    </div>
                </div>

            {/* Pembahasan Soal — directly on dark bg, white text */}
            <h2 className="mb-5 text-xl md:text-2xl font-bold text-white">
                Pembahasan Soal
            </h2>

            <RecapExplanation questions={data.questions} />

            <div className="h-12" />
        </div>
    );
}
