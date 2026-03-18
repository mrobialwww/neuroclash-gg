// GET /api/game-rooms?visibility=public&status=open
// - user ingin mencari semua daftar room dengan room_visibility "public" dan room_status "open" tersedia

// POST /api/game-rooms
// - pembuat game melakukan create game di awal

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

    //jika FE tidak memberikan field category(karena dari file pdf), maka isi otomatis dari "theme_materials"
    if (!restOfBody.topic_material) {
      restOfBody.topic_material = listQuestions.theme_materials;
    }

    const { data, error } = await supabase.from("game_rooms").insert(restOfBody).select();

    const gameRoomId = data?.[0]?.game_room_id;

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
    await Promise.all(questions);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    console.log("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
