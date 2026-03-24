import { NextRequest, NextResponse } from "next/server";
import { roundManagementService } from "@/services/roundManagementService";

/**
 * Start a new round and generate battle rooms
 * POST /api/match/start-round
 * Body: { game_room_id: string, round_number: number }
 */
export async function POST(request: NextRequest) {
  try {
    const { game_room_id, round_number } = await request.json();

    if (!game_room_id || !round_number) {
      return NextResponse.json(
        { error: "Missing required parameters: game_room_id or round_number" },
        { status: 400 }
      );
    }

    console.log(
      `[API] Starting round ${round_number} for game ${game_room_id}`
    );

    // Get questions for the game
    const supabase = await (
      await import("@/lib/supabase/server")
    ).createClient();

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("question_id")
      .eq("game_room_id", game_room_id)
      .order("question_order", { ascending: true });

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this game" },
        { status: 404 }
      );
    }

    // Get the question for current round
    const currentQuestion = questions[round_number - 1];
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Question not found for this round" },
        { status: 404 }
      );
    }

    // Start the round and generate battle rooms
    const battleRooms = await roundManagementService.startRound(
      game_room_id,
      round_number,
      [currentQuestion]
    );

    if (battleRooms.length === 0) {
      return NextResponse.json(
        {
          error: "No battle rooms generated - game may be ending",
          battleRooms: [],
        },
        { status: 200 }
      );
    }

    console.log(
      `[API] Round ${round_number} started with ${battleRooms.length} battle rooms`
    );

    return NextResponse.json({
      success: true,
      battleRooms,
      message: `Round ${round_number} started successfully`,
    });
  } catch (error) {
    console.error("[API] Error starting round:", error);

    let errorMessage = "Unknown error";
    let errorDetails: any = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        message: error.message,
        stack: error.stack,
      };
    } else {
      errorMessage = String(error);
      errorDetails = {
        rawError: String(error),
      };
    }

    console.error("[API] Error details:", errorDetails);

    return NextResponse.json(
      {
        error: "Failed to start round",
        details: errorMessage,
        debug: errorDetails,
      },
      { status: 500 }
    );
  }
}
