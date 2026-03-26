import { createClient } from "@/lib/supabase/client";

export const abilityPlayerRepository = {
  /**
   * Catat pilihan ability user ke DB via RPC `increment_ability`.
   * RPC dipakai (bukan query biasa) karena prosesnya atomik:
   * jika row sudah ada → increment `stock`, jika belum → INSERT baru.
   */
  async insertPlayerAbility(gameRoomId: string, abilityId: string, userId: string) {
    const supabase = createClient();

    const { data, error } = await supabase.rpc("increment_ability", {
      p_game_room_id: gameRoomId,
      p_ability_id: abilityId,
      p_user_id: userId,
    });

    if (error) {
      console.error("[AbilityPlayerRepo] insertPlayerAbility error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Ambil semua ability milik user dalam satu room (JOIN ke tabel abilities).
   * Dipanggil saat `initGameData` untuk hydrate `myInventory` dari DB,
   */
  async getMyAbilities(gameRoomId: string, userId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("ability_players")
      .select("ability_player_id, game_room_id, ability_id, stock, user_id, abilities!inner(name, description, image, empty_image)")
      .eq("game_room_id", gameRoomId)
      .eq("user_id", userId);

    if (error) {
      console.error("[AbilityPlayerRepo] getMyAbilities error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Memanggil fungsi supabse rpc untuk mekanisme menggunakan ability heal
   */
  async userHealAbility(roomId: string, userId: string) {
    const supabase = createClient();

    const { error } = await supabase.rpc("use_healing_potion", {
      p_game_room_id: roomId,
      p_user_id: userId,
    });

    if (error) {
      console.error("[AbilityPlayerRepo] insertPlayerAbility error:", error);
      throw error;
    }
  },

  /**
   * Hapus SEMUA ability seluruh pemain dalam satu room.
   * Dipanggil saat game selesai untuk membersihkan data.
   */
  async deletePlayers(roomId: string) {
    const supabase = createClient();

    const { error } = await supabase.from("ability_players").delete().eq("game_room_id", roomId);

    if (error) {
      console.error("[AbilityPlayerRepo] deletePlayers error:", error);
      throw error;
    }
  },
};
