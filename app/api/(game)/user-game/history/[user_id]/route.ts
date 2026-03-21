/**
 * GET /api/user-game/history/[user_id]
 * http://localhost:3000/api/user-game/history/c307f9dc-482f-4442-b566-97dbc258c0e8
 *
 * Fungsi:
 *   1. Mendapatkan list dari tabel user_games berdasarkan user_id
 *   2. Tujuan utamanya ketika user ingin mencari daftar game/quiz apa saja yg pernah diikuti
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const supabase = await createClient();

    const { user_id } = await params;

    const { data, error } = await supabase
      .from("user_games")
      .select("*")
      .eq("user_id", user_id);

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
