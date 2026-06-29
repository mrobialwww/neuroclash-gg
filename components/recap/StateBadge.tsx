"use client";

import { RecapQuestion } from "@/modules/histories/history.schema";

interface StateBadgeProps {
    state: RecapQuestion["state"];
}

export function StateBadge({ state }: StateBadgeProps) {
    if (state === "correct") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-xs md:text-sm font-semibold text-emerald-400">
                <span>✓</span> Benar
            </span>
        );
    }
    if (state === "wrong") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-400/20 px-3 py-1 text-xs md:text-sm font-semibold text-red-400">
                <span>✗</span> Salah
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs md:text-sm font-semibold text-white/80">
            Tidak Terjawab
        </span>
    );
}
