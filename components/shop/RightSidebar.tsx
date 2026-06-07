"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MainButton } from "@/components/common/MainButton";
import { RoomTab } from "./RoomTab";
import { CharacterItem } from "./CharacterItem";

type Props = {
    activeTab: "character" | "skin";
    setActiveTab: (tab: "character" | "skin") => void;
    ownedBases: any[];
    skinsForBase: any[];
    selectedBase: string;
    setSelectedBase: (val: string) => void;
    selectedCharId: number | null;
    setSelectedCharId: (val: number) => void;
    selectedItem: any;
    isCurrentUsed: boolean;
    isEquipping: boolean;
    handleEquip: () => void;
    onPurchaseClick: (item: any) => void;
};

export const RightSidebar = ({
    activeTab,
    setActiveTab,
    ownedBases,
    skinsForBase,
    selectedBase,
    setSelectedBase,
    selectedCharId,
    setSelectedCharId,
    selectedItem,
    isCurrentUsed,
    isEquipping,
    handleEquip,
    onPurchaseClick,
}: Props) => {
    return (
        <aside className="relative md:absolute md:right-0 md:top-0 md:bottom-0 w-full md:w-68 flex-1 md:flex-none h-auto min-h-0 md:h-full bg-[#172844] flex flex-col border-l border-[#1F3353] z-40 pointer-events-auto overflow-hidden">
            {/* TABS */}
            <RoomTab activeTab={activeTab} onChange={setActiveTab} />

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="text-center mb-6 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-[#DEBC7F] rotate-45" />
                    <span className="text-[#FEA62C] font-bold text-md md:text-lg">
                        {activeTab === "character" ? "Semua Karakter" : "Semua Skin"}
                    </span>
                    <div className="w-2 h-2 bg-[#DEBC7F] rotate-45" />
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 gap-y-6 pb-6 w-full place-items-start pl-2">
                    {activeTab === "character" ? (
                        ownedBases.map((char) => (
                            <CharacterItem
                                key={char.character_id}
                                id={char.character_id}
                                name={char.base_character}
                                image_url={char.image_url}
                                base_character={char.base_character}
                                isSelected={selectedBase === char.base_character}
                                onClick={() => {
                                    setSelectedBase(char.base_character);
                                    setSelectedCharId(char.character_id);
                                }}
                            />
                        ))
                    ) : (
                        skinsForBase.map((skin) => (
                            <CharacterItem
                                key={skin.character_id}
                                id={skin.character_id}
                                name={skin.skin_name || skin.base_character}
                                image_url={skin.image_url}
                                base_character={skin.base_character}
                                skin_level={skin.skin_level}
                                owned={skin.owned}
                                isSelected={selectedCharId === skin.character_id}
                                onClick={() => setSelectedCharId(skin.character_id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* FOOTER ACTION */}
            <div className="p-4 bg-[#253D66] flex flex-col gap-3 shrink-0 z-20 border-t border-[#1F3353] sticky bottom-2 md:bottom-0">
                {selectedItem?.owned ? (
                    <MainButton
                        variant="blue"
                        disabled={isCurrentUsed || isEquipping}
                        onClick={handleEquip}
                        className={cn(
                            "w-full font-bold py-3 h-auto text-base transition-all duration-300",
                            isCurrentUsed ? "bg-[#9BA5AB]! text-[#555555]! opacity-100 disabled:opacity-100 shadow-none pointer-events-none" : ""
                        )}
                        style={isCurrentUsed ? { boxShadow: "none", transform: "none" } : undefined}
                    >
                        {isEquipping ? "Memproses..." : isCurrentUsed ? "Digunakan" : "Gunakan"}
                    </MainButton>
                ) : (
                    <MainButton
                        variant="blue"
                        onClick={() => onPurchaseClick(selectedItem)}
                        className="w-full flex items-center justify-center gap-2 py-3 h-auto text-base font-bold transition-all duration-300"
                    >
                        <Image
                            src="/icons/coin-color.svg"
                            width={22}
                            height={22}
                            alt="coin"
                            className="group-hover:rotate-12 transition-transform"
                        />
                        <span>{selectedItem?.cost?.toLocaleString("id-ID")}</span>
                    </MainButton>
                )}
            </div>
        </aside>
    );
};
