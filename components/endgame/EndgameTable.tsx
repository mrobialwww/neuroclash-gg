import React from "react";
import { EndgameTableRow, EndgamePlayer } from "./EndgameTableRow";

interface EndgameTableProps {
  players: EndgamePlayer[];
  currentUserId?: string;
}

export function EndgameTable({ players, currentUserId }: EndgameTableProps) {
  // Define columns for the header
  const columns = [
    { label: "Peringkat" },
    { label: "Pemain" },
    { label: "Waktu Bermain" },
    { label: "Hasil" },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#211D56] p-4 sm:p-6 shadow-xl overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="min-w-[700px]">
          {/* Table Header */}
          <div className="grid grid-cols-[80px_minmax(140px,1fr)_140px_140px] items-center gap-4 px-6 py-3 mb-2 rounded-lg bg-[#323C6D]">
            {columns.map((col, i) => (
              <span
                key={i}
                className="text-white text-sm md:text-base font-bold tracking-wide text-center"
              >
                {col.label}
              </span>
            ))}
          </div>

          {/* Table Body */}
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <EndgameTableRow
                key={player.id}
                player={player}
                isMe={player.id === currentUserId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
