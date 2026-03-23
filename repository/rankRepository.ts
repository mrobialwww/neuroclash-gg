export const rankRepository = {
  async getRankByTrophy(trophy: number) {
    // Dynamic import to avoid bundling server-only supabase/server on the client
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ranks")
      .select("*")
      .lte("min_trophy", trophy)
      .gte("max_trophy", trophy)
      .order("min_trophy", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[RankRepo] Error:", error.message);
      return null;
    }

    return data;
  },
};
