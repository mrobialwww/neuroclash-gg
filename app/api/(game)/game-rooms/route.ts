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
 *     "title": "Quiz Sejarah",
 *     "max_player": 20,
 *     "total_question": 20,
 *     "total_round": 20,
 *     "difficulty": "sedang",
 *     "image_url": "https://...",
 *     "room_status": "open",
 *     "room_visibility": "private"
 *   }
 *
 * Fungsi:
 *   Membuat record di tabel game_rooms saja.
 *   Digunakan oleh fitur duplikasi room (questions sudah tersedia di DB).
 *   Untuk pembuatan room baru dari generate Gemini, gunakan POST /api/quiz
 *   yang akan membuat room + questions + answers + ability_materials sekaligus.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  gameRoomRepository,
  CreateRoomParams,
} from "@/repository/gameRoomRepository";
import { Difficulty, RoomStatus, RoomVisibility } from "@/types/enums";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const roomVisibility = searchParams.get("room_visibility") ?? "public";
    const roomStatus = searchParams.get("room_status") ?? "open";

    // Validate against known values
    if (!["public", "private"].includes(roomVisibility)) {
      return NextResponse.json(
        { error: "room_visibility tidak valid." },
        { status: 400 }
      );
    }
    if (!["open", "playing", "finished"].includes(roomStatus)) {
      return NextResponse.json(
        { error: "room_status tidak valid." },
        { status: 400 }
      );
    }

    const rooms = await gameRoomRepository.getPublicOpenRooms();

    return NextResponse.json({ data: rooms });
  } catch (error) {
    console.error("[API] GET /api/game-rooms Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("=".repeat(60));
  console.log("[API] POST /api/game-rooms START");
  console.log("=".repeat(60));

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      user_id,
      room_code,
      category,
      title,
      max_player,
      total_round,
      difficulty,
      room_status,
      room_visibility,
      questions: listQuestions,
    } = body as any;

    const finalCategory = listQuestions?.theme_materials || category || "General";
    const enumCategories = ["bahasaindonesia", "bahasainggris", "biologi", "pancasila", "pemrograman", "sejarah"];
    
    let generatedImageUrl = "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/biologi.webp";
    const formattedCat = String(finalCategory).toLowerCase().replace(/\s+/g, '');
    if (enumCategories.includes(formattedCat)) {
      generatedImageUrl = `https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/${formattedCat}.webp`;
    }

    const finalRoomCode = room_code || Math.random().toString(36).substring(2, 10).toUpperCase();

    // ── Validate required fields ──────────────────────────────────────────
    if (
      !user_id ||
      !finalCategory ||
      !max_player ||
      !total_round
    ) {
      return NextResponse.json(
        {
          error:
            "Field wajib kurang: user_id, category, max_player, total_round.",
        },
        { status: 400 }
      );
    }

    const params: CreateRoomParams = {
      user_id: String(user_id),
      room_code: String(finalRoomCode),
      category: String(finalCategory),
      title: title ? String(title) : null,
      max_player: Number(max_player),
      total_round: Number(total_round),
      difficulty: String(difficulty ?? "mudah") as Difficulty,
      image_url: generatedImageUrl,
      room_status: String(room_status ?? "open") as RoomStatus,
      room_visibility: String(room_visibility ?? "public") as RoomVisibility,
    };

    console.log("[API] Inserting game_room via repository:", {
      room_code: params.room_code,
      category: params.category,
      max_player: params.max_player,
    });

    const room = await gameRoomRepository.createRoom(params);

    if (!room) {
      console.error("[API] gameRoomRepository.createRoom returned null");
      return NextResponse.json(
        { error: "Gagal membuat game room." },
        { status: 500 }
      );
    }

    // Insert Questions and Answers
    if (listQuestions?.list_questions && listQuestions.list_questions.length > 0) {
      const MappedQuestions = listQuestions.list_questions.map((q: any) => ({
        question_order: q.order || q.question_order,
        question_text: q.question || q.question_text,
        answers: (q.options || q.answers || []).map((opt: any) => ({
          answer_text: opt.text || opt.answer_text,
          is_correct: opt.is_correct || opt.isCorrect,
          key: opt.key,
        })),
      }));
      await gameRoomRepository.insertQuestionsWithAnswers(room.game_room_id, MappedQuestions);
    }

    // Insert Ability Materials
    if (listQuestions?.ability_materials && listQuestions.ability_materials.length > 0) {
      await gameRoomRepository.insertAbilityMaterials(room.game_room_id, listQuestions.ability_materials);
    }

    console.log("[API] POST /api/game-rooms SUCCESS:", room.game_room_id);
    console.log("=".repeat(60));

    return NextResponse.json({ data: [room] }, { status: 201 });
  } catch (error) {
    console.error("[API] FINAL ERROR in POST /api/game-rooms:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
