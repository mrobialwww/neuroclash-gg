import { createClient } from "@/lib/supabase/client";

export const abilityRoomRepository = {
  /**
   * Insert ability room berdasarkan total pemain
   * dan sekaligus ambil abilities tersebut untuk ditampilkan di daftar ability starbox
   */
  async initialAbilites(
    gameRoomId: string,
    totalPlayer: number,
    shouldResetDb: boolean = false
  ) {
    const supabase = createClient();
    if (shouldResetDb) {
      const totalItems = totalPlayer + Math.ceil(totalPlayer / 5);
      const percentages = [
        { id: "1", pct: 15 },
        { id: "2", pct: 10 },
        { id: "3", pct: 10 },
        { id: "4", pct: 20 },
        { id: "5", pct: 30 },
        { id: "6", pct: 10 },
      ];

      const initialAbilitiesTemp = percentages.map((p) => {
        const exact = (p.pct / 100) * totalItems;
        const base = Math.floor(exact);
        return {
          game_room_id: gameRoomId,
          ability_id: p.id,
          exact,
          stock: base,
          remainder: exact - base,
        };
      });

      let remaining =
        totalItems - initialAbilitiesTemp.reduce((sum, a) => sum + a.stock, 0);

      // Distribute remaining based on largest remainder
      initialAbilitiesTemp.sort((a, b) => b.remainder - a.remainder);
      let idx = 0;
      while (remaining > 0) {
        initialAbilitiesTemp[idx % initialAbilitiesTemp.length].stock += 1;
        remaining -= 1;
        idx += 1;
      }

      const initialAbilities = initialAbilitiesTemp
        .sort((a, b) => Number(a.ability_id) - Number(b.ability_id))
        .map((a) => ({
          game_room_id: a.game_room_id,
          ability_id: a.ability_id,
          stock: a.stock,
        }));

      const { error: upsertErr } = await supabase
        .from("ability_rooms")
        .upsert(initialAbilities, { onConflict: "game_room_id,ability_id" });

      if (upsertErr) {
        console.error("[AbilityRoomRepo] upsert error:", upsertErr);
        throw upsertErr;
      }
    }

    const { data, error: selectErr } = await supabase
      .from("ability_rooms")
      .select(
        "ability_id, stock, updated_at, abilities!inner(name, description, image, empty_image)"
      )
      .eq("game_room_id", gameRoomId)
      .order("ability_id", { ascending: true });

    if (selectErr) {
      console.error("[AbilityRoomRepo] get error:", selectErr);
      throw selectErr;
    }

    return data;
  },

  /**
   * Delete semua pemain di room saat match selesai
   */
  async deleteRoomAbility(roomId: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("ability_rooms")
      .delete()
      .eq("game_room_id", roomId);

    if (error) {
      console.error("[AbilityRoomRepo] deletePlayers error:", error);
      throw error;
    }
  },
};
