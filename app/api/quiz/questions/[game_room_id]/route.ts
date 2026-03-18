// GET /api/quiz/questions/[game_room_id]
// - melakukan pengambilan soal dari table questions berdasarkan game_room_id dan filter order

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ game_room_id: string }> }) {
  try {
    const supabase = await createClient();

    const { game_room_id } = await params;
    const { searchParams } = new URL(request.url);

    const order = searchParams.get("question_order");

    const { data, error } = await supabase.from("questions").select("*").eq("game_room_id", game_room_id).eq("question_order", order);

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
