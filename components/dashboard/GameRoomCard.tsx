"use client";

import React, { useState } from "react";
import { Users, Flag } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";
import { OverlayJoinCard } from "@/components/dashboard/OverlayJoinCard";
import { AvatarCircles } from "@/components/dashboard/AvatarCircles";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { MockUser } from "@/types/MockUser";

interface GameRoomCardProps {
    room: GameRoomWithPlayerCount;
    onClick?: () => void;
    className?: string;
}

const FALLBACK_IMAGE = "/quiz-category/default.webp";

function resolveImage(src: string | null | undefined, error: boolean): string {
    return error || !src ? FALLBACK_IMAGE : src;
}

export function GameRoomCard({ room, onClick, className }: GameRoomCardProps) {
    const [open, setOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    const progress = Math.min((room.player_count / room.max_player) * 100, 100);
    const displayTitle = room.title || room.category;

    // Map participant avatar URLs into MockUser objects for AvatarCircles
    const avatarUsers: MockUser[] = (room.participants_avatars ?? [])
        .slice(0, 4)
        .map((data, idx) => ({
            id: String(idx),
            name: `Pemain ${idx + 1}`,
            character: data.character,
            image: data.image,
        }));

    const handleClick = () => {
        setOpen(true);
        onClick?.();
    };

    return (
        <>
            <div
                className={cn(
                    "group flex w-full cursor-pointer flex-col items-center rounded-2xl border border-white/10 bg-[#D9D9D9]/20 p-5 pb-6 shadow-lg backdrop-blur-md transition-all hover:bg-[#D9D9D9]/30",
                    className,
                )}
                onClick={handleClick}
            >
                {/* Center Icon Container */}
                <div className="relative mb-2 mt-1 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <Image
                        src={resolveImage(room.image_url, imgError)}
                        alt={displayTitle}
                        fill
                        sizes="128px"
                        className="object-contain"
                        priority
                        onError={() => setImgError(true)}
                    />
                </div>

                {/* Title */}
                <h3 className="min-h-10 mb-2 flex items-center justify-center px-1 text-center text-xl font-extrabold leading-tight text-white group-hover:text-blue-400">
                    {displayTitle}
                </h3>

                {/* Progress Bar */}
                <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-white/30">
                    <div
                        className="h-full rounded-full bg-[#256AF4] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Footer Stats Row */}
                <div className="mt-auto flex w-full items-center justify-between">
                    {/* Participant Character Avatars (max 4) */}
                    {avatarUsers.length > 0 ? (
                        <AvatarCircles
                            items={avatarUsers}
                            avatarSize={44}
                            maxItems={4}
                            className="md:pl-1"
                        />
                    ) : (
                        <div />
                    )}

                    {/* Player count & round count */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                            <Users
                                size={22}
                                className="mb-0.5 text-[#3B82F6]"
                            />
                            <span className="text-sm font-bold text-white/80">
                                {room.player_count}/{room.max_player}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Flag
                                size={22}
                                className="mb-0.5 text-[#3B82F6]"
                            />
                            <span className="text-sm font-bold text-white/80">
                                {room.total_round}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {open && (
                <OverlayJoinCard room={room} onClose={() => setOpen(false)} />
            )}
        </>
    );
}

export function GameRoomCardSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "flex w-full animate-pulse flex-col items-center rounded-2xl bg-white/[0.03] p-5 pb-6",
                className,
            )}
        >
            <div className="mb-2 mt-1 h-32 w-32 rounded-full bg-white/10" />
            <div className="mb-2 mt-2 h-10 w-3/4 rounded-md bg-white/10" />
            <div className="mb-5 h-2.5 w-full rounded-full bg-white/10" />
            <div className="mt-auto flex w-full items-center justify-between">
                <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-[44px] w-[44px] rounded-full bg-white/10"
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-8 rounded-md bg-white/10" />
                    <div className="h-10 w-8 rounded-md bg-white/10" />
                </div>
            </div>
        </div>
    );
}
