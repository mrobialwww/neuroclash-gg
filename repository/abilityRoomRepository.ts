import { createClient } from "@/lib/supabase/client";

export const abilityRoomRepository = {
  /**
   * Insert ability room berdasarkan total pemain
   * dan sekaligus ambil abilities tersebut untuk ditampilkan di daftar ability starbox
   */
  async initialAbilites(gameRoomId: string, totalPlayer: number, shouldResetDb: boolean = false) {
    const supabase = createClient();
    console.log(`ngeluuu ${shouldResetDb}`);
    if (shouldResetDb) {
      const initialAbilities = [
        {
          game_room_id: gameRoomId,
          ability_id: "1",
          stock: Math.ceil((20 / 100) * Math.ceil(totalPlayer + totalPlayer / 5)),
        },
        {
          game_room_id: gameRoomId,
          ability_id: "2",
          stock: Math.ceil((15 / 100) * Math.ceil(totalPlayer + totalPlayer / 5)),
        },
        {
          game_room_id: gameRoomId,
          ability_id: "3",
          stock: Math.ceil((10 / 100) * Math.ceil(totalPlayer + totalPlayer / 5)),
        },
        {
          game_room_id: gameRoomId,
          ability_id: "4",
          stock: Math.ceil((10 / 100) * Math.ceil(totalPlayer + totalPlayer / 5)),
        },
        {
          game_room_id: gameRoomId,
          ability_id: "5",
          stock: Math.ceil((10 / 100) * Math.ceil(totalPlayer + totalPlayer / 5)),
        },
        {
          game_room_id: gameRoomId,
          ability_id: "6",
          stock: Math.ceil((30 / 100) * Math.ceil(totalPlayer + totalPlayer / 5)),
        },
      ];

      const { error: upsertErr } = await supabase.from("ability_rooms").upsert(initialAbilities, { onConflict: "game_room_id,ability_id" });

      if (upsertErr) {
        console.error("[AbilityRoomRepo] upsert error:", upsertErr);
        throw upsertErr;
      }
    }

    const { data, error: selectErr } = await supabase
      .from("ability_rooms")
      .select("ability_id, stock, abilities!inner(name, description, image, empty_image)")
      .eq("game_room_id", gameRoomId)
      .order("ability_id", { ascending: true });

    if (selectErr) {
      console.error("[AbilityRoomRepo] get error:", selectErr);
      throw selectErr;
    }

    return data;
  },

  /**
   * User melihat daftar ability di starbox
   */
  // async getAbilityRoom(gameRoomId: string) {
  //   const supabase = await createClient();

  //   const { data, error } = await supabase
  //     .from("ability_rooms")
  //     .select("ability_id, stock, abilities!inner(name, description, image, empty_image)")
  //     .eq("game_room_id", gameRoomId)
  //     .order("ability_id", { ascending: true });

  //   if (error) {
  //     console.error("[AbilityRoomRepo] Error:", error.message);
  //     return;
  //   }

  //   return data;
  // },

  /**
   * User menggunakan item yg dimiliki
   * Update/delete ability pemain yg dimiliki menggunakan transaction
   */
  async getPlayerHealth(userId: string, roomId: string): Promise<number> {
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
  async deleteAbilityRoom(roomId: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("game_players").delete().eq("game_room_id", roomId);

    if (error) {
      console.error("[GamePlayerRepo] deletePlayers error:", error);
      throw error;
    }
  },
};
