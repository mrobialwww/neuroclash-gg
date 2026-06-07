import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase/db";

export async function POST(request: NextRequest) {
  try {
    const { roomId, assignments } = await request.json();

    if (!roomId || !assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    console.log(
      `[API] Auto-assigning ${assignments.length} abilities in room ${roomId}`
    );

    const results = [];
    for (const assignment of assignments) {
      const { playerId, abilityId } = assignment;

      // Use service role client (db) to bypass RLS for other players
      const { data, error } = await db.rpc("increment_ability", {
        p_game_room_id: roomId,
        p_ability_id: Number(abilityId),
        p_user_id: playerId,
      });

      if (error) {
        console.error(`[API] DB error assigning to ${playerId}:`, error);
        results.push({
          playerId,
          abilityId,
          success: false,
          error: error.message,
        });
      } else {
        results.push({ playerId, abilityId, success: true });
      }
    }

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      console.error(`[API] Failed auto-assignments:`, failed);
      // We still return 200 to not break the UI completely, but with partial success
      return NextResponse.json({ success: false, results, failed });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[API] Auto-assign error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
