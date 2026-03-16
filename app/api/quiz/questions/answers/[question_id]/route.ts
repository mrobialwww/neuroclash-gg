// GET /api/quiz/questions/[question_id]/answers
// - melakukan pengambilan 4 record jawaban berdasarkan question_id yg ditentukan

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ question_id: string }> }) {
  try {
    const supabase = await createClient();

    const { question_id } = await params;

    const { data, error } = await supabase.from("answers").select("*").eq("question_id", question_id);

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
