/**
 * GET /api/user-game/[user_game_id]
 * http://localhost:3000/api/user-game/48647dcc-b3ab-4830-a28a-a171eebb13ce
 *
 * Fungsi:
 *   Mendapatkan recap detail dari suatu game/quiz yang pernah diikuti user.
 *   Return berisi statistik akhir, daftar soal lengkap dengan jawaban user,
 *   status benar/salah/tidak terjawab, dan pembahasan.
 */

import { NextRequest, NextResponse } from "next/server";
import { historyService } from "@/modules/histories/history.service";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ user_game_id: string }> },
) {
    try {
        const { user_game_id } = await params;

        const result = await historyService.getGameRecap(user_game_id);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[Recap API] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
