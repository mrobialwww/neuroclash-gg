"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

export const CloseButton = ({ onClick, className }: CloseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95 group shadow-xl cursor-pointer",
        className
      )}
    >
      <Image
        src="/icons/cancel.svg"
        alt="Close"
        width={24}
        height={24}
        className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300"
      />
    </button>
  );
};
