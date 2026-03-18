// POST /api/user-game/[game_room_id]
// - dilakukan ketika user menekan join room game

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
