import { createClient } from "@/lib/supabase/client";

export const userClientService = {
  async getCurrentUserNavbarData() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [userRes, charRes] = await Promise.all([
        fetch(`/api/users/${user.id}`, { cache: "no-store" }),
        fetch(`/api/user-character/${user.id}?is_used=true`, { cache: "no-store" })
      ]);

      if (!userRes.ok) return null;

      const userResult = await userRes.json();
      // /api/users returns `data` as array
      const userData = Array.isArray(userResult.data) ? userResult.data[0] : userResult.data;

      // /api/user-character?is_used=true returns characters[] with user_characters joined
      // Each element is a `characters` row directly with image_url and name at root
      let characterData: { name: string; image_url: string } | null = null;
      if (charRes.ok) {
        const charResult = await charRes.json();
        const raw = charResult.data;
        characterData = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
      }

      return {
        id: user.id,
        username: userData?.username || "Guest",
        avatar: characterData?.image_url || "/default/Slime.webp",
        character: (characterData as any)?.base_character || "Slime",
      };
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }
};
