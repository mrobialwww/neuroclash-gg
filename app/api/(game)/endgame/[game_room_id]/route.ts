import { NextResponse } from "next/server";
import { endgameService } from "@/services/endgameService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ game_room_id: string }> }
) {
  try {
    const { game_room_id } = await params;

    if (!game_room_id) {
      return NextResponse.json({ error: "id not found" }, { status: 400 });
    }

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    // 1. Initial status check
    const { data: roomInfo } = await adminSupabase
      .from("game_rooms")
      .select("room_status")
      .eq("game_room_id", game_room_id)
      .maybeSingle();

    // 2. Safety Trigger: If still 'ongoing' or 'processing' (crashed mid-reward),
    // it means rewards haven't been fully persisted yet.
    // This ensures that the first player viewing the endgame page triggers the persistence.
    if (
      roomInfo &&
      (roomInfo.room_status === "ongoing" ||
        roomInfo.room_status === "processing" ||
        roomInfo.room_status === "playing")
    ) {
      console.log(
        `[Endgame API] Safety trigger activated for room ${game_room_id} (status: ${roomInfo.room_status}). Processing rewards...`
      );
      await endgameService.processCentralizedRewards(
        game_room_id,
        adminSupabase
      );
    }

    const results = await endgameService.calculateMatchResults(
      game_room_id,
      adminSupabase
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("[Endgame API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
