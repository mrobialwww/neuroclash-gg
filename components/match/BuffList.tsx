"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BuffItem } from "./BuffItem";

interface Buff {
  id: string;
  name: string;
  type: "material" | "attack" | "heal";
  image: string;
  label: string;
}

const MOCK_BUFFS: Buff[] = [
  { id: "b1", name: "Materi A", type: "material", image: "/buff/material.webp", label: "Materi A" },
  { id: "b2", name: "Materi B", type: "material", image: "/buff/material.webp", label: "Materi B" },
  { id: "b3", name: "Materi C", type: "material", image: "/buff/material.webp", label: "Materi C" },
  { id: "b4", name: "Attack", type: "attack", image: "/buff/attack.webp", label: "Attack" },
  { id: "b5", name: "Heal", type: "heal", image: "/buff/heal.webp", label: "Heal" },
];

interface BuffListProps {
  className?: string;
}

export const BuffList = ({ className }: BuffListProps) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center rounded-2xl border-2 border-white/10 bg-[#D9D9D9]/20 p-2 shadow-2xl backdrop-blur-md",
        className,
      )}
    >
      {/* Header Badge */}
      <div className="relative mb-3 flex h-[35px] w-full max-w-[180px] shrink-0 items-center justify-center md:h-[40px]">
        <Image src="/match/match-badge.webp" alt="Badge" fill sizes="(max-width: 768px) 180px, 200px" className="object-contain" priority />
        <h2 className="xs:text-xs relative z-10 mt-0.5 text-[10px] font-semibold tracking-tight text-white md:text-base">Materi & Kekuatan</h2>
      </div>

      {/* Buff Grid Container */}
      <div className="scrollbar-hide w-full flex-1 overflow-y-auto pb-2">
        <div
          className="grid gap-x-2 gap-y-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
          }}
        >
          {MOCK_BUFFS.map((buff) => (
            <BuffItem key={buff.id} buff={buff} />
          ))}
        </div>
      </div>
    </div>
  );
};
