/**
 * GET /api/match/participants/[roomId]
 *
 * Fungsi:
 *   Mengambil semua pemain dari game_players untuk real-time sync
 *   Dipakai oleh useMatchStore.syncPlayersFromDB
 */

import { gamePlayerRepository } from "@/repository/gamePlayerRepository";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    console.log(`[API] ==================================================`);
    console.log(`[API] GET /api/match/participants/${roomId} START`);
    console.log(`[API] Room ID: ${roomId}`);
    console.log(`[API] Room ID type: ${typeof roomId}`);
    console.log(`[API] ==================================================`);

    const participants = await gamePlayerRepository.getPlayers(roomId);

    console.log(
      `[API] Repository returned ${participants.length} participants`
    );
    console.log(`[API] Participants type: ${typeof participants}`);
    console.log(`[API] Participants data:`, participants);

    if (participants.length === 0) {
      console.warn(
        `[API] ⚠️ WARNING: No participants found in repository result`
      );
      console.warn(`[API] Room ID used: ${roomId}`);
    }

    console.log(`[API] ==================================================`);
    console.log(`[API] Returning response to client`);
    console.log(`[API] ==================================================`);

    return NextResponse.json({
      success: true,
      data: participants,
    });
  } catch (error) {
    console.error("[API] FINAL ERROR in GET /api/match/participants]:", error);
    console.error(
      "[API] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "[API] Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    console.error("[API] Error code:", (error as any)?.code || "No code");

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
