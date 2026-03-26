"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaderboardRankEntry } from "@/types";
import { LeaderboardRow } from "./LeaderboardRow";
import { LeaderboardTableHeader } from "./LeaderboardTableHeader";
import { LeaderboardBadge } from "./LeaderboardBadge";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const LIMIT = 10;

const TABLE_COLUMNS = [
  { label: "Peringkat" },
  { label: "Pemain" },
  { label: "Rank" },
  { label: "Trophy" },
];

export function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardRankEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardRankEntry | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leaderboard?page=${p}&limit=${LIMIT}`, {
        credentials: "include",
      });
      const json = await res.json();

      if (!json.success) {
        setError("Gagal memuat data leaderboard.");
        return;
      }

      setEntries(json.data ?? []);
      setMyEntry(json.myEntry ?? null);
      setTotalPages(json.pagination?.totalPages ?? 1);
      setTotal(json.pagination?.total ?? 0);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(page);
  }, [page, fetchLeaderboard]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-16">
        {/* Badge Title */}
        <div className="relative flex justify-center mb-12">
          <div className="relative w-full max-w-[480px]">
            <LeaderboardBadge title="Pemain Teratas" />
          </div>
        </div>

        {/* Main Table Container */}
        <div className="w-full">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="min-w-[700px]">
              {/* Header */}
              <LeaderboardTableHeader columns={TABLE_COLUMNS} />

              {/* Body */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-16 text-white/60 text-sm">{error}</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-16 text-white/60 text-sm">
                  Belum ada data pemain.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {entries.map((entry) => {
                    const isMe = myEntry?.user_id === entry.user_id;
                    return (
                      <LeaderboardRow key={entry.user_id} entry={entry} isMe={isMe} />
                    );
                  })}
                </div>
              )}

              {/* Divider */}
              {!loading && myEntry && (
                <div className="my-[4px]" />
              )}

              {/* My Position Row */}
              {!loading && myEntry && (
                <div>
                  {/* Show "Me" only if not already visible on current page */}
                  {!entries.some((e) => e.user_id === myEntry.user_id) && (
                    <LeaderboardRow
                      entry={myEntry.position > 0 ? myEntry : { ...myEntry, position: 0 }}
                      isMe
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-end px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="md:text-md min-w-[80px] text-center text-sm font-medium text-white">
                {page} / {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
