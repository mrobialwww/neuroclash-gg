import { rankRepository } from "@/repository/rankRepository";
import { userRepository } from "@/repository/userRepository";

export const userService = {
  async getNavbarData(userId: string) {
    if (!userId) return null;

    try {
      // Cek di Repository
      const data = await userRepository.getUserWithActiveCharacter(userId);

      if (!data) {
        // Logika Fallback
        console.warn("[Service] Falling back to basic user data...");
        return null;
      }

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
