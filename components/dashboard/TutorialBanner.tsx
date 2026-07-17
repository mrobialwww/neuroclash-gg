"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";

export function TutorialBanner() {
  return (
    <div className="relative w-full bg-linear-to-r from-[#FFCC00]/20 via-[#3D79F3]/20 to-[#22C55E]/20 border border-[#FFCC00]/30 rounded-3xl p-5 md:p-6 flex items-center justify-between overflow-hidden">
      <div className="absolute inset-0 bg-[#0B0D14]/60" />

      <div className="relative z-10 flex flex-col gap-2">
        <h3 className="text-white text-2xl md:text-3xl font-extrabold">
          Baru di Neuroclash?
        </h3>
        <p className="text-white text-sm md:text-base">
          Pelajari cara bermain dalam 5 ronde tutorial yang seru dan interaktif
        </p>
        <Link href="/demo" className="w-fit">
          <MainButton
            variant="green"
            hasShadow
            className="px-5 py-2 text-sm md:text-base font-bold rounded-xl mt-1"
          >
            Mode Tutorial
          </MainButton>
        </Link>
      </div>

      <div className="relative z-10 hidden sm:block w-[120px] h-[100px] md:w-[140px] md:h-[120px] shrink-0">
        <Image
          src="/match/prof-bubu.webp"
          alt="Prof Bubu"
          fill
          sizes="140px"
          className="object-contain drop-shadow-[0_0_20px_rgba(255,204,0,0.3)]"
        />
      </div>
    </div>
  );
}
