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
        "relative w-full p-2 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 shadow-2xl flex flex-col items-center",
        className
      )}
    >
      {/* Header Badge */}
      <div className="relative w-full max-w-[180px] h-[35px] md:h-[40px] shrink-0 flex items-center justify-center mb-3">
        <Image
          src="/match/match-badge.webp"
          alt="Badge"
          fill
          className="object-contain"
          priority
        />
        <h2 className="relative z-10 text-white font-semibold text-[10px] xs:text-xs md:text-base tracking-tight mt-0.5">
          Materi & Kekuatan
        </h2>
      </div>

      {/* Buff Grid Container */}
      <div className="w-full flex-1 overflow-y-auto scrollbar-hide pb-2">
        <div
          className="grid gap-x-2 gap-y-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))"
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