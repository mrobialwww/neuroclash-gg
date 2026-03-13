// GET /api/game/game-rooms?visibility=public&status=open
// - user ingin mencari semua daftar room dengan room_visibility "public" dan room_status "open" tersedia

// POST /api/game/game-rooms
// - pembuat game melakukan create game di awal

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const { data, error } = await supabase.from("game_rooms").select("*").eq("room_status", "open").eq("room_visibility", "public");

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const { data, error } = await supabase.from("game_rooms").insert(body).select();

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
