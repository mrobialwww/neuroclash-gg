import { NextRequest, NextResponse } from "next/server";
import { gamePlayersService } from "@/modules/gamePlayers/gamePlayers.service";

// for prof bubu round
export async function POST(request: NextRequest) {
    try {
        const { game_room_id, user_id } = await request.json();

        if (!game_room_id || !user_id) {
            return NextResponse.json(
                { error: "Missing game_room_id or user_id" },
                { status: 400 },
            );
        }

        const data = await gamePlayersService.dropMaterialToPlayer(
            game_room_id,
            user_id,
        );

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error(
            "API Error [POST /api/(game-player)/drop-materials]:",
            error,
        );
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error",
            },
            { status: 500 },
        );
    }
}
