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

    const { data, error } = await supabase.from("game_rooms").select("*").eq("room_status", "open").eq("room_visibility", "public");

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { questions: listQuestions, ...restOfBody } = await request.json();

    const listAbilities = listQuestions.ability_materials;

    //jika FE tidak memberikan field category(karena dari file pdf), maka isi otomatis dari "theme_materials"
    if (!restOfBody.category) {
      restOfBody.category = listQuestions.theme_materials;
    }

    const { data, error } = await supabase.from("game_rooms").insert(restOfBody).select();

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
      };
      const { data: questionRes, error: questionErr } = await supabase.from("questions").insert(questionData).select();

      if (questionErr) {
        console.error("Gagal insert question:", questionErr);
        return;
      }

      const newQuestionId = questionRes?.[0]?.question_id;

      const answers = question.options.map(async (answer: any) => {
        const answerData = {
          question_id: newQuestionId,
          key: answer.key,
          answer_text: answer.text,
          is_correct: answer.is_correct,
        };
        const { data: answerRes, error: answerErr } = await supabase.from("answers").insert(answerData).select();
        if (answerErr) {
          console.error("Gagal insert answer:", answerErr);
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

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    console.log("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
