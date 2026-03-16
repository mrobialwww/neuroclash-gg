// GET /api/characters/?user_id=[user_id]
// - mengambil katalog default karakter
// - jika user_id diberikan, maka menandai karakter mana yang dimiliki oleh user (left join ke user_character)
// - hanya ada .eq untuk filter user_id (di user_character)
// - menggunakan left join (!left) agar semua karakter tetap muncul

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);

    const user_id = searchParams.get("user_id");
    const skin_level = searchParams.get("skin_level");

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
