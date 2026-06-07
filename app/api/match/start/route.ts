/**
 * POST /api/match/start
 *
 * Body:
 *   {
 *     "game_room_id": "uuid"
 *   }
 *
 * Fungsi:
 *   1. Ambil semua pemain yang sudah join room
 *   2. Insert ke game_players dengan health 100
 *   3. Generate battle rooms untuk round 1 dan simpan ke battle_rooms
 *   4. Update game_rooms.room_status jadi 'playing'
 *   5. Return battle room untuk user saat ini
 */

import { gamePlayerRepository } from "@/repository/gamePlayerRepository";
import { roundManagementService } from "@/services/roundManagementService";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gameRoomRepository } from "@/repository/gameRoomRepository";
import { battleRoomService } from "@/services/battleRoomService";

export async function POST(request: NextRequest) {
  console.log("=".repeat(60));
  console.log("[API] POST /api/match/start START");
  console.log("=".repeat(60));

  try {
    console.log("[API] Step 0: Reading request body");
    let requestBody;

    try {
      requestBody = await request.json();
      console.log("[API] Request body:", requestBody);
    } catch (jsonError) {
      console.error("[API] Error reading request.json():", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { game_room_id } = requestBody;

    console.log(`[API] game_room_id: ${game_room_id}`);

    if (!game_room_id) {
      return NextResponse.json(
        { error: "Missing game_room_id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Ambil semua pemain yang sudah join room
    console.log("[API] Step 1: Fetching participants from user_games");
    const { data: participants, error: participantsError } = await supabase
      .from("user_games")
      .select("user_id")
      .eq("game_room_id", game_room_id);

    if (participantsError) {
      console.error("[API] Error fetching participants:", participantsError);
      throw participantsError;
    }

    console.log(`[API] Found ${participants?.length || 0} participants`);

    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada pemain yang join room" },
        { status: 400 }
      );
    }

    const userIds = participants.map((p) => p.user_id);
    console.log("[API] User IDs:", userIds);

    // 2. Insert ke game_players dengan health 100
    console.log("[API] Step 2: Inserting players to game_players");
    try {
      await gamePlayerRepository.insertPlayers(game_room_id, userIds);
      console.log("[API] Step 2: Done inserting players");
    } catch (insertError: any) {
      console.error("[API] Error inserting players:", insertError);

      // Check if it's a unique constraint violation (already inserted)
      if (
        insertError?.code === "23505" ||
        insertError?.message?.includes("duplicate key")
      ) {
        console.log(
          "[API] Players already exist in game_players, skipping insert"
        );
        // Continue - don't throw error
      } else {
        throw insertError;
      }
    }

    // 3. Fetch questions untuk game ini
    console.log("[API] Step 3: Fetching questions");
    const { data: questions } = await supabase
      .from("questions")
      .select("question_id")
      .eq("game_room_id", game_room_id)
      .order("question_order", { ascending: true });

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada pertanyaan untuk game ini" },
        { status: 400 }
      );
    }

    console.log(`[API] Step 3: Found ${questions.length} questions`);

    // 4. Generate battle rooms untuk round 1
    console.log("[API] Step 4: Generating battle rooms for round 1");
    try {
      await roundManagementService.startRound(game_room_id, 1, questions);
      console.log("[API] Step 4: Done generating battle rooms");
    } catch (battleError) {
      console.error("[API] Error generating battle rooms:", battleError);
      throw battleError;
    }

    // 5. Update game_rooms.room_status jadi 'playing'
    console.log("[API] Step 5: Updating room status");
    try {
      await gameRoomRepository.updateRoomStatus(game_room_id, "playing");
      console.log("[API] Step 5: Done updating room status");
    } catch (statusError) {
      console.error("[API] Error updating room status:", statusError);
      throw statusError;
    }

    // 6. Get battle room untuk user pertama (host) untuk response
    console.log("[API] Step 6: Getting battle room for host");
    const firstBattleRoom = await battleRoomService.getBattleRoomForPlayer(
      game_room_id,
      userIds[0], // Host user (bisa diganti dengan current user)
      1
    );

    console.log("[API] First battle room:", firstBattleRoom);

    console.log("[API] POST /api/match/start SUCCESS");
    console.log("=".repeat(60));

    return NextResponse.json({
      success: true,
      total_players: userIds.length,
      first_battle_room: firstBattleRoom,
    });
  } catch (error) {
    console.error("[API] FINAL ERROR:");
    console.error("[API] Error:", error);
    console.error(
      "[API] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "[API] Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    console.error(
      "[API] Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error("[API] Error code:", (error as any)?.code || "No code");
    console.log("=".repeat(60));

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
