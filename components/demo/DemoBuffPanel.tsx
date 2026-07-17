"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ActiveBuff } from "@/store/useDemoStore";
import { cn } from "@/lib/utils/utils";

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
                <span className="text-[11px] text-green-400 md:text-xs">Terpakai</span>
            ) : (
                <span className="text-[11px] text-white/70 md:text-xs">
                    Klik untuk pakai
                </span>
            )}
        </motion.div>
    );
}

export function DemoBuffPanel({
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
                <h2 className="relative z-10 mt-0.5 text-xs font-semibold tracking-tight text-white md:text-sm">
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
                        <p className="text-xs text-white/70 md:text-sm">
                            Belum ada item
                        </p>
                        <p className="mt-1 text-[11px] text-white/20 md:text-xs">
                            Item StarBox akan muncul di sini
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
