"use client";

import React from "react";
import { Users, Flag } from "lucide-react";
import Image from "next/image";
import { AvatarCircles, AvatarItem } from "@/components/ui/AvatarCircles";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  title: string;
  progress: number; // 0 to 100
  usersRegistered: number;
  usersTotal: number;
  questionsCount: number;
  iconPath: string; // Asset path for the center icon
  players: AvatarItem[]; // Use AvatarItem for dynamic player list
  onClick?: () => void;
  className?: string;
}

export function CourseCard({
  title,
  usersRegistered,
  usersTotal,
  questionsCount,
  iconPath,
  players,
  onClick,
  className,
}: Omit<CourseCardProps, "progress">) {
  // Auto-calculate progress based on players
  const progress = Math.min((usersRegistered / usersTotal) * 100, 100);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 pb-6 shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center w-full transition-all hover:shadow-[0_8px_35px_rgba(0,0,0,0.08)] cursor-pointer group",
        className,
      )}
      onClick={onClick}
    >
      {/* Center Icon Container - Single full circle with border */}
      <div className="relative mb-2 mt-1 w-32 h-32 rounded-full flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0">
        <Image
          src={iconPath}
          alt={title}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Title */}
      <h3 className="text-center font-extrabold text-[#555555] text-xl mb-2 leading-tight tracking-tight min-h-10 flex items-center justify-center px-1">
        {title}
      </h3>

      {/* Progress Bar Container */}
      <div className="w-full bg-[#E5E7EB] rounded-full h-2.5 mb-5 overflow-hidden">
        <div
          className="bg-[#256AF4] h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Footer Stats Row */}
      <div className="flex items-center justify-between w-full mt-auto">
        {/* Avatars on the left */}
        <div className="shrink-0">
          <AvatarCircles items={players} avatarSize={44} />
        </div>

        {/* Counters on the right */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex flex-col items-center">
            <Users size={22} className="text-[#256AF4] mb-0.5 opacity-80" />
            <span className="text-[#555555] font-extrabold text-sm">
              {usersRegistered}/{usersTotal}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Flag size={22} className="text-[#256AF4] mb-0.5 opacity-80" />
            <span className="text-[#555555] font-extrabold text-sm">
              {questionsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
