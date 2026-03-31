import { createClient } from "@/lib/supabase/client";

export const abilityPlayerRepository = {
  /**
   * Catat pilihan ability user ke DB via RPC `increment_ability`.
   * RPC dipakai (bukan query biasa) karena prosesnya atomik:
   * jika row sudah ada → increment `stock`, jika belum → INSERT baru.
   */
  async insertPlayerAbility(
    gameRoomId: string,
    abilityId: string,
    userId: string
  ) {
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
   * Ambil semua ability milik user dalam satu room (JOIN ke tabel abilities).
   * Dipanggil saat `initGameData` untuk hydrate `myInventory` dari DB,
   */
  async getMyAbilities(gameRoomId: string, userId: string) {
    const supabase = createClient();

    const { data: abilityPlayers, error: apError } = await supabase
      .from("ability_players")
      .select(
        `
      ability_player_id,
      game_room_id,
      ability_id,
      stock,
      user_id,
      abilities(name, description, image, empty_image)
    `
      )
      .eq("game_room_id", gameRoomId)
      .eq("user_id", userId);

    if (apError) {
      console.error("[AbilityPlayerRepo] getMyAbilities error:", apError);
      throw apError;
    }
    const { data: materials, error: amError } = await supabase
      .from("ability_materials")
      .select("ability_materi_id, title, content")
      .eq("game_room_id", gameRoomId);

    if (amError) {
      console.error(
        "[AbilityPlayerRepo] getMyAbilities material error:",
        amError
      );
      throw amError;
    }

    // Gabungkan semua material menjadi satu objek untuk ditampilkan di overlay.
    // ability_materials bisa punya banyak row per room (1 per topik dari AI).
    const combinedMaterial: {
      ability_materi_id: string;
      title: string;
      content: string;
    } | null =
      materials && materials.length > 0
        ? {
            ability_materi_id: materials[0].ability_materi_id,
            title: materials.map((m) => m.title).join(" | "),
            content: materials.map((m) => m.content).join("\n\n---\n\n"),
          }
        : null;

    return (abilityPlayers ?? []).map((row) => ({
      ...row,
      // Hanya lampirkan material ke ability_id === 1 (tipe Materi/Kitab Pengetahuan)
      ability_materials: row.ability_id === 1 ? combinedMaterial : null,
    }));
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
   * Menggunkaan ability Attack atua Shield
   */
  async userAttackorShieldAbility(
    roomId: string,
    userId: string,
    abilityId: number,
    supabaseClient?: any
  ) {
    const supabase = supabaseClient || createClient();

    const { error } = await supabase.rpc("use_attack_shield_ability", {
      p_game_room_id: roomId,
      p_user_id: userId,
      p_ability_id: abilityId,
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
  async deletePlayersAbilities(roomId: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("ability_players")
      .delete()
      .eq("game_room_id", roomId);

    if (error) {
      console.error("[AbilityPlayerRepo] deletePlayers error:", error);
      throw error;
    }
  },
};
