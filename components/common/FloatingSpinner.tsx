"use client";

import React from "react";

interface FloatingSpinnerProps {
    isOpen: boolean;
    message?: string;
}

export function FloatingSpinner({
    isOpen,
    message = "Membuat quiz...",
}: FloatingSpinnerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed left-1/2 top-6 z-[200] -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 rounded-full border border-white/10 bg-[#0B0D14]/90 px-8 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <svg
                    className="h-6 w-6 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
                <span className="text-base font-semibold text-white/90">
                    {message}
                </span>
            </div>
        </div>
    );
}
