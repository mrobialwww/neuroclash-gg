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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const offset = (page - 1) * limit;

    const {
      data: userGamesData,
      error: userGamesError,
      count,
    } = await supabase
      .from("user_games")
      .select("*", { count: "exact" })
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userGamesError) {
      console.error("Supabase Error (user_games):", userGamesError);
      throw userGamesError;
    }

    if (!userGamesData || userGamesData.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          total: count ?? 0,
          page,
          limit,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      });
    }

    // Manual fetch game_rooms karena relasi missing di Supabase Schema
    const roomIds = userGamesData.map((ug) => ug.game_room_id);
    const { data: roomsData, error: roomsError } = await supabase
      .from("game_rooms")
      .select("game_room_id, title, category")
      .in("game_room_id", roomIds);

    if (roomsError) {
      console.error("Supabase Error (game_rooms):", roomsError);
      throw roomsError;
    }

    // Merge data
    const combinedData = userGamesData.map((ug) => ({
      ...ug,
      game_rooms: roomsData.find((r) => r.game_room_id === ug.game_room_id) || {
        title: "Unknown Match",
        category: "General",
      },
    }));

    return NextResponse.json({
      data: combinedData,
      pagination: {
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
