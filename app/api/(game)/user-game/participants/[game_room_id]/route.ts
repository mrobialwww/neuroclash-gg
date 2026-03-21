/**
 * GET /api/user-game/participants/[game_room_id]
 * http://localhost:3000/api/user-game/participants/c733983d-b3ad-416c-b35a-0812eca80588
 *
 * Fungsi:
 *   1. Mendapatkan list user_game berdasarkan game_room_id
 *   2. Tujuan utamanya ketika creator game/quiz apabila ingin melihat siapa saja partisipan dari
 *      game/quiz yang dibuatnya
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ game_room_id: string }> }) {
  try {
    const supabase = await createClient();

    const { game_room_id } = await params;

    const { data, error } = await supabase.from("user_games").select("*").eq("game_room_id", game_room_id);

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
