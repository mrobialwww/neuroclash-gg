import { NextRequest, NextResponse } from "next/server";
import { roundManagementService } from "@/services/roundManagementService";

/**
 * In-memory lock store for battle room generation
 * Key: `${game_room_id}_${round_number}`
 * Value: { locked: boolean, timestamp: number, requestId: string }
 */
const battleRoomLocks = new Map<
  string,
  { locked: boolean; timestamp: number; requestId: string }
>();

/**
 * Try to acquire a lock for battle room generation
 * Returns true if lock was acquired, false if already locked
 */
function tryAcquireLock(
  lockKey: string,
  requestId: string
): { acquired: boolean; existingLock?: any } {
  const lock = battleRoomLocks.get(lockKey);
  const now = Date.now();

  // Check if lock is expired (30 seconds)
  if (lock && now - lock.timestamp > 30000) {
    console.log(`[API][${requestId}] Lock expired for ${lockKey}, removing...`);
    battleRoomLocks.delete(lockKey);
  }

  // Try to acquire lock
  const existingLock = battleRoomLocks.get(lockKey);
  if (!existingLock) {
    battleRoomLocks.set(lockKey, {
      locked: true,
      timestamp: now,
      requestId: requestId,
    });
    console.log(`[API][${requestId}] ✅ Lock acquired for ${lockKey}`);
    return { acquired: true };
  } else {
    console.log(
      `[API][${requestId}] ⚠️ Lock already held for ${lockKey} by ${existingLock.requestId}`
    );
    return { acquired: false, existingLock };
  }
}

/**
 * Release a lock for battle room generation
 */
function releaseLock(lockKey: string, requestId: string) {
  const lock = battleRoomLocks.get(lockKey);
  if (lock && lock.requestId === requestId) {
    battleRoomLocks.delete(lockKey);
    console.log(`[API][${requestId}] 🔓 Lock released for ${lockKey}`);
  }
}

/**
 * Start a new round and generate battle rooms
 * POST /api/match/start-round
 * Body: { game_room_id: string, round_number: number }
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9);

  try {
    const { game_room_id, round_number } = await request.json();

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

    const lockKey = `${game_room_id}_${round_number}`;

    // Try to acquire lock first
    const lockResult = tryAcquireLock(lockKey, requestId);

    // If lock is already held, check if battle rooms already exist
    // If they do, return them immediately (idempotency)
    if (!lockResult.acquired) {
      console.log(
        `[API][${requestId}] ⚠️ Lock not acquired, checking for existing battle rooms...`
      );

      const supabase = await (
        await import("@/lib/supabase/server")
      ).createClient();

      const { data: existingBattleRooms } = await supabase
        .from("battle_rooms")
        .select("*")
        .eq("game_room_id", game_room_id)
        .eq("round_number", round_number);

      if (existingBattleRooms && existingBattleRooms.length > 0) {
        console.log(
          `[API][${requestId}] ✅ Found ${existingBattleRooms.length} existing battle rooms, returning them`
        );

        return NextResponse.json({
          success: true,
          battleRooms: existingBattleRooms,
          message: `Round ${round_number} already started (returned existing battle rooms)`,
          fromLockWait: true,
        });
      }

      // No existing battle rooms found, wait a bit and retry
      // We wait longer (2.5s) to give the primary request time to finish generation
      console.log(
        `[API][${requestId}] ⚠️ No existing battle rooms found, waiting 2.5s and retrying...`
      );
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Retry lock acquisition
      let retryResult = tryAcquireLock(lockKey, requestId);

      // If still not acquired, try one more time checking for rooms (idempotency)
      if (!retryResult.acquired) {
        console.log(
          `[API][${requestId}] ⚠️ Retry 1 failed, checking for rooms again...`
        );
        const { data: roomsAfterWait } = await supabase
          .from("battle_rooms")
          .select("*")
          .eq("game_room_id", game_room_id)
          .eq("round_number", round_number);

        if (roomsAfterWait && roomsAfterWait.length > 0) {
          return NextResponse.json({
            success: true,
            battleRooms: roomsAfterWait,
            message: `Round ${round_number} already started (returned existing battle rooms after wait)`,
            fromLockWait: true,
          });
        }

        // Final wait and retry
        console.log(
          `[API][${requestId}] ⚠️ Still no rooms, final wait 2.5s...`
        );
        await new Promise((resolve) => setTimeout(resolve, 2500));
        retryResult = tryAcquireLock(lockKey, requestId);
      }

      if (!retryResult.acquired) {
        console.log(
          `[API][${requestId}] ❌ Still cannot acquire lock after retries, giving up`
        );
        return NextResponse.json(
          {
            error: "Cannot acquire lock for battle room generation",
            message:
              "Another request is currently generating battle rooms. Please wait a moment and refresh.",
          },
          { status: 423 } // Use 423 Locked instead of 429
        );
      }
    }

    // Lock acquired, proceed with battle room generation
    try {
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
        const supabase = await (
          await import("@/lib/supabase/server")
        ).createClient();

        battleRooms = await roundManagementService.startRound(
          game_room_id,
          round_number,
          [currentQuestion],
          supabase
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
      console.error(`[API][${requestId}] Error starting round:`, error);

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

      console.error(`[API][${requestId}] Error details:`, errorDetails);

      return NextResponse.json(
        {
          error: "Failed to start round",
          details: errorMessage,
          debug: errorDetails,
        },
        { status: 500 }
      );
    } finally {
      // Always release lock
      releaseLock(lockKey, requestId);
    }
  } catch (error) {
    console.error(`[API][${requestId}] Unhandled error:`, error);

    return NextResponse.json(
      {
        error: "Failed to start round",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
