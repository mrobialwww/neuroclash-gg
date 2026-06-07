import { createClient } from "@/lib/supabase/server";

export const shopRepository = {
  /**
   * Menghandle pembelian item (karakter/skin) menggunakan stored procedure (RPC) di Supabase.
   * RPC ini akan mengecek requirement koin, requirement default character, update balance,
   * dan insert ke user_characters dalam satu transaction.
   */
  async handleBuyItem(
    userId: string,
    characterId: number,
    cost: number,
    baseCharacter: string,
    skinLevel: string
  ) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("handle_buy_item", {
      p_user_id: userId,
      p_character_id: characterId,
      p_cost: cost,
      p_base_character: baseCharacter,
      p_skin_level: skinLevel,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
