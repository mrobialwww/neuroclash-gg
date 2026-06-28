"use client";

import { RecapQuestion } from "@/modules/histories/history.schema";

interface StateBadgeProps {
    state: RecapQuestion["state"];
}

export function StateBadge({ state }: StateBadgeProps) {
    if (state === "correct") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs md:text-sm font-semibold text-emerald-700">
                <span>✓</span> Benar
            </span>
        );
    }
    if (state === "wrong") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs md:text-sm font-semibold text-red-700">
                <span>✗</span> Salah
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs md:text-sm font-semibold text-gray-700">
            Tidak Terjawab
        </span>
    );
}
