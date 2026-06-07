"use client";

import { cn } from "@/lib/utils";

type Props = {
    activeTab: "character" | "skin";
    onChange: (tab: "character" | "skin") => void;
};

export const RoomTab = ({ activeTab, onChange }: Props) => {
    return (
        <div className="flex p-4 w-full pt-6 shrink-0 justify-center">
            <div className="flex w-full max-w-[320px] bg-[#3865AF] rounded-md shadow-inner">
                <button
                    onClick={() => onChange("character")}
                    className={cn(
                        "flex-1 h-10 rounded-md flex items-center justify-center transition-all duration-300",
                        activeTab === "character" ? "bg-[#6AA2FF] text-white shadow-md" : "text-white/60 hover:text-white"
                    )}
                >
                    <div className="relative w-6 h-6 md:w-7 md:h-7">
                        <div
                            className="w-full h-full bg-current transition-colors duration-300"
                            style={{
                                maskImage: `url(/icons/character.svg)`,
                                WebkitMaskImage: `url(/icons/character.svg)`,
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                            }}
                        />
                    </div>
                </button>
                <button
                    onClick={() => onChange("skin")}
                    className={cn(
                        "flex-1 h-10 rounded-md flex items-center justify-center transition-all duration-300",
                        activeTab === "skin" ? "bg-[#6AA2FF] text-white shadow-md" : "text-white/60 hover:text-white"
                    )}
                >
                    <div className="relative w-6 h-6 md:w-7 md:h-7">
                        <div
                            className="w-full h-full bg-current transition-colors duration-300"
                            style={{
                                maskImage: `url(/icons/skin.svg)`,
                                WebkitMaskImage: `url(/icons/skin.svg)`,
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                            }}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
};
