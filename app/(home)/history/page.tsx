"use client";

import { StatisticCard } from "@/components/history/StatisticCard";
import { HistoryTable } from "@/components/history/HistoryTable";

export default function HistoryPage() {
  const stats = [
    {
      label: "Total Pertandingan",
      value: "47",
      iconPath: "/icons/sword.svg",
    },
    {
      label: "Win Rate",
      value: "62.03%",
      iconPath: "/icons/percent.svg",
    },
    {
      label: "Peringkat Rata-rata",
      value: "4.94",
      iconPath: "/icons/chart.svg",
    },
    {
      label: "Peringkat 1",
      value: "25",
      iconPath: "/icons/trophy.svg",
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 pb-20 md:px-12 lg:px-16">
      <h2 className="mb-4 text-2xl font-bold text-[#555555] md:text-3xl">
        Statistik Pertandingan
      </h2>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatisticCard
            key={index}
            label={stat.label}
            value={stat.value}
            iconPath={stat.iconPath}
          />
        ))}
      </div>

      <h2 className="mb-4 text-2xl font-bold text-[#555555] md:text-3xl">
        Riwayat Pertandingan
      </h2>

      <HistoryTable />
    </main>
  );
}
