// POST /api/game/user-game/[game_room_id]
// - dilakukan ketika user menekan join room game

// PATCH /api/game/user-game/[game_room_id]
// - setelah user menyelesaikan game, maka update atribute di:
//   Table user (total_trophy, coin, total_match, placement_ration, total_rank_1, updated_at)
//   Table user-game (status, trophy_won, coins_earned, updated_at)
//   (bisa diatur lewat trigger)

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

export async function PATCH(request: Request, { params }: { params: Promise<{ game_room_id: string }> }) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const { game_room_id } = await params;

    // Memanggil fungsi transaksi (RPC) di Supabase
    const { error } = await supabase.rpc("submit_game_result", {
      p_user_id: body.user_id,
      p_game_room_id: game_room_id,
      p_trophy_won: body.trophy_won,
      p_coins_earned: body.coins_earned,
      p_placement: body.placement, // Peringkat akhir pemain (misal: 5)
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Berhasil mengupdate statistik pemain",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
