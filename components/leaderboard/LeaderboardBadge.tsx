import Image from "next/image";

interface LeaderboardBadgeProps {
  title: string;
}

export function LeaderboardBadge({ title }: LeaderboardBadgeProps) {
  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-full max-w-[320px] md:max-w-[400px] flex items-center justify-center z-20 px-4">
      <div className="relative w-full h-auto flex items-center justify-center">
        <Image
          src="/dashboard/trophy-badge.webp"
          alt="Rank Badge Background"
          width={360}
          height={68}
          className="object-contain -z-10 drop-shadow-sm block w-full h-full"
          sizes="(max-width: 400px) 100vw, 400px"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center px-3 sm:px-6">
          <span className="text-lg md:text-xl text-white drop-shadow-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis tracking-wide">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}
