import { createClient } from "@/lib/supabase/client";

export const abilityPlayerRepository = {
  /**
   * User memilih item di starbox
   * Insert ability pemain sesuai yg dipilih di starbox menggunakan transaction
   */
  async insertPlayerAbility(gameRoomId: string, abilityId: string, userId: string) {
    const supabase = createClient();

    const { data, error } = await supabase.rpc("increment_ability", {
      p_game_room_id: gameRoomId,
      p_ability_id: Number(abilityId),
      p_user_id: userId,
    });

    if (error) {
      console.error("[AbilityPlayerRepo] insertPlayerAbility error:", error);
      throw error;
    }

    return data;
  },

  /**
   * User menggunakan item yg dimiliki
   * Update/delete ability pemain yg dimiliki menggunakan transaction
   */
  async updatePlayerAbility(userId: string, roomId: string): Promise<number> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("game_players").select("health").eq("game_room_id", roomId).eq("user_id", userId).single();

    if (error) {
      console.error("[GamePlayerRepo] getPlayerHealth error:", error);
      return 100;
    }

    return data?.health ?? 100;
  },

  /**
   * Delete semua pemain di room saat match selesai
   */
  async deletePlayers(roomId: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("game_players").delete().eq("game_room_id", roomId);

    if (error) {
      console.error("[GamePlayerRepo] deletePlayers error:", error);
      throw error;
    }
  },
};
