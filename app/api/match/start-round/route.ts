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

    // Add timestamp to track concurrent requests
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(
      `[API][${requestId}] ==================================================`
    );
    console.log(
      `[API][${requestId}] POST /api/match/start-round START - game: ${game_room_id.substring(
        0,
        8
      )}, round: ${round_number}`
    );
    console.log(
      `[API][${requestId}] ==================================================`
    );

    if (!game_room_id || !round_number) {
      return NextResponse.json(
        { error: "Missing required parameters: game_room_id or round_number" },
        { status: 400 }
      );
    }

    console.log(
      `[API][${requestId}] Starting round ${round_number} for game ${game_room_id.substring(
        0,
        8
      )}`
    );

    // Get questions for game
    const supabase = await (
      await import("@/lib/supabase/server")
    ).createClient();

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("question_id, question_order")
      .eq("game_room_id", game_room_id)
      .order("question_order", { ascending: true });

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this game" },
        { status: 404 }
      );
    }

    console.log(
      `[API][${requestId}] Found ${
        questions.length
      } questions for game ${game_room_id.substring(0, 8)}`
    );

    // Get question for current round based on question_order
    // Use .find() to find question with question_order === round_number
    const currentQuestion = questions.find(
      (q: any) => q.question_order === round_number
    );

    console.log(
      `[API][${requestId}] Questions available:`,
      questions.map((q: any) => q.question_order)
    );
    console.log(
      `[API][${requestId}] Looking for question_order === ${round_number}`
    );
    console.log(`[API][${requestId}] Found question:`, currentQuestion);

    if (!currentQuestion) {
      console.error(
        `[API][${requestId}] Question not found for round ${round_number}. Questions available:`,
        questions.map((q: any) => ({
          order: q.question_order,
          id: q.question_id,
        }))
      );

      return NextResponse.json(
        {
          error: `Question not found for round ${round_number}`,
          availableRounds: questions.map((q: any) => q.question_order),
          requestedRound: round_number,
          totalQuestionsAvailable: questions.length,
        },
        { status: 404 }
      );
    }

    console.log(
      `[API][${requestId}] Found question for round ${round_number}:`,
      currentQuestion.question_id
    );

    // Start round and generate battle rooms
    // Note: Cleanup of battle rooms happens at the end of each round, not at the start
    // The service layer handles idempotency properly
    console.log(
      `[API][${requestId}] About to call startRound for round ${round_number} with question ${currentQuestion.question_id.substring(
        0,
        8
      )}`
    );

    let battleRooms;
    try {
      battleRooms = await roundManagementService.startRound(
        game_room_id,
        round_number,
        [currentQuestion]
      );
    } catch (roundError) {
      console.error(
        `[API][${requestId}] ERROR in roundManagementService.startRound:`,
        roundError
      );
      console.error(
        `[API][${requestId}] ERROR details:`,
        JSON.stringify(roundError, Object.getOwnPropertyNames(roundError))
      );

      return NextResponse.json(
        {
          error: "Failed to start round in roundManagementService",
          details:
            roundError instanceof Error
              ? roundError.message
              : String(roundError),
          stack: roundError instanceof Error ? roundError.stack : undefined,
        },
        { status: 500 }
      );
    }

    if (!battleRooms || battleRooms.length === 0) {
      return NextResponse.json(
        {
          error: "No battle rooms generated - game may be ending",
          battleRooms: [],
        },
        { status: 200 }
      );
    }

    console.log(
      `[API][${requestId}] Round ${round_number} started with ${battleRooms.length} battle rooms`
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
