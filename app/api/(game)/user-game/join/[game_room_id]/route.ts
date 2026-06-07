/**
 * POST /api/user-game/join/[game_room_id]
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getWIBNow } from "@/lib/utils/dateUtils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ game_room_id: string }> }
) {
  console.log("\n" + "=".repeat(80));
  console.log("[JOIN] START DEBUG");
  console.log("=".repeat(80));

  try {
    const supabase = await createClient();

    const { game_room_id } = await params;

    console.log(`[JOIN] game_room_id: ${game_room_id}`);

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { user_id } = requestBody;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    console.log(`[JOIN] user_id: ${user_id}`);

    const { data: roomCheck, error: roomCheckError } = await supabase
      .from("game_rooms")
      .select("game_room_id, room_code, room_status, max_player, category")
      .eq("game_room_id", game_room_id)
      .maybeSingle();

    if (roomCheckError || !roomCheck) {
      console.error("[JOIN] ❌ Room not found:", roomCheckError);
      return NextResponse.json(
        { error: "Room not found", debug: roomCheckError },
        { status: 404 }
      );
    }

    console.log(
      `[JOIN] ✅ Room found: ${roomCheck.room_code}, category: ${roomCheck.category}`
    );

    const { data: existingJoin, error: existingJoinError } = await supabase
      .from("user_games")
      .select("user_game_id")
      .eq("game_room_id", game_room_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existingJoinError && existingJoinError.code !== "PGRST116") {
      console.error("[JOIN] Error checking existing join:", existingJoinError);
    }

    if (existingJoin) {
      console.log("[JOIN] ⚠️ User already joined");
      return NextResponse.json(
        {
          error: "User already joined this room",
          user_game_id: existingJoin.user_game_id,
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("user_games")
      .insert({
        game_room_id: game_room_id,
        user_id: user_id,
        created_at: getWIBNow(),
      })
      .select()
      .single();

    if (error) {
      console.error("[JOIN] ❌ Insert error:", error);
      return NextResponse.json(
        {
          error: "Failed to join room",
          debug: {
            error_code: error.code,
            error_message: error.message,
          },
        },
        { status: 500 }
      );
    }

    console.log("[JOIN] ✅ SUCCESS - User joined room");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ data });
  } catch (error) {
    console.error("\n[JOIN] ❌ FINAL ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        debug: {
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}
