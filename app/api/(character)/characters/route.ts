// GET /api/characters
// - mengambil katalog semua karakter beserta skin
// - Optional: jika user_id diberikan, bisa filter untuk skin_level tertentu
// - menggunakan left join untuk menampilkan semua karakter (baik dimiliki atau belum)

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const skin_level = searchParams.get("skin_level");

    // Base query: select semua characters dengan optional user relation
    let query = supabase
      .from("characters")
      .select("*, user_characters(user_id, is_used)");

    // Optional filter untuk skin_level
    if (skin_level) {
      query = query.eq("skin_level", skin_level);
    }

    const { data, error } = await query;

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

