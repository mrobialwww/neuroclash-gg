import { gameRoomRepository } from "@/repository/gameRoomRepository";
import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ game_room_id: string }> }
) {
  console.log("\n" + "=".repeat(80));
  console.log("[DUPLICATE] START DEBUG");
  console.log("=".repeat(80));

  try {
    const supabase = await createClient();

    const { game_room_id: gameRoomId } = await params;

    console.log(`[DUPLICATE] game_room_id: ${gameRoomId}`);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { max_player, is_solo } = body;

    console.log(`[DUPLICATE] max_player: ${max_player}`);
    console.log(`[DUPLICATE] is_solo: ${is_solo}`);

    // Validasi: Jika solo mode, max_player harus 1
    // Jika multi mode, max_player harus 15, 20, atau 40
    if (is_solo) {
      if (Number(max_player) !== 1) {
        console.error(
          "[DUPLICATE] ❌ Invalid max_player for solo mode:",
          max_player
        );
        return NextResponse.json(
          { error: "Invalid max_player for solo mode. Must be 1" },
          { status: 400 }
        );
      }
    } else {
      if (!max_player || ![15, 20, 40].includes(Number(max_player))) {
        console.error(
          "[DUPLICATE] ❌ Invalid max_player for multi mode:",
          max_player
        );
        return NextResponse.json(
          { error: "Invalid max_player for multi mode. Must be 15, 20, or 40" },
          { status: 400 }
        );
      }
    }

    console.log(
      `[DUPLICATE] ✅ Validation passed - Mode: ${is_solo ? "SOLO" : "MULTI"}`
    );

    const originalRoom = await gameRoomRepository.getRoomById(gameRoomId);

    if (!originalRoom) {
      const { data: similarRooms } = await supabase
        .from("game_rooms")
        .select("game_room_id, room_code, category")
        .ilike("game_room_id", `%${gameRoomId.substring(0, 8)}%`)
        .limit(5);

      return NextResponse.json(
        {
          error: "Room tidak ditemukan",
          debug: {
            game_room_id: gameRoomId,
            similar_rooms:
              similarRooms?.map((r: any) => ({
                id: r.game_room_id,
                code: r.room_code,
                category: r.category,
              })) || [],
          },
        },
        { status: 404 }
      );
    }

    console.log(
      `[DUPLICATE] Original room found: ${originalRoom.room_code}, category: ${originalRoom.category}`
    );

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select(
        `
        question_id,
        question_order,
        question_text,
        answers (
          answer_id,
          answer_text,
          is_correct,
          key
        )
      `
      )
      .eq("game_room_id", gameRoomId)
      .order("question_order", { ascending: true });

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json(
        {
          error: "Tidak ada pertanyaan di room ini",
          debug: {
            game_room_id: gameRoomId,
            error: questionsError,
          },
        },
        { status: 404 }
      );
    }

    console.log(`[DUPLICATE] Found ${questions.length} questions`);

    // Log detailed question data for debugging
    questions.forEach((q: any, idx: number) => {
      console.log(`[DUPLICATE] Question ${idx + 1}:`);
      console.log(`  - question_id: ${q.question_id}`);
      console.log(`  - question_order: ${q.question_order}`);
      console.log(`  - question_text: ${q.question_text?.substring(0, 50)}...`);
      console.log(`  - Number of answers: ${q.answers?.length || 0}`);

      if (q.answers && q.answers.length > 0) {
        q.answers.forEach((a: any, aIdx: number) => {
          console.log(`    Answer ${aIdx + 1}:`);
          console.log(`      - answer_id: ${a.answer_id}`);
          console.log(
            `      - answer_text: ${a.answer_text?.substring(0, 30)}...`
          );
          console.log(`      - is_correct: ${a.is_correct}`);
          console.log(`      - key: ${a.key}`);
        });
      }
    });

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newRoomCode = "";
    for (let i = 0; i < 8; i++) {
      newRoomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    console.log(`[DUPLICATE] New room code: ${newRoomCode}`);

    const newRoom = await gameRoomRepository.createRoom({
      user_id: originalRoom.user_id,
      room_code: newRoomCode,
      category: originalRoom.category,
      title: originalRoom.title || originalRoom.category,
      max_player: Number(max_player),
      total_round: originalRoom.total_round,
      difficulty: originalRoom.difficulty,
      image_url: originalRoom.image_url,
      room_status: "open",
      room_visibility: is_solo ? "private" : "private",
    });

    if (!newRoom) {
      return NextResponse.json(
        {
          error: "Gagal membuat room baru",
          debug: { new_room_code: newRoomCode },
        },
        { status: 500 }
      );
    }

    console.log(`[DUPLICATE] New room created: ${newRoom.game_room_id}`);

    const result = await gameRoomRepository.insertQuestionsWithAnswers(
      newRoom.game_room_id,
      questions
    );

    console.log(
      `[DUPLICATE] ✅ Questions copied: ${result.questionsInserted}, Answers copied: ${result.answersInserted}`
    );

    console.log(
      "\n[DUPLICATE] =================================================="
    );
    console.log("[DUPLICATE] ✅ SUCCESS - ROOM DUPLICATED");
    console.log(
      "[DUPLICATE] =================================================="
    );

    return NextResponse.json({
      success: true,
      data: {
        game_room_id: newRoom.game_room_id,
        new_room_code: newRoomCode,
      },
      questions_copied: result.questionsInserted,
      answers_copied: result.answersInserted,
    });
  } catch (error) {
    console.error("\n[DUPLICATE] ❌ FINAL ERROR:");
    console.error("[DUPLICATE] Error:", error);
    console.error(
      "[DUPLICATE] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "[DUPLICATE] Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        debug: {
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}
