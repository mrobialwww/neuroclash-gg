"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { SkillType } from "@/lib/constants/characters";
import { SkillBadge } from "@/components/match/SkillBadge";
import { cn } from "@/lib/utils/utils";
import { MockUser as User } from "@/types/MockUser";
import { useMatchStore } from "@/store/useMatchStore";

interface Player extends User {
    health: number;
    maxHealth: number;
}

interface PlayerCardProps {
    player: Player;
    isMe?: boolean;
    isOpponent?: boolean;
    hideHealthBar?: boolean;
    className?: string;
    /** Tipe skill pasif karakter (hanya untuk epic/legend) */
    skillType?: SkillType | null;
    /** Level skin untuk menentukan nilai skill */
    skinLevel?: "epic" | "legend";
}

export const PlayerCard = ({
    player,
    isMe = false,
    isOpponent = false,
    hideHealthBar = false,
    className,
    skillType = null,
    skinLevel,
}: PlayerCardProps) => {
    const healthPercentage = (player.health / player.maxHealth) * 100;

    // Suppress the transition animation on the very first render
    const isMounted = useRef(false);
    const [enableTransition, setEnableTransition] = useState(false);
    const [activeAnim, setActiveAnim] = useState<
        "heal" | "defence" | "damage" | null
    >(null);
    const firstAnswerPlayerId = useMatchStore(
        (state) => state.firstAnswerPlayerId,
    );

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            // Allow one frame to paint with the initial width before enabling
            // transition so subsequent HP changes animate smoothly
            const raf = requestAnimationFrame(() => {
                setEnableTransition(true);
            });
            return () => cancelAnimationFrame(raf);
        }
    }, []);

    const [prevHealth, setPrevHealth] = useState(() => {
        // Jika ronde 1 dan HP > maxHealth, artinya backend sudah apply heal
        // sebelum halaman diload. Kita set prevHealth ke maxHealth agar animasi jalan.
        if (skillType === "heal" && player.health > player.maxHealth) {
            return player.maxHealth;
        }
        return player.health;
    });

    // Reset activeAnim otomatis setelah 2 detik
    useEffect(() => {
        if (activeAnim !== null) {
            const timer = setTimeout(() => setActiveAnim(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [activeAnim]);

    // Animasi attack/damage ketika player ini adalah yang menjawab benar pertama
    useEffect(() => {
        if (!isMounted.current) return;
        if (firstAnswerPlayerId === player.id && skillType === "damage") {
            setActiveAnim("damage");
        }
    }, [firstAnswerPlayerId, player.id, skillType]);

    useEffect(() => {
        if (!isMounted.current) return;

        if (player.health > prevHealth) {
            if (skillType === "heal") setActiveAnim("heal");
        } else if (player.health < prevHealth) {
            if (skillType === "defence") setActiveAnim("defence");
        }

        setPrevHealth(player.health);
    }, [player.health, prevHealth, skillType]);

    return (
        <div
            className={cn(
                // Mobile: Horizontal layout | Desktop (lg): Vertical Card layout
                "relative flex w-full items-center gap-3 rounded-xl border-white/10 shadow-2xl backdrop-blur-md lg:max-w-[240px] lg:flex-col lg:gap-0 lg:border-2 lg:bg-[#D9D9D9]/20 lg:p-4",
                isMe ? "flex-row" : "flex-row-reverse lg:flex-col",
                isOpponent && "border-4 border-yellow-500 shadow-yellow-500/50",
                className,
            )}
        >
            {/* Subtle Card Skill Animations */}
            <AnimatePresence>
                {activeAnim === "heal" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute inset-0 z-20 rounded-xl lg:rounded-2xl border-2 border-green-500 bg-green-500/10 shadow-[inset_0_0_15px_rgba(34,197,94,0.2)]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute left-1/2 top-1/4 -translate-x-1/2 text-sm font-bold text-green-400 drop-shadow-md md:text-base lg:text-lg"
                        >
                            + Heal
                        </motion.div>
                    </motion.div>
                )}
                {activeAnim === "defence" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute inset-0 z-20 rounded-xl lg:rounded-2xl border-2 border-blue-500 bg-blue-500/10 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute left-1/2 top-1/4 -translate-x-1/2 text-sm font-bold text-blue-400 drop-shadow-md md:text-base lg:text-lg"
                        >
                            Shield!
                        </motion.div>
                    </motion.div>
                )}
                {activeAnim === "damage" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute inset-0 z-20 rounded-xl lg:rounded-2xl border-2 border-red-500 bg-red-500/10 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 1.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute left-1/2 top-1/4 -translate-x-1/2 text-sm font-bold text-red-400 drop-shadow-md md:text-base lg:text-lg"
                        >
                            Attack!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Avatar Section */}
            {/* Avatar Section */}
            <div
                className={cn(
                    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-lg transition-all duration-300",
                    "h-12 w-12 md:h-14 md:w-14 lg:mb-4 lg:h-20 lg:w-20",
                )}
                style={{
                    backgroundColor: getCharacterBgColor(player.character),
                }}
            >
                <div className="relative mt-1 flex h-[85%] w-[85%] items-center justify-center">
                    <Image
                        src={player.image}
                        alt={player.character}
                        fill
                        sizes="(max-width: 768px) 56px, 80px"
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Info Section (Name, Bar, Role) */}
            <div
                className={cn(
                    "flex flex-1 flex-col lg:w-full",
                    isMe
                        ? "items-start lg:items-center"
                        : "items-end lg:items-center",
                )}
            >
                {/* Name */}
                <h3
                    className={cn(
                        "max-w-[120px] truncate text-xs font-semibold tracking-tight text-white md:max-w-[150px] md:text-sm lg:max-w-[180px] lg:text-lg",
                        !isMe && "text-right lg:text-center",
                    )}
                >
                    {player.name}
                </h3>

                {/* Skill Badge — tampil hanya untuk karakter epic/legend yang punya skill */}
                {skillType && skinLevel && (
                    <SkillBadge
                        skillType={skillType}
                        skinLevel={skinLevel}
                        className="my-1"
                    />
                )}

                {/* HP Bar Section - Hidden in Solo mode for opponent */}
                {!hideHealthBar && (
                    <div className="relative my-1 h-3 w-full overflow-hidden rounded-full border border-white/20 bg-[#1A1B23] shadow-inner md:h-4 lg:mb-2">
                        <div
                            className={cn(
                                "h-full bg-[#22C55E] shadow-[0_0_10px_rgba(94,211,106,0.5)]",
                                enableTransition &&
                                    "transition-[width] duration-300 ease-out",
                            )}
                            style={{ width: `${healthPercentage}%` }}
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-semibold text-white md:text-[10px] lg:text-xs">
                                HP: {player.health}/{player.maxHealth}
                            </span>
                        </div>
                    </div>
                )}

                {/* Role Label */}
                <p className="md:text-md text-sm font-medium text-white">
                    {isMe ? "(Kamu)" : "(Lawan)"}
                </p>
            </div>
        </div>
    );
};
