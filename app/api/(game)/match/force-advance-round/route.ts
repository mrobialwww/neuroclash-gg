import { NextRequest, NextResponse } from "next/server";
import { battleRoomRepository } from "@/modules/battles/battle.repository";
import { battleRoomService } from "@/modules/battles/battle.service";
import { gameRoomService } from "@/modules/games/game.service";
import { roundManagementService } from "@/services/roundManagementService";

/**
 * POST /api/match/force-advance-round
 * Body: { game_room_id: string, round_number: number }
 *
 * Recovery endpoint: force-finishes any battle rooms still marked "ongoing"
 * for the given round (treating them as timeouts), then advances.
 * Called by clients when their polling loop times out to prevent a permanent
 * desync / freeze.
 */
export async function POST(request: NextRequest) {
    try {
        const { game_room_id, round_number } = await request.json();

        if (!game_room_id || !round_number) {
            return NextResponse.json(
                { error: "Missing required parameters: game_room_id or round_number" },
                { status: 400 },
            );
        }

        console.log(
            `[API] force-advance-round: game=${game_room_id.substring(0, 8)}, round=${round_number}`,
        );

        // 1. Fetch all battle rooms for this round
        const battleRooms = await battleRoomRepository.getAllBattleRoomsForRound(
            game_room_id,
            round_number,
        );

        console.log(
            `[API] force-advance-round: found ${battleRooms.length} battle rooms`,
        );

        // 2. Mark any "ongoing" battle rooms as "timeout"
        const stuckRooms = battleRooms.filter((br) => br.status === "ongoing");
        console.log(
            `[API] force-advance-round: ${stuckRooms.length} rooms stuck in "ongoing"`,
        );

        for (const room of stuckRooms) {
            console.log(
                `[API] force-advance-round: force-timeout battle room ${room.battle_room_id.substring(0, 8)}`,
            );
            await roundManagementService.handleTimeout(
                room.battle_room_id,
                game_room_id,
                round_number
            );
        }

        if (stuckRooms.length === 0) {
            // 3. Finalize the match round record
            try {
                await battleRoomService.finalizeMatchRound(game_room_id, round_number);
            } catch (e) {
                console.warn(
                    `[API] force-advance-round: finalizeMatchRound warning (may be already done):`,
                    e,
                );
            }

            // 4. Check game end condition
            const shouldEnd = await gameRoomService.checkGameEndCondition(game_room_id);
            if (shouldEnd) {
                console.log(`[API] force-advance-round: game should end, ending game`);
                await gameRoomService.endGame(game_room_id);
                return NextResponse.json({ success: true, game_ended: true });
            }

            // 5. Prepare next round record
            await gameRoomService.prepareNextRound(game_room_id, round_number);
        }

        console.log(
            `[API] force-advance-round: round ${round_number} force-finished, next round prepared`,
        );

        return NextResponse.json({
            success: true,
            game_ended: false,
            stuck_rooms_fixed: stuckRooms.length,
        });
    } catch (error) {
        console.error("[API] force-advance-round error:", error);
        return NextResponse.json(
            {
                error: "Failed to force-advance round",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
