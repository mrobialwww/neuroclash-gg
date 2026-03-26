import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";

export const metadata = {
  title: "Papan Peringkat | Neuroclash.gg",
  description: "Lihat peringkat pemain terbaik berdasarkan total trophy Neuroclash.",
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
