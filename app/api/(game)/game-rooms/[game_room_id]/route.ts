// GET /api/game/game-rooms/[game_room_id]
// - Mendapatkan detail spesifik sebuah room (biasanya untuk room master)

// PATCH /api/game/game-rooms/[game_room_id]
// - room_status akan diupdate mengikuti pembuat game menekan tombol mulai dan finish
// - room_visibility akan diupdate ketika pembuat game merubah statusnya dari public ke privat atau sebaliknya

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ game_room_id: string }> }) {
  try {
    const supabase = await createClient();

    const { game_room_id } = await params;

    const { data, error } = await supabase.from("game_rooms").select("*").eq("game_room_id", game_room_id);

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ game_room_id: string }> }) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const { game_room_id } = await params;

    const updatePayload: Record<string, any> = {};

    if (body.room_visibility) {
      updatePayload.room_visibility = body.room_visibility;
    }

    if (body.room_status) {
      updatePayload.room_status = body.room_status;
    }

    const { data, error } = await supabase.from("game_rooms").update(updatePayload).eq("game_room_id", game_room_id).select();

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
