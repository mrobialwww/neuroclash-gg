/**
 * GET /api/game-rooms/[game_room_id]
 * http://localhost:3000/api/game-rooms/c733983d-b3ad-416c-b35a-0812eca80588
 *
 * Fungsi:
 *   1. Mendapatkan suatu baris record dari tabel game_rooms berdasarkan game_room_id
 *   2. Tujuan utamanya ketika user/creator game ingin mendapatkan detail spesifik sebuah room game
 */

/**
 * PATCH /api/game-rooms/[game_room_id]
 * http://localhost:3000/api/game-rooms/c733983d-b3ad-416c-b35a-0812eca80588
 *
 * Body:
 *   {
 *     "room_status": "ongoing",
 *     "room_visibility": "private"
 *   }
 *
 * Fungsi:
 *   1. Mengupdate tabel game_rooms (rooms_status dan room_visibility) berdasarkan game_room_id
 *   2. Tujuan utamanya adalah ketika quiz/game ada di beberapa kondisi
 *      a. Creator game menekan tombol mulai maka room_status akan diupdate menjadi "open"
 *      b. Creator game menekan tombol finish maka room_status akan diupdate menjadi "ongoing"
 *      c. Creator game mengganti quiz/game yg awalnya dari private menjadi public atau sebaliknya
 */

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
