"use client";

import React from "react";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";

export function CreateArenaCard() {
  return (
    <div className="relative w-full h-full bg-[#4D70E8] text-white rounded-3xl p-6 lg:p-8 flex flex-col justify-center overflow-hidden shadow-sm min-h-[220px] md:min-h-[240px]">

      {/* Background Decorative Images */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-3xl">
        <div className="absolute top-0 right-[-10%] w-[70%] h-full">
          <Image
            src="/dashboard/create-arena-bg-2.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 70vw, 40vw"
            className="object-contain object-top-right"
          />
        </div>

        <div className="absolute bottom-0 right-0 w-full h-[80%]">
          <Image
            src="/dashboard/create-arena-bg-1.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 80vw, 40vw"
            className="object-contain object-bottom-right"
          />
        </div>
      </div>

      {/* Illustration (Karakter orang) */}
      <div className="absolute right-0 md:right-[2%] lg:right-[5%] top-1/2 -translate-y-1/2 w-[50%] md:w-[40%] lg:w-[35%] h-[70%] md:h-[80%] pointer-events-none z-20 flex items-center justify-end pr-2">
        <div className="relative w-full h-full">
          <Image
            src="/dashboard/create-arena-illust.webp"
            alt="Create Arena Illustration"
            fill
            sizes="(max-width: 768px) 50vw, 35vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-30 w-[60%] sm:w-[55%] md:w-[60%] lg:w-[50%] flex flex-col items-start pl-1 md:pl-2">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-4 tracking-wide leading-tight drop-shadow-sm">
          Buat Arena
        </h2>
        <p className="text-white/95 text-xs md:text-base leading-relaxed mb-4 md:mb-8 font-medium max-w-[220px] md:max-w-[280px]">
          Buat arena kuis dan tantang pemain lain dalam duel pengetahuan
        </p>
        <MainButton
          variant="white"
          size="sm"
          hasShadow
          className="text-[#4D70E8] px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-base w-max font-extrabold"
        >
          Buat Arena Baru
        </MainButton>
      </div>
    </div>
  );
}