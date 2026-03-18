// GET /api/game-rooms/code/[room_code]
// - user ingin mencari room spesifik dengan code tertentu

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ room_code: string }> }) {
  try {
    const supabase = await createClient();

    const { room_code } = await params;

    const { data, error } = await supabase.from("game_rooms").select("*").eq("room_code", room_code);

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
