"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCharacterBgColor } from "@/lib/constants/characters";

type Props = {
    id: number;
    name: string;
    image_url: string;
    base_character: string;
    skin_level?: string;
    owned?: boolean;
    isSelected: boolean;
    onClick: () => void;
};

export const CharacterItem = ({
    name,
    image_url,
    base_character,
    skin_level = "default",
    owned = true,
    isSelected,
    onClick,
}: Props) => {
    const bgColor = skin_level === 'epic' ? '#7C13A2' : skin_level === 'legend' ? '#C89B00' : getCharacterBgColor(base_character);

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-1 group w-full"
        >
            <div
                className={cn(
                    "relative w-18 h-18 md:w-22 md:h-22 rounded-full border-3 border-white overflow-hidden flex items-center justify-center transition-colors",
                    isSelected ? "shadow-[0_0_20px_8px_#FDA928]" : "shadow-lg"
                )}
                style={{ backgroundColor: bgColor }}
            >
                {/* Character Image container */}
                <div className="relative w-[70%] h-[70%] flex items-center justify-center">
                    <Image
                        src={image_url}
                        alt={name}
                        fill
                        sizes="80px"
                        className="object-contain drop-shadow-md"
                    />
                </div>

                {/* Overlays (Locked) */}
                {!owned && (
                    <div className="absolute inset-0 bg-[#161616]/50 flex items-center justify-center z-20 rounded-full">
                        <Image
                            src="/icons/lock.svg"
                            alt="Locked"
                            width={32}
                            height={32}
                            className="w-8 h-8 text-white"
                        />
                    </div>
                )}
            </div>
            <span className="text-sm md:text-base font-bold w-full text-center mt-1 truncate px-1 text-white">
                {name}
            </span>
        </button>
    );
};
