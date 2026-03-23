// GET /api/user-game/participants/[game_room_id]
// - pembuat game ingin melihat siapa saja partisipan dari game yang dibuatnya dengan menggunakan game_room_id

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ game_room_id: string }> }
) {
  try {
    const supabase = await createClient();

    const { game_room_id } = await params;

    const { data, error } = await supabase
      .from("user_games")
      .select("*")
      .eq("game_room_id", game_room_id);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
