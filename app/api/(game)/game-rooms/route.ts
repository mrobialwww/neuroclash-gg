/**
 * GET /api/game-rooms?room_visibility=public&room_status=open
 * http://localhost:3000/api/game-rooms?room_visibility=public&room_status=open
 *
 * Fungsi:
 *   1. Mendapatkan list game_rooms berdasarkan atribute room_visibility "public" dan room_status "open"
 *   2. Tujuan utamanya ketika user mencari list room game/quiz yang bisa diikuti tanpa memasukkan room_code
 */

/**
 * POST /api/game-rooms
 * http://localhost:3000/api/game-rooms
 *
 * Body:
 *   {
 *     "user_id": "c307f9dc-482f-4442-b566-97dbc258c0e8",
 *     "room_code": "1AGT2025",
 *     "category": "sejarah",
 *     "title": "miskin",
 *     "max_player": "13",
 *     "total_question": "13",
 *     "total_round": "13",
 *     "difficulty": "sedang",
 *     "image_url": "https://...",
 *     "room_status": "open",
 *     "room_visibility": "private",
 *     "questions": {
 *       "theme_materials": "Posyandu Stunting",
 *       "list_questions": [...]
 *     }
 *   }
 *
 * Fungsi:
 *   1. Menambahkan data baris record baru ke tabel game_rooms
 *   2. Tujuan utamanya ketika creator game ingin membuat room game di awal, dengan melemparkan
 *      beberapa parameter
 *   3. Parameter questions itu didapat dari pemanggilan POST http://localhost:3000/api/quiz
 *      yang dilakukan ketika memilih materi default/upload materi manual, sesaat sebelum creator
 *      game menekan button "create room game"
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("room_status", "open")
      .eq("room_visibility", "public");

    if (error) {
      console.error("[API] Error fetching game_rooms:", error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /api/game-rooms Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("=".repeat(60));
  console.log("[API] POST /api/game-rooms START");
  console.log("=".repeat(60));

  try {
    const supabase = await createClient();

    console.log("[API] Step 0: Reading request body");
    let requestBody;

    try {
      requestBody = await request.json();
      console.log("[API] Request body keys:", Object.keys(requestBody));
      console.log("[API] Request body (partial):", {
        user_id: requestBody.user_id,
        room_code: requestBody.room_code,
        category: requestBody.category,
        max_player: requestBody.max_player,
      });
    } catch (jsonError) {
      console.error("[API] Error reading request.json():", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { questions: listQuestions, ...restOfBody } = requestBody;

    const listAbilities = listQuestions.ability_materials;

    //jika FE tidak memberikan field category(karena dari file pdf), maka isi otomatis dari "theme_materials"
    if (!restOfBody.category) {
      restOfBody.category = listQuestions.theme_materials;
    }

    console.log("[API] Step 2: Inserting to game_rooms");
    console.log("[API] Room data (partial):", {
      room_code: restOfBody.room_code,
      category: restOfBody.category,
      max_player: restOfBody.max_player,
      room_status: restOfBody.room_status,
      room_visibility: restOfBody.room_visibility,
    });

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    const gameRoomId = data?.[0]?.game_room_id;

    if (!gameRoomId) {
      throw new Error("Gagal mendapatkan game_room_id dari data yang dimasukkan.");
    }

    const questions = listQuestions.list_questions.map(async (question: any) => {
      const questionData = {
        game_room_id: gameRoomId,
        question_order: question.order,
        question_text: question.question,
        is_profbubu: question.is_profbubu,
      };
      const { data: questionRes, error: questionErr } = await supabase.from("questions").insert(questionData).select();

    const gameRoomId = roomsData?.[0]?.game_room_id;

    if (!gameRoomId) {
      console.error("[API] Failed to get game_room_id from inserted data");
      throw new Error("Failed to get game_room_id");
    }

    console.log(`[API] game_room_id: ${gameRoomId}`);

    console.log("[API] Step 3: Inserting questions");
    const questions = listQuestions.list_questions.map(
      async (question: any, index: number) => {
        const questionData = {
          game_room_id: gameRoomId,
          question_order: question.order,
          question_text: question.question,
        };

        const { data: questionRes, error: questionErr } = await supabase
          .from("questions")
          .insert(questionData)
          .select();

        if (questionErr) {
          console.error(
            `[API] Error inserting question ${index + 1}:`,
            questionErr
          );
          return;
        }
      });

      await Promise.all(answers);
    });
    const ability_materials = listAbilities.map(async (ability: any) => {
      const abilityData = {
        game_room_id: gameRoomId,
        title: ability.title,
        content: ability.text,
      };
      const { data: abilityRes, error: abilityErr } = await supabase.from("ability_materials").insert(abilityData).select();
      if (abilityErr) {
        console.error("Gagal insert ability material:", abilityErr);
      }
    });

    await Promise.all(questions);
    await Promise.all(ability_materials);

    return NextResponse.json({ data: roomsData });
  } catch (error) {
    console.error("[API] FINAL ERROR in POST /api/game-rooms:");
    console.error("[API] Error:", error);
    console.error(
      "[API] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "[API] Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    console.error(
      "[API] Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error("[API] Error code:", (error as any)?.code || "No code");
    console.log("=".repeat(60));

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
