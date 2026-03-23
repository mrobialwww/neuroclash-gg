/**
 * POST /api/quiz/user-answer
 * http://localhost:3000/api/quiz/user-answer
 *
 * Body:
 *   {
 *     "user_id": "c307f9dc-482f-4442-b566-97dbc258c0e8",
 *     "answer_id": "0014b57b-8912-40ce-962c-29e5836fcf07"
 *   }
 *
 * Fungsi:
 *   1. Menambahkan data baris record baru ke tabel user_answers
 *   2. Tujuan utamanya ketika user tiap selesai menjawab soal di suatu ronde dalam quiz/game
 */

import { matchService } from "@/services/matchService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { user_id, answer_id } = await request.json();

    if (!user_id || !answer_id) {
      return NextResponse.json(
        { error: "Missing user_id or answer_id" },
        { status: 400 }
      );
    }

    const result = await matchService.processAnswerSubmission(
      user_id,
      answer_id
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("API Error [POST /api/quiz/user-answer]:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
