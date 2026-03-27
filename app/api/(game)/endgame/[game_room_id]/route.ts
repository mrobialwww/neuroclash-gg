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
