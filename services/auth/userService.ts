export const userService = {
  async getNavbarData(userId: string) {
    if (!userId) return null;

    try {
      let data;
      // If we are in the browser, we must fetch from API to avoid server-only dependencies
      if (typeof window !== "undefined") {
        const res = await fetch(`/api/users/${userId}`, { cache: "no-store" });
        if (!res.ok) return null;
        const result = await res.json();
        // The API returns data as an array
        data = Array.isArray(result.data) ? result.data[0] : result.data;

        // Since the current API doesn't return user_characters, we might need a separate call
        // but for now we follow the logic and let it fallback to default if missing
      } else {
        // Safe only in Server Components - use dynamic import to avoid bundling on client
        const { userRepository } = await import("@/repository/userRepository");
        data = await userRepository.getUserWithActiveCharacter(userId);
      }

      if (!data) return null;

      // Mapping karakter
      const userChars = data.user_characters;
      const activeChar = Array.isArray(userChars)
        ? userChars.find((uc: any) => uc.is_used)?.characters
        : null;

      return {
        username: data.username || "Guest",
        coins: data.coin || 0,
        avatar: activeChar?.image_url || "/default/Slime.webp",
      };
    } catch (error) {
      console.error("[Service] Critical Error:", error);
      return null;
    }
  },

  async getDashboardData(userId: string) {
    try {
      // Safe only in Server Components - use dynamic import to avoid bundling on client
      const { userRepository } = await import("@/repository/userRepository");
      const { rankRepository } = await import("@/repository/rankRepository");

      const user = await userRepository.getUserWithActiveCharacter(userId);
      if (!user) return null;

      const rank = await rankRepository.getRankByTrophy(user.total_trophy || 0);

      return {
        username: user.username,
        coins: user.coin,
        trophy: user.total_trophy,
        rankName: rank?.name || "Bronze",
        rankImageUrl: rank?.image_url || "/rank/bronze.webp",
        avatar:
          user.user_characters?.[0]?.characters?.image_url ||
          "/default/Slime.webp",
      };
    } catch (error) {
      return null;
    }
  },
};
