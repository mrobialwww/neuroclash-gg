interface LeaderboardTableHeaderProps {
  columns: { label: string; align?: "left" | "center" | "right" }[];
}

export function LeaderboardTableHeader({ columns }: LeaderboardTableHeaderProps) {
  const alignMap = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className="grid grid-cols-[80px_minmax(160px,1fr)_140px_140px] items-center gap-4 px-6 py-3 mb-2 rounded-lg bg-[#323C6D]"
    >
      {columns.map((col, i) => (
        <span
          key={i}
          className="text-white text-sm md:text-base font-bold tracking-wide text-center"
        >
          {col.label}
        </span>
      ))}
    </div>
  );
}
