/**
 * PATCH /api/user-game/submit/[game_room_id]
 * http://localhost:3000/api/user-game/c733983d-b3ad-416c-b35a-0812eca80588
 *
 * Body:
 *   {
 *     "user_id": "c307f9dc-482f-4442-b566-97dbc258c0e8",
 *     "trophy_won": 25,
 *     "coins_earned": 100,
 *     "placement": 1
 *   }
 *
 * Fungsi:
 *   1. Mengupdate tabel user_games (trophy_won, coins_earned, updated_at) dan tabel users
 *      (total_trophy, coin, total_match, placement_ration, total_rank_1, updated_at) secara sekaligus
 *      menggunakan transaction
 *   2. Tujuan utamanya ketika user telah menyelesaikan game/quiz dan mendapatkan statistik nya di
 *      akhir game/quiz tersebut lalu mengkalkulasikannya dengan statistik di tabel user
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ game_room_id: string }> }
) {
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
