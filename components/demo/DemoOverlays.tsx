"use client";

import { MainButton } from "@/components/common/MainButton";
import { BookIcon, Check, Cross } from "./DemoIcons";
import { cn } from "@/lib/utils/utils";

export function TutorialOverlay({
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
            <div className="max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-white/20 bg-[#172844] p-6 text-center shadow-2xl md:p-8">
                {title && (
                    <h2 className="text-xl font-extrabold text-white md:text-2xl">
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

export function KitabOverlay({
    hint,
    onDismiss,
}: {
    hint: string;
    onDismiss: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg space-y-4 rounded-2xl border border-[#FFCC00]/40 bg-[#172844] p-6 text-center shadow-2xl md:p-8">
                <p className="text-5xl">
                    <BookIcon />
                </p>
                <h2 className="text-xl font-extrabold text-white md:text-2xl">
                    Kitab Pengetahuan
                </h2>
                <div className="rounded-xl border border-[#FFCC00]/20 bg-[#0B0D14] p-4">
                    <p className="text-sm leading-relaxed text-white/80 md:text-base">
                        {hint}
                    </p>
                </div>
                <p className="text-xs text-white/70 md:text-sm">
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

export function PlayerResultLine({
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
            <div className="flex animate-pulse items-center gap-2 text-xs text-white/70 md:text-sm">
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
