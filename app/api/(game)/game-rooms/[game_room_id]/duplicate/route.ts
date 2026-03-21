import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ game_room_id: string }> }
) {
  try {
    const supabase = await createClient();
    const { game_room_id } = await params;
    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};
    const max_player = body.max_player || 40;

    // 1. Fetch old room
    const { data: oldRoom, error: errRoom } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("game_room_id", game_room_id)
      .single();

    if (errRoom) throw errRoom;

    // 2. Fetch questions and answers
    const { data: oldQuestions } = await supabase
      .from("questions")
      .select("*, answers(*)")
      .eq("game_room_id", game_room_id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Generate random 8-char alphanumeric string
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newRoomCode = "";
    for (let i = 0; i < 8; i++) {
      newRoomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 3. Create new room
    const { data: newRoom, error: newRoomErr } = await supabase
      .from("game_rooms")
      .insert({
        user_id: user?.id,
        room_code: newRoomCode,
        topic_material: oldRoom.topic_material,
        title: oldRoom.title,
        max_player: max_player,
        total_question: oldRoom.total_question,
        total_round: oldRoom.total_round,
        difficulty: oldRoom.difficulty,
        image_url: oldRoom.image_url,
        room_status: "open",
        room_visibility: "private",
      })
      .select()
      .single();

    if (newRoomErr) throw newRoomErr;

    // 4. Copy questions and answers
    if (oldQuestions && oldQuestions.length > 0) {
      for (const q of oldQuestions) {
        const { data: newQ } = await supabase
          .from("questions")
          .insert({
            game_room_id: newRoom.game_room_id,
            question_text: q.question_text,
            question_order: q.question_order,
            difficulty_level: q.difficulty_level,
          })
          .select()
          .single();

        if (newQ && q.answers && q.answers.length > 0) {
          const aData = q.answers.map((a: any) => ({
            question_id: newQ.question_id,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
            key: a.key,
          }));
          const { error: aErr } = await supabase.from("answers").insert(aData);
          if (aErr) throw aErr;
        }
      }
    }

    return NextResponse.json({ data: newRoom });
  } catch (error) {
    console.error("Duplicate API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
