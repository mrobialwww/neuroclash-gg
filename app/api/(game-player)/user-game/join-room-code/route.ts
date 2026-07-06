import { NextRequest, NextResponse } from "next/server";
import { quizService } from "@/modules/quiz/quiz.service";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { game_room_id, user_id, room_code } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: "Property 'user_id' wajib dikirim" },
                { status: 400 },
            );
        }

        if (!game_room_id) {
            return NextResponse.json(
                { error: "Property 'game_room_id' wajib dikirim" },
                { status: 400 },
            );
        }

        const joinResult = await quizService.joinRoomByCode(
            game_room_id,
            user_id,
            room_code,
        );

        return NextResponse.json({
            success: true,
            data: joinResult,
        });
    } catch (error) {
        console.error(`API Error [POST /api/user-game/join-room-code]:`, error);

        const errorMessage =
            error instanceof Error ? error.message : "Internal Server Error";
        const statusCode = errorMessage === "Kode room tidak valid" ? 403 : 500;

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode },
        );
    }
}
