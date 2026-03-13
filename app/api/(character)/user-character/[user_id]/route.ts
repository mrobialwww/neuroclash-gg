// GET /api/user-character/[user_id]
// - mengambil karakter yang dimiliki user_id dengan semua skin_level
// - menggunakan inner join dengan character untuk mengambil detail karakter
//
// GET /api/user-character/[user_id]?is_used=true
// - mengambil karakter yg dimiliki user_id dan is_used = true
// - terdapat 2 .eq, pertama untuk filter user_id dan kedua untuk is_used = true
// - menggunakan inner join dengan character

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = await params;
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const is_used = searchParams.get("is_used");

    // Convert string ke boolean
    const is_used_bool = is_used === "true" ? true : is_used === "false" ? false : undefined;

    let query = supabase.from("characters").select("*, user_characters!inner(user_id, is_used)").eq("user_characters.user_id", user_id);

    if (is_used_bool) {
      query = query.eq("user_characters.is_used", is_used_bool);
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
