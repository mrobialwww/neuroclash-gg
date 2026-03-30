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
      <main className="mx-auto max-w-[1400px] px-6 py-10 pb-20 md:px-12 lg:px-16 animate-pulse">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Statistik Pertandingan
        </h2>

        <div className="mb-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex min-h-[90px] md:min-h-[120px] flex-col justify-between rounded-xl bg-white/5 p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="h-4 w-24 rounded bg-white/10 md:h-5 md:w-32" />
                <div className="h-8 w-8 rounded bg-white/10 md:h-10 md:w-10" />
              </div>
              <div className="mt-2 h-8 w-16 rounded bg-white/10 md:mt-auto md:h-12 md:w-24" />
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Riwayat Pertandingan
        </h2>

        <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-white/5">
          <div className="h-12 w-full bg-white/10" />
          <div className="divide-y divide-white/5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex h-[72px] items-center px-6 gap-8">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 shrink-0" />
                <div className="hidden md:block h-5 w-16 bg-white/10 rounded" />
                <div className="hidden lg:block h-5 w-20 bg-white/10 rounded" />
                <div className="h-5 flex-1 bg-white/10 rounded" />
                <div className="hidden sm:block h-5 w-24 bg-white/10 rounded" />
                <div className="h-5 w-8 bg-white/10 rounded" />
                <div className="h-5 w-8 bg-white/10 rounded" />
                <div className="h-5 w-16 bg-white/10 rounded" />
                <div className="h-5 w-16 bg-white/10 rounded" />
              </div>
            ))}
          </div>
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
