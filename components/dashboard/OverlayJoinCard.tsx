"use client";

import React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Users, Flag } from "lucide-react";
import { MainButton } from "@/components/common/MainButton";
import { CategoryType, Difficulty } from "@/types";
import { DIFFICULTY_THEME_MAP, getBannerColor } from "@/lib/constants/overlay-theme";

interface OverlayJoinCardProps {
  title: string;
  category: CategoryType | string;
  usersRegistered: number;
  usersTotal: number;
  questionsCount: number;
  iconPath: string;
  difficulty?: Difficulty;
  onClose?: () => void;
}

function OverlayCardContent({
  title,
  category,
  usersRegistered,
  usersTotal,
  questionsCount,
  iconPath,
  difficulty,
  onClose,
}: OverlayJoinCardProps) {
  const bannerColor = getBannerColor(category);
  const difficultyTheme = DIFFICULTY_THEME_MAP[difficulty as Difficulty] || DIFFICULTY_THEME_MAP["sedang"];

  return (
    <div className="font-(family-name:--font-baloo-2) relative w-full max-w-[400px] md:max-w-[500px] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300">

      {/* Top Banner Section */}
      <div className={`relative flex h-[200px] md:h-[240px] items-center justify-center transition-all ${bannerColor}`}>
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4 flex items-center gap-2 z-20">
          <button className="flex items-center gap-2 rounded-md bg-black/50 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-black/70">
            <Image src="/icons/share.svg" alt="Share" width={14} height={14} className="sm:w-4 sm:h-4" />
            Bagikan
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-black/70"
          >
            <Image src="/icons/cancel.svg" alt="Close" width={12} height={12} className="md:w-[14px] md:h-[14px]" />
          </button>
        </div>

        {/* Icon Besar */}
        <div className="relative flex h-40 w-40 md:h-48 md:w-48 items-center justify-center">
          <Image
            src={iconPath}
            alt={title}
            width={200}
            height={200}
            className="w-[140px] md:w-[170px] object-contain"
            priority
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-8 space-y-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#555555] leading-tight">
          {title}
        </h2>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-6 pb-4 border-b border-[#D9D9D9]">
          <div className="flex items-center gap-2 text-[#555555]">
            <Users size={22} className="text-[#256AF4]" />
            <span className="text-base font-bold">{usersRegistered}/{usersTotal} Pemain</span>
          </div>
          <div className="flex items-center gap-2 text-[#555555]">
            <Flag size={20} className="text-[#256AF4]" />
            <span className="text-base font-bold">{questionsCount} Ronde</span>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className={`inline-block px-4 py-1.5 rounded-lg font-bold text-sm capitalize ${difficultyTheme.badgeBg} ${difficultyTheme.badgeText}`}>
          Tingkat Kesulitan {difficulty}
        </div>

        {/* Action Button */}
        <MainButton
          variant="green"
          hasShadow
          className="mt-2 w-full text-lg font-bold py-6 sm:py-7 rounded-xl"
        >
          Bergabung
        </MainButton>
      </div>
    </div>
  );
}

export function OverlayJoinCard(props: OverlayJoinCardProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-5 sm:p-8">
      {/* Overlay Background */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={props.onClose}
      />

      {/* Card Wrapper */}
      <div className="z-10 w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
        <OverlayCardContent {...props} />
      </div>
    </div>,
    document.body
  );
}