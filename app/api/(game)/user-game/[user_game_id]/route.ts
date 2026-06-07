/**
 * GET /api/user-game/[user_game_id]
 * http://localhost:3000/api/user-game/48647dcc-b3ab-4830-a28a-a171eebb13ce
 *
 * Fungsi:
 *   1. Mendapatkan suatu baris record dari tabel user_game berdasarkan user_game_id dan list dari
 *      tabel questions dan answer
 *   2. Tujuan utamanya ketika user ingin melihat detail riwayat suatu game/quiz yg pernah diikuti
 *   3. Return nya berisi statistik akhir dari sebuah quiz/game, Menampilkan riwayat soal beserta hasil
 *      jawabannya untuk setiap soal dalam game
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ user_game_id: string }> }) {
  try {
    const supabase = await createClient();

    const { user_game_id } = await params;

    const { data: summary, error: summaryErr } = await supabase.from("user_games").select("*").eq("user_game_id", user_game_id).single();

    if (summaryErr) {
      console.error("Supabase Error pengembalian user_games:", summaryErr);
      throw summaryErr;
    }
    const { data: historyAnswer, error: historyAnswerErr } = await supabase
      .from("answers")
      .select("*, questions!inner(*), user_answers!inner(*)")
      .eq("questions.game_room_id", summary.game_room_id)
      .eq("user_answers.user_id", summary.user_id);

    if (historyAnswerErr) {
      console.error("Supabase Error pengembalian history:", historyAnswerErr);
      throw historyAnswerErr;
    }

    return NextResponse.json({ summary, historyAnswer });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
