import Image from "next/image";

interface EndgameRewardBadgeProps {
  coinsEarned: number;
  trophyWon: number;
}

export function EndgameRewardBadge({
  coinsEarned,
  trophyWon,
}: EndgameRewardBadgeProps) {
  return (
    <div
      className="flex flex-col gap-1 sm:gap-2 rounded-2xl px-4 py-2 sm:px-6 sm:py-4 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.10) 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <span className="text-center text-[10px] sm:text-xs md:text-sm font-semibold text-white/80">
        Hadiah Total Pertandingan
      </span>

      <div className="flex items-center gap-4 sm:gap-6 justify-center mt-0.5 sm:mt-1">
        {/* Coin */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative h-5 w-5 sm:h-8 sm:w-8 shrink-0">
            <Image
              src="/icons/coin-color.svg"
              alt="Coin"
              fill
              sizes="(max-width: 640px) 20px, 32px"
              className="object-contain"
            />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-white">+{coinsEarned}</span>
        </div>

        {/* Divider */}
        <div className="h-5 sm:h-8 w-px bg-white/30 rounded-full" />

        {/* Trophy */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative h-5 w-5 sm:h-8 sm:w-8 shrink-0">
            <Image
              src="/icons/trophy-color.svg"
              alt="Trophy"
              fill
              sizes="(max-width: 640px) 20px, 32px"
              className="object-contain"
            />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-white">+{trophyWon}</span>
        </div>
      </div>
    </div>
  );
}
