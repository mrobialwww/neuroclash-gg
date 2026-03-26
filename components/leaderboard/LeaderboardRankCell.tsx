import Image from "next/image";

interface LeaderboardRankCellProps {
  position: number;
}

export function LeaderboardRankCell({ position }: LeaderboardRankCellProps) {
  if (position === 1) {
    return (
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px] shrink-0 mx-auto">
        <Image
          src="/leaderboard/first.webp"
          alt="1st Place"
          width={60}
          height={60}
          className="object-contain w-full h-full drop-shadow-lg"
        />
      </div>
    );
  }
  if (position === 2) {
    return (
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px] shrink-0 mx-auto">
        <Image
          src="/leaderboard/second.webp"
          alt="2nd Place"
          width={60}
          height={60}
          className="object-contain w-full h-full drop-shadow-lg"
        />
      </div>
    );
  }
  if (position === 3) {
    return (
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px] shrink-0 mx-auto">
        <Image
          src="/leaderboard/third.webp"
          alt="3rd Place"
          width={60}
          height={60}
          className="object-contain w-full h-full drop-shadow-lg"
        />
      </div>
    );
  }

  return (
    <span className="text-white font-medium text-lg md:text-xl leading-none">
      {position}
    </span>
  );
}
