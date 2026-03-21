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

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    console.log(body.user_id);
    const { data, error } = await supabase.from("user_answers").insert(body).select();

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
