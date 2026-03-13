// POST /api/game/user-game/[game_room_id]
// - dilakukan ketika user menekan join room game

// PATCH /api/game/user-game/[game_room_id]
// - setelah user menyelesaikan game, maka update atribute di:
//   Table user (total_trophy, coin, total_match, placement_ration, total_rank_1, updated_at)
//   Table user-game (status, trophy_won, coins_earned, updated_at)
//   (bisa diatur lewat trigger)

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { game_room_id: string } }) {
  try {
    const body = await request.json();

    // Inisialisasi Supabase client (jika menggunakan SSR/Server Actions)
    const supabase = await createClient();

    // Memanggil fungsi transaksi (RPC) di Supabase
    const { error } = await supabase.rpc("submit_game_result", {
      p_user_id: body.user_id, // dari payload (body)
      p_game_room_id: params.game_room_id, // dari URL (params)
      p_trophy_won: body.trophy_won, // dari payload (body)
      p_coins_earned: body.coins_earned, // dari payload (body)
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      throw error;
    }

    return NextResponse.json({
      message: "Berhasil mengupdate status game dan statistik pemain",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
