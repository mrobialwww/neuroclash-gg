import React from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

export type Level = "default" | "epic" | "legend";

export type CardProps = {
  id: string;
  image_url?: string;
  name?: string;
  skin_name?: string;
  cost?: number;
  skin_level?: Level;
  owned?: boolean;
  character_bg?: string;
  onPurchase?: () => void;
};

const LEVEL_COLORS: Record<Level, string> = {
  default: "#4AA213",
  epic: "#7C13A2",
  legend: "#C89B00",
};

export default function CharacterCard({
  image_url,
  name,
  skin_name,
  cost,
  skin_level = "default",
  owned = false,
  character_bg,
  onPurchase,
}: CardProps) {
  let bg: string;
  if (skin_level === "epic") {
    bg = LEVEL_COLORS.epic;
  } else if (skin_level === "legend") {
    bg = LEVEL_COLORS.legend;
  } else {
    bg = character_bg ?? LEVEL_COLORS.default;
  }

  const displayName = skin_name ?? name ?? "Item";

  return (
    <div
      className="relative flex flex-col items-center rounded-xl overflow-hidden shadow-lg select-none group w-full aspect-[2/2.8] sm:aspect-2/3"
      style={{ backgroundColor: bg }}
    >
      {/* Radial highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_38%,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0)_70%)]"
      />

      {/* Badges */}
      {skin_level !== "default" && (
        <div
          className={cn(
            "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm",
            skin_level === "legend" ? "bg-[#FFE270] text-[#796100]" : "bg-[#ECC5FE] text-[#631D76]"
          )}
        >
          <NextImage
            src={skin_level === "legend" ? "/icons/legend.svg" : "/icons/epic.svg"}
            width={12}
            height={12}
            alt={skin_level}
            className="w-3 h-3 md:w-4 md:h-4"
          />
          <span className="text-[8px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wide leading-none">
            {skin_level}
          </span>
        </div>
      )}

      {/* Character Image */}
      <div className="relative z-10 flex flex-1 items-center justify-center w-full px-3 pt-4 sm:px-4 sm:pt-6">
        {image_url ? (
          <div className="relative w-[75%] sm:w-[65%] aspect-square flex items-center justify-center">
            <NextImage
              src={image_url}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 20vw"
              className="object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">No Image</div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex w-full flex-col items-center gap-2 sm:gap-4 px-3 pb-4 pt-1 sm:px-4 sm:pb-5 sm:pt-2">
        <h3 className="w-full truncate text-center font-bold text-white text-sm sm:text-lg md:text-xl lg:text-2xl drop-shadow-md">
          {displayName}
        </h3>

        {/* Action Button / Owned State */}
        {owned ? (
          <div className="w-full py-1.5 rounded-md bg-[#172844] text-center font-bold text-white/90 text-sm md:text-base">
            Dimiliki
          </div>
        ) : (
          <button
            onClick={onPurchase}
            className="flex w-full items-center justify-center gap-2 py-1.5 rounded-md bg-white shadow-xl hover:bg-white/95 active:scale-95 transition-all group/btn cursor-pointer"
          >
            <NextImage
              src="/icons/coin-color.svg"
              width={20}
              height={20}
              alt="coin"
              className="w-5 h-5 group-hover/btn:rotate-12 transition-transform"
            />
            <span className="font-bold text-gray-800 text-sm md:text-lg">
              {cost != null ? cost.toLocaleString("id-ID") : "—"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
