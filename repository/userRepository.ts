import { getWIBNow } from "@/lib/utils/dateUtils";

export const userRepository = {
  async getUserWithActiveCharacter(userId: string) {
    // Dynamic import to avoid bundling server-only supabase/server on the client
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        user_characters(
          is_used,
          characters(*)
        )
      `
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Repo] Supabase Error:", error.message);
      return null;
    }

    if (!data) {
      console.warn(`[Repo] No user found in DB for ID: ${userId}`);
      return null;
    }

    return data;
  },

  async updateUsername(userId: string, username: string) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .update({ username, updated_at: getWIBNow() })
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[Repo] Error updating username:", error.message);
      throw error;
    }

    return data;
  },
};
