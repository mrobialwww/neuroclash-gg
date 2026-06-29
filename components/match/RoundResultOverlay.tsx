"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WIN_MESSAGES = [
    "Luar Biasa!",
    "Cepat Tepat!",
    "Mantap Jiwa!",
    "Kamu Hebat!",
];

const LOSE_MESSAGES = [
    "Tetap Semangat!",
    "Jangan Menyerah!",
    "Lain Kali Lebih Cepat!",
    "Masih Ada Kesempatan!",
];

function randomMessage(win: boolean): string {
    const pool = win ? WIN_MESSAGES : LOSE_MESSAGES;
    return pool[Math.floor(Math.random() * pool.length)];
}

interface RoundResultOverlayProps {
    isOpen: boolean;
    isSolo: boolean;
    isFirst: boolean;
    isCorrect: boolean;
    firstAnswerCorrect: boolean | null;
    damage: number;
    onComplete: () => void;
}

const EFFECT_DURATION = 2500;

const Particles = ({ count, color }: { count: number; color: string }) => {
    const items = Array.from({ length: count }, (_, i) => i);
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {items.map((i) => (
                <motion.div
                    key={i}
                    className={`absolute text-sm font-bold ${color} drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`}
                    style={{
                        left: `${10 + Math.random() * 80}%`,
                        bottom: "10%",
                    }}
                    initial={{ opacity: 1, y: 0, scale: 0.5 }}
                    animate={{
                        opacity: [1, 0.8, 0],
                        y: -80 - Math.random() * 100,
                        scale: [0.5, 1.2, 0.3],
                        x: [
                            0,
                            (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 30),
                            0,
                        ],
                    }}
                    transition={{
                        duration: 1.2,
                        delay: i * 0.06,
                        ease: "easeOut",
                    }}
                >
                    ✦
                </motion.div>
            ))}
        </div>
    );
};

export const RoundResultOverlay = ({
    isOpen,
    isSolo,
    isFirst,
    isCorrect,
    firstAnswerCorrect,
    damage,
    onComplete,
}: RoundResultOverlayProps) => {
    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(onComplete, EFFECT_DURATION);
        return () => clearTimeout(timer);
    }, [isOpen, onComplete]);

    const resultType = useMemo(() => {
        if (isSolo) {
            return isCorrect
                ? ("solo_correct" as const)
                : ("solo_wrong" as const);
        }
        if (isFirst) {
            return isCorrect
                ? ("mp_first_correct" as const)
                : ("mp_first_wrong" as const);
        }
        return firstAnswerCorrect
            ? ("mp_opponent_correct" as const)
            : ("mp_opponent_wrong" as const);
    }, [isSolo, isFirst, isCorrect, firstAnswerCorrect]);

    const { line1, message, isGood } = useMemo(() => {
        switch (resultType) {
            case "solo_correct":
                return {
                    line1: "Kamu menjawab benar!",
                    message: randomMessage(true),
                    isGood: true,
                };
            case "solo_wrong":
                return {
                    line1: "Jawabanmu kurang tepat!",
                    message: randomMessage(false),
                    isGood: false,
                };
            case "mp_first_correct":
                return {
                    line1: "Kamu menjawab benar pertama!",
                    message: randomMessage(true),
                    isGood: true,
                };
            case "mp_first_wrong":
                return {
                    line1: "Jawabanmu kurang tepat!",
                    message: randomMessage(false),
                    isGood: false,
                };
            case "mp_opponent_correct":
                return {
                    line1: "Musuh menjawab benar lebih dulu!",
                    message: randomMessage(false),
                    isGood: false,
                };
            case "mp_opponent_wrong":
                return {
                    line1: "Musuh menjawab salah, kamu aman!",
                    message: randomMessage(true),
                    isGood: true,
                };
        }
    }, [resultType]);

    const damageText = useMemo(() => {
        if (damage <= 0) return "Tidak ada damage";
        if (isSolo) {
            return isCorrect
                ? `Damage diberikan: ${damage}`
                : `Damage diterima: ${damage}`;
        }
        if (isFirst) {
            return isCorrect
                ? `Damage diberikan: ${damage}`
                : `Damage diterima: ${damage}`;
        }
        return firstAnswerCorrect
            ? `Musuh memberikan damage: ${damage}`
            : "Tidak ada damage";
    }, [damage, isSolo, isFirst, isCorrect, firstAnswerCorrect]);

    const accentColor = isGood ? "text-green-400" : "text-red-400";
    const bgGlow = isGood ? "bg-green-500/10" : "bg-red-500/10";
    const ringColor = isGood ? "border-green-400/30" : "border-red-400/30";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="round-result"
                    className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <motion.div
                        className={`pointer-events-none absolute inset-0 ${bgGlow}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0] }}
                        transition={{ duration: 0.4 }}
                    />

                    <Particles count={12} color={accentColor} />

                    <motion.div
                        className={`pointer-events-none absolute h-32 w-32 rounded-full border-2 ${ringColor}`}
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                    <motion.div
                        className={`pointer-events-none absolute h-32 w-32 rounded-full border ${ringColor}`}
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{
                            duration: 0.9,
                            delay: 0.05,
                            ease: "easeOut",
                        }}
                    />

                    <motion.div
                        className="relative z-10 flex flex-col items-center gap-4 text-center"
                        initial={{ scale: 0, y: 30 }}
                        animate={{ scale: [0, 1.3, 1], y: [30, -10, 0] }}
                        transition={{ duration: 0.45, ease: "backOut" }}
                    >
                        <div className="pointer-events-none absolute -inset-full z-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.8)_0%,transparent_70%)]" />
                        <div className="relative z-10 text-lg font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
                            {line1}
                        </div>

                        <div
                            className={`relative z-10 text-5xl font-black tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${accentColor}`}
                        >
                            {damage > 0 ? `${damage}` : "—"}
                        </div>
                        <div
                            className={`relative z-10 text-sm font-semibold tracking-wide ${accentColor}`}
                        >
                            {damageText}
                        </div>

                        <div className="relative z-10 mt-2 text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                            {message}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
