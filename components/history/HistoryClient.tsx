"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatisticCard } from "@/components/history/StatisticCard";
import { HistoryTable } from "@/components/history/HistoryTable";
import {
  getUserGameHistory,
  calculateHistoryStats,
  type HistoryItem,
} from "@/services/quiz/historyService";

type Props = {
  userId: string;
};

export default function HistoryClient({ userId }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalMatches: 0,
    winRate: "0%",
    averageRank: "0",
    firstPlaces: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load history data ketika component mount
   */
  const loadHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const historyData = await getUserGameHistory(userId);
      setHistory(historyData);

      // Calculate stats dari history data
      const calculatedStats = calculateHistoryStats(historyData);
      setStats(calculatedStats);
    } catch (err) {
      console.error("Error loading history:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load history data"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  if (loading) {
    return (
      <main className="mx-auto max-w-[1400px] px-6 py-10 pb-20 md:px-12 lg:px-16">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Statistik Pertandingan
        </h2>
        <div className="text-center text-gray-400">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-[1400px] px-6 py-10 pb-20 md:px-12 lg:px-16">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Statistik Pertandingan
        </h2>
        <div className="text-center text-red-400">Error: {error}</div>
      </main>
    );
  }

  const statsData = [
    {
      label: "Total Pertandingan",
      value: stats.totalMatches,
      iconPath: "/icons/sword.svg",
    },
    {
      label: "Win Rate",
      value: stats.winRate,
      iconPath: "/icons/percent.svg",
    },
    {
      label: "Peringkat Rata-rata",
      value: stats.averageRank,
      iconPath: "/icons/chart.svg",
    },
    {
      label: "Peringkat 1",
      value: stats.firstPlaces,
      iconPath: "/icons/trophy.svg",
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 pb-20 md:px-12 lg:px-16">
      <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
        Statistik Pertandingan
      </h2>

      <div className="mb-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatisticCard
            key={index}
            label={stat.label}
            value={stat.value}
            iconPath={stat.iconPath}
          />
        ))}
      </div>

      <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
        Riwayat Pertandingan
      </h2>

      <HistoryTable historyData={history} />
    </main>
  );
}
