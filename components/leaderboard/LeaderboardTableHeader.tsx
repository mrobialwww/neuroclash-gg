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
      className="grid items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 grid-cols-[80px_1fr_120px_80px] md:grid-cols-[120px_1fr_180px_120px] border-[0.5px] border-white/50 mb-2"
      style={{ background: "#D9D9D933" }}
    >
      {columns.map((col, i) => (
        <span
          key={i}
          className="text-white text-md md:text-lg font-semibold tracking-wider text-center"
        >
          {col.label}
        </span>
      ))}
    </div>
  );
}
