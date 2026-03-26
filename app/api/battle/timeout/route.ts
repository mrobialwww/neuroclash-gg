import { NextRequest, NextResponse } from "next/server";
import { roundManagementService } from "@/services/roundManagementService";

/**
 * Handle timeout for a battle room (no one answered)
 * POST /api/battle/timeout
 * Body: { game_room_id: string, round_number: number, battle_room_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { game_room_id, round_number, battle_room_id } = await request.json();

    if (!game_room_id || !round_number || !battle_room_id) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: game_room_id, round_number, or battle_room_id",
        },
        { status: 400 }
      );
    }

    console.log(
      `[API] Handling timeout for battle room ${battle_room_id} in round ${round_number}`
    );

    // Get battle room to check if anyone answered
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: battleRoom } = await supabase
      .from("battle_rooms")
      .select("*")
      .eq("battle_room_id", battle_room_id)
      .single();

    if (!battleRoom) {
      return NextResponse.json(
        { error: "Battle room not found" },
        { status: 404 }
      );
    }

    // Check if anyone answered
    if (battleRoom.first_answer_user_id) {
      console.log(
        `[API] Battle room ${battle_room_id} already has an answer, skipping timeout`
      );
      return NextResponse.json({
        success: true,
        message: "Battle room already has an answer",
      });
    }

    // IDEMPOTENCY CHECK: Check if battle room is already marked as timeout/finished
    if (battleRoom.status === "timeout" || battleRoom.status === "finished") {
      console.log(
        `[API] ⚠️ Battle room ${battle_room_id} already has status ${battleRoom.status}, skipping timeout`
      );
      return NextResponse.json({
        success: true,
        message: `Battle room already ${battleRoom.status}`,
      });
    }

    console.log(
      `[API] Processing timeout for battle room ${battle_room_id} (status: ${battleRoom.status})`
    );

    // Call timeout handler to apply damage
    await roundManagementService.handleTimeout(
      battle_room_id,
      game_room_id,
      round_number
    );

    console.log(`[API] Timeout handled for battle room ${battle_room_id}`);

    return NextResponse.json({
      success: true,
      message: "Timeout damage applied to all players in battle room",
    });
  } catch (error) {
    console.error("[API] Error handling timeout:", error);
    return NextResponse.json(
      {
        error: "Failed to handle timeout",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
