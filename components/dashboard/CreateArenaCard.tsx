"use client";

import React from "react";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";
import { TextFieldWithButton } from "@/components/common/TextFieldWithButton";

export function CreateArenaCard() {
  return (
    <div className="relative w-full h-full bg-[#4D70E8] text-white rounded-3xl p-6 lg:p-8 flex flex-col justify-center overflow-hidden shadow-sm min-h-[220px] md:min-h-[240px]">
      {/* Background Decorative Images */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-3xl">
        <img
          src="/dashboard/create-arena-bg-2.webp"
          alt=""
          className="absolute top-[-10%] right-[-5%] w-[80%] md:w-auto md:h-full object-cover md:object-contain object-top-right z-0"
        />
        <img
          src="/dashboard/create-arena-bg-1.webp"
          alt=""
          className="absolute bottom-[-10%] right-[-5%] md:right-0 w-[90%] md:w-auto md:h-[110%] object-cover md:object-contain object-bottom-right z-10"
        />
      </div>

      {/* Illustration */}
      <div className="absolute right-0 md:right-[2%] lg:right-[5%] top-1/2 -translate-y-1/2 w-[55%] md:w-[40%] lg:w-[35%] h-[80%] lg:h-[85%] pointer-events-none z-20 flex items-center justify-end opacity-90 md:opacity-100 pr-2">
        <img
          src="/dashboard/create-arena-illust.webp"
          alt="Create Arena Illustration"
          className="object-contain w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-[65%] sm:w-[55%] md:w-[60%] lg:w-[50%] flex flex-col items-start pt-[5%] md:pt-0 pl-1 md:pl-2">
        <h2 className="text-[1.75rem] md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-4 tracking-wide leading-[1.1] drop-shadow-sm text-balance">
          Buat Arena
        </h2>
        <p className="text-white/95 text-[13px] md:text-base leading-[1.4] mb-4 md:mb-8 font-medium max-w-[200px] md:max-w-[280px] text-balance">
          Buat arena kuis dan tantang pemain lain dalam duel pengetahuan
        </p>
        <MainButton
          variant="white"
          size="sm"
          hasShadow
          className="text-[#4D70E8] px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base w-max font-extrabold"
        >
          Buat Arena Baru
        </MainButton>
      </div>
    </div>
  );
}
