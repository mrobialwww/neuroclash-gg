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
      const calculatedTotal = totalPlayer + Math.ceil(totalPlayer / 5);
      const totalItems = Math.max(6, calculatedTotal);
      
      const percentages = [
        { id: "1", pct: 15 },
        { id: "2", pct: 15 },
        { id: "3", pct: 15 },
        { id: "4", pct: 15 },
        { id: "5", pct: 20 },
        { id: "6", pct: 20 },
      ];

      // Step 1: Give each ability at least 1 stock
      const initialAbilitiesTemp = percentages.map((p) => {
        return {
          game_room_id: gameRoomId,
          ability_id: p.id,
          stock: 1,
          pct: p.pct,
          exact_needed: (p.pct / 100) * totalItems
        };
      });

      // Step 2: Distribute the remaining stock based on percentages
      let remaining = totalItems - 6;
      
      if (remaining > 0) {
        // Calculate how many more each should get based on their pct
        const additionalStock = initialAbilitiesTemp.map(a => {
          const extra = (a.pct / 100) * totalItems - 1; // Subtract the 1 we already gave
          const baseExtra = Math.max(0, Math.floor(extra));
          return {
            ...a,
            extraStock: baseExtra,
            remainder: extra - baseExtra
          };
        });

        let secondRemaining = remaining - additionalStock.reduce((sum, a) => sum + a.extraStock, 0);
        
        // Add the base extra stock
        additionalStock.forEach((a, i) => {
          initialAbilitiesTemp[i].stock += a.extraStock;
        });

        // Distribute what's left based on largest remainders
        additionalStock.sort((a, b) => b.remainder - a.remainder);
        let idx = 0;
        while (secondRemaining > 0) {
          const abilityToGhost = additionalStock[idx % additionalStock.length];
          const mainIdx = initialAbilitiesTemp.findIndex(ia => ia.ability_id === abilityToGhost.ability_id);
          initialAbilitiesTemp[mainIdx].stock += 1;
          secondRemaining -= 1;
          idx += 1;
        }
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
