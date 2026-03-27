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

    // Menggunakan logika dari playerElimination, namun menggunakan server client untuk keamanan SSR
    const { data: abilities } = await supabase
      .from("ability_players")
      .select("ability_id, stock")
      .eq("game_room_id", game_room_id)
      .eq("user_id", body.user_id);

    let finalTrophy = Number(body.trophy_won);
    let finalCoin = Number(body.coins_earned);

    if (abilities) {
      const ability5 = abilities.find((a) => a.ability_id === 5); // PIALA KEJAYAAN
      if (ability5) {
        finalTrophy += Math.floor((finalTrophy * 5) / 100) * ability5.stock;
      }
      const ability6 = abilities.find((a) => a.ability_id === 6); // KANTONG HARTA
      if (ability6) {
        finalCoin += Math.floor((finalCoin * 5) / 100) * ability6.stock;
      }
    }

    // 1. Update ke tabel user_games
    const win = body.win || 0;
    const lose = body.lose || 0;
    const { error: ugError } = await supabase
      .from("user_games")
      .update({
        trophy_won: Math.round(finalTrophy),
        coins_earned: Math.round(finalCoin),
        win: win,
        lose: lose,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", body.user_id)
      .eq("game_room_id", game_room_id);

    if (ugError) {
      console.error("Gagal mengupdate user_games:", ugError);
      return NextResponse.json(
        { error: `Gagal mengupdate user_games: ${ugError.message}` },
        { status: 400 }
      );
    }

    // 2. Ambil data current state dari tabel users
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("total_trophy, coin, total_match, total_rank_1")
      .eq("user_id", body.user_id)
      .single();

    if (fetchError || !userData) {
      console.error("Gagal mengambil data user:", fetchError);
      return NextResponse.json(
        { error: `Gagal mengambil data user: ${fetchError?.message}` },
        { status: 400 }
      );
    }

    // 3. Update ke tabel users
    const newTotalTrophy =
      (userData.total_trophy || 0) + Math.round(finalTrophy);
    const newTotalCoin = (userData.coin || 0) + Math.round(finalCoin);
    const newTotalMatch = (userData.total_match || 0) + 1;
    const newTotalRank1 =
      (userData.total_rank_1 || 0) + (body.placement === 1 ? 1 : 0);

    const { error: uError } = await supabase
      .from("users")
      .update({
        total_trophy: newTotalTrophy,
        coin: newTotalCoin,
        total_match: newTotalMatch,
        total_rank_1: newTotalRank1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", body.user_id);

    if (uError) {
      console.error("Gagal mengupdate users:", uError);
      return NextResponse.json(
        { error: `Gagal mengupdate users: ${uError.message}` },
        { status: 400 }
      );
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
