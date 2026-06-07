import { createClient } from "@/lib/supabase/server";

export const dashboardService = {
  async getDashboardData(userId: string) {
    const supabase = await createClient();

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("username, coin, total_trophy")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      console.error("Supabase Error fetching user:", userError);
      return null;
    }

    // Get rank based on trophy
    const { data: rank } = await supabase
      .from("ranks")
      .select("name, image_url")
      .lte("min_trophy", user.total_trophy || 0)
      .gte("max_trophy", user.total_trophy || 0)
      .maybeSingle();

    // Get user's active character
    const { data: userCharacters, error: charError } = await supabase
      .from("user_characters")
      .select("is_used, characters(name, image_url, skin_level, cost)")
      .eq("user_id", userId)
      .eq("is_used", true)
      .maybeSingle();

    let avatar = "/default/Slime.webp";
    if (userCharacters && !charError && userCharacters.characters) {
      const charArray = Array.isArray(userCharacters.characters)
        ? userCharacters.characters
        : [userCharacters.characters];
      if (charArray.length > 0) {
        avatar = charArray[0]?.image_url || "/default/Slime.webp";
      }
    }

    return {
      username: user.username,
      coins: user.coin,
      trophy: user.total_trophy,
      rankName: rank?.name || "Bronze",
      rankImageUrl: rank?.image_url || "/rank/bronze.webp",
      avatar,
    };
  },
};
