/**
 * POST /api/user-character
 * http://localhost:3000/api/user-character
 *
 * Body:
 *   {
 *     "user_id": "c307f9dc-482f-4442-b566-97dbc258c0e8",
 *     "character_id": 2,
 *     "cost": 7500,
 *     "base_character": "Slime",
 *     "skin_level": "epic"
 *   }
 *
 * Fungsi:
 *   1. Menambahkan suatu baris record baru ke tabel user_characters dan sekaligus melakukan
 *      update tabel users menggunakan transactions
 *   2. Tujuan utamanya ketika ingin user ingin membeli suatu skin, maka akan dicek terlebih dahulu
 *      apakah user memiliki skin dengan skin_level = default terlebih dahulu?
 *      a. Jika iya maka skin yg baru dibeli akan dimasukkan ke tabel user_characters dan
 *         tabel users akan diupdate dengan mengurangi coin = coin - cost skin
 *      b. Jika tidak maka user tidak diperkenankan untuk membeli dan menambahkan skin
 *         yang bersangkutan ke dalam tabel user_characters
 */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const { user_id, character_id, cost, coin, base_character, skin_level } = body;

    if (cost > coin) {
      return NextResponse.json({ error: "Coin tidak mencukupi untuk membeli item ini" }, { status: 400 });
    }

    // Memanggil fungsi transaksi (RPC) di Supabase
    const { error } = await supabase.rpc("handle_buy_item", {
      p_user_id: user_id,
      p_character_id: character_id,
      p_cost: cost,
      p_base_character: base_character,
      p_skin_level: skin_level,
    });

    if (error) {
      console.error("Gagal membeli item:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Berhasil melakukan pembelian karakter baru",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
