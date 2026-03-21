/**
 * POST /api/user-game/join/[game_room_id]
 * http://localhost:3000/api/user-game/join/c733983d-b3ad-416c-b35a-0812eca80588
 *
 * Body:
 *   {
 *     "user_id": "c307f9dc-482f-4442-b566-97dbc258c0e8"
 *   }
 *
 * Fungsi:
 *   1. Menambahkan data baris record baru ke tabel user_games
 *   2. Tujuan utamanya ketika user menekan join room game/quiz maka otomatis akan ditambahkan
 *      ke dalam tabel user_games user_id dan game_room_id nya
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ game_room_id: string }> }) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const { game_room_id } = await params;

    const payloadData = {
      game_room_id: game_room_id,
      user_id: body.user_id,
    };
    const { data, error } = await supabase.from("user_games").insert(payloadData).select();

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
