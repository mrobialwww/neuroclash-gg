/**
 * GET /api/characters?skin_level=[skin_level]&user_id=[user_id]
 * http://localhost:3000/api/characters?skin_level=epic&user_id=c307f9dc-482f-4442-b566-97dbc258c0e8
 *
 * Fungsi:
 *   1. Mendapatkan suatu baris record dari tabel characters berdasarkan enum skin_level (default,
 *      epic, legend) dan user_id
 *   2. Tujuan utamanya ketika user pergi ke toko untuk mencari character/skin (berdasarkan
 *      skin_level) maka akan menampilkan daftar character/skin yg belum/sudah dibeli
 *   3. Tingkatan skin_level yakni character = default, skin = epic/legend
 *   4. Menggunakan left join
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);

    const user_id = searchParams.get("user_id");
    const skin_level = searchParams.get("skin_level");

    console.log(user_id);
    console.log(skin_level);

    const { data, error } = await supabase
      .from("characters")
      .select("*, user_characters(user_id, is_used)")
      .eq("user_characters.user_id", user_id)
      .eq("skin_level", skin_level);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
