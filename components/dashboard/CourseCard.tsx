"use client";

import React from "react";
import { Users, Flag } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AvatarCircles } from "./AvatarCircles";
import { User } from "@/app/types/User";

interface CourseCardProps {
  title: string;
  progress: number;
  usersRegistered: number;
  usersTotal: number;
  questionsCount: number;
  iconPath: string;
  players: User[];
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
  const progress = Math.min((usersRegistered / usersTotal) * 100, 100);

  return (
    <div
      className={cn(
        "group flex w-full cursor-pointer flex-col items-center rounded-2xl border border-gray-50 bg-white p-5 pb-6 shadow-[0_4px_25px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_35px_rgba(0,0,0,0.08)]",
        className,
      )}
      onClick={onClick}
    >
      {/* Center Icon Container */}
      <div className="relative mb-2 mt-1 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105">
        <Image src={iconPath} alt={title} fill sizes="128px" className="object-contain" priority />
      </div>

      {/* Title */}
      <h3 className="min-h-10 mb-2 flex items-center justify-center px-1 text-center text-xl font-extrabold leading-tight text-[#555555]">
        {title}
      </h3>

      {/* Progress Bar */}
      <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#256AF4] transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Footer Stats Row */}
      <div className="mt-auto flex w-full items-center justify-between">
        {/* Avatars on the left */}
        <div className="shrink-0">
          <AvatarCircles items={players} avatarSize={44} />
        </div>

        {/* Counters on the right */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex flex-col items-center">
            <Users size={22} className="mb-0.5 text-[#256AF4] opacity-80" />
            <span className="text-sm font-extrabold text-[#555555]">
              {usersRegistered}/{usersTotal}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Flag size={22} className="mb-0.5 text-[#256AF4] opacity-80" />
            <span className="text-sm font-extrabold text-[#555555]">{questionsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}