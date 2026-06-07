/**
 * GET /api/battle/my-room?game_room_id=xxx&user_id=xxx&round_number=x
 *
 * Query params:
 *   - game_room_id: string
 *   - user_id: string
 *   - round_number: number
 *
 * Returns: BattleRoom | null
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameRoomId = searchParams.get("game_room_id");
  const userId = searchParams.get("user_id");
  const roundNumber = searchParams.get("round_number");

  console.log(
    `[BattleMyRoom] ==================================================`
  );
  console.log(`[BattleMyRoom] Fetching battle room:`);
  console.log(`[BattleMyRoom]   - game_room_id: ${gameRoomId}`);
  console.log(`[BattleMyRoom]   - user_id: ${userId?.substring(0, 8)}`);
  console.log(`[BattleMyRoom]   - round_number: ${roundNumber}`);
  console.log(
    `[BattleMyRoom] ==================================================`
  );

  if (!gameRoomId || !userId || !roundNumber) {
    return NextResponse.json(
      {
        error: "Missing required params: game_room_id, user_id, round_number",
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Cek semua battle rooms untuk round ini (untuk debugging)
  const { data: allRooms, error: allRoomsError } = await supabase
    .from("battle_rooms")
    .select("*")
    .eq("game_room_id", gameRoomId)
    .eq("round_number", parseInt(roundNumber));

  console.log(
    `[BattleMyRoom] Total battle rooms for round ${roundNumber}: ${
      allRooms?.length || 0
    }`
  );

  if (allRooms && allRooms.length > 0) {
    allRooms.forEach((room, idx) => {
      console.log(`[BattleMyRoom]   Room ${idx + 1}:`, {
        id: room.battle_room_id.substring(0, 8),
        p1: room.player1_id.substring(0, 8),
        p2: room.player2_id.substring(0, 8),
        p3: room.player3_id?.substring(0, 8) || "none",
        status: room.status,
      });
    });
  }

  if (allRoomsError) {
    console.error(
      "[BattleMyRoom] Error fetching all battle rooms:",
      allRoomsError
    );
  }

  // Cari battle room untuk user ini
  const { data, error } = await supabase
    .from("battle_rooms")
    .select("*")
    .eq("game_room_id", gameRoomId)
    .eq("round_number", parseInt(roundNumber))
    .or(
      `player1_id.eq.${userId},player2_id.eq.${userId},player3_id.eq.${userId}`
    )
    .maybeSingle();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[BattleMyRoom] Error fetching battle room:", error);
      return NextResponse.json(null, { status: 500 });
    }
  }

  console.log(
    `[BattleMyRoom] Result for user ${userId?.substring(0, 8)}: ${
      data ? "Found" : "Not found"
    }`
  );
  console.log(
    `[BattleMyRoom] ==================================================`
  );

  return NextResponse.json(data);
}
