// GET /api/game/user-game/history/[user_id]
// - user ingin menggunakan user_id nya untuk mencari riwayat game nya

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
  try {
    const supabase = await createClient();

    const { user_id } = await params;

    const { data, error } = await supabase.from("user_games").select("*").eq("user_id", user_id);

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
