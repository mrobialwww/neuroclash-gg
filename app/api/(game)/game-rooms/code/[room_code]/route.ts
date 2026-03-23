/**
 * GET /api/game-rooms/code/[room_code]
 * http://localhost:3000/api/game-rooms/code/1AGT2025
 *
 * Fungsi:
 *   1. Mendapatkan suatu baris record dari tabel game_rooms berdasarkan rome_code
 *   2. Tujuan utamanya ketika user gabung ke suatu room game dari room_code yang dimiliki
 */

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
