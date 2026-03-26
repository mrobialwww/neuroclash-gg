/**
 * POST /api/solo/submit-answer
 *
 * Body:
 *   {
 *     "user_id": "uuid",
 *     "answer_id": "uuid",
 *     "game_room_id": "uuid",
 *     "round_number": number
 *   }
 *
 * Fungsi:
 *   1. Record jawaban user ke tabel user_answers
 *   2. Kembalikan apakah jawaban benar atau salah
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { user_id, answer_id, game_room_id, round_number } =
      await request.json();

    console.log(`[SoloAnswer] POST /api/solo/submit-answer`);
    console.log(`[SoloAnswer] user_id: ${user_id}`);
    console.log(`[SoloAnswer] answer_id: ${answer_id}`);
    console.log(`[SoloAnswer] game_room_id: ${game_room_id}`);
    console.log(`[SoloAnswer] round_number: ${round_number}`);

    if (!user_id || !answer_id || !game_room_id || !round_number) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user_id, answer_id, game_room_id, round_number",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get answer detail (is_correct)
    const { data: answerDetail, error: answerError } = await supabase
      .from("answers")
      .select("is_correct, question_id")
      .eq("answer_id", answer_id)
      .single();

    if (answerError || !answerDetail) {
      console.error("[SoloAnswer] Failed to fetch answer detail:", answerError);
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    console.log(`[SoloAnswer] Answer is_correct: ${answerDetail.is_correct}`);

    // 2. Record the answer in user_answers
    const { error: insertError } = await supabase.from("user_answers").insert({
      user_id,
      answer_id,
      game_room_id,
      round_number,
    });

    if (insertError) {
      // If duplicate (already answered this round), still return is_correct
      if (insertError.code !== "23505") {
        console.error(
          "[SoloAnswer] Failed to insert user_answer:",
          insertError
        );
      }
    }

    console.log(`[SoloAnswer] ✅ Solo answer recorded`);

    return NextResponse.json({
      success: true,
      is_correct: answerDetail.is_correct,
    });
  } catch (error) {
    console.error("[SoloAnswer] Unhandled error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
