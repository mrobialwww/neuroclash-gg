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
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalMatches: 0,
    winRate: "0%",
    averageRank: "0",
    firstPlaces: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load history data ketika component mount atau page berubah
   */
  const loadHistoryData = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getUserGameHistory(userId, page);
      setHistory(result.history);
      setPagination(result.pagination);

      // Calculate stats based on ALL historical data might be expensive,
      // but for now historyService.calculateHistoryStats expects an array.
      // If the API only returns a page, we might need a separate API for stats.
      // However, the current calculateHistoryStats is used for the summary cards.
      // For now, we'll just use the first page's stats or assume we need a full fetch for stats.
      // Looking at historyService, it doesn't have a "get stats" API yet.
      // Let's stick to what we have or just use the total from pagination for "Total Pertandingan".

      const calculatedStats = calculateHistoryStats(result.history);
      setStats({
        ...calculatedStats,
        totalMatches: result.pagination.total // Use actual total from DB
      });
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
    loadHistoryData(1);
  }, [loadHistoryData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadHistoryData(newPage);
    }
  };

  if (loading && history.length === 0) {
    return (
      <main className="mx-auto max-w-[1400px] px-6 py-10 pb-20 md:px-12 lg:px-16">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Statistik Pertandingan
        </h2>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4D70E8] border-t-transparent" />
          <p className="mt-4 text-gray-400">Memuat riwayat...</p>
        </div>
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

      <HistoryTable
        historyData={history}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        isLoading={loading}
      />
    </main>
  );
}
