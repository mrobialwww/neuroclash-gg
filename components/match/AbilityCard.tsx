"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AbilityCardProps {
  name: string;
  image: string;
  emptyImage: string;
  description: string;
  stock: number;
  className?: string;
  onClick?: () => void;
}

export const AbilityCard = ({
  name,
  image,
  emptyImage,
  stock,
  className,
  onClick
}: AbilityCardProps) => {
  const displayImage = stock > 0 ? image : emptyImage;

  return (
    <div
      className={cn(
        "relative cursor-pointer group transition-all duration-200 transform",
        stock > 0 ? "hover:scale-[1.02] hover:-translate-y-1 active:scale-95" : "opacity-80 grayscale-[0.3]",
        className
      )}
      onClick={stock > 0 ? onClick : undefined}
    >
      <div className="relative w-full aspect-412/212 drop-shadow-2xl">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 180px, (max-width: 1024px) 200px, 220px"
          className="object-contain"
          priority
        />

        {/* Stock text in top right corner overlaying the ribbon */}
        <div className="absolute top-[1.5%] right-[4%] z-10 pointer-events-none">
          <div className="flex items-center justify-end">
            <span className="text-white font-bold text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              x{stock}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
