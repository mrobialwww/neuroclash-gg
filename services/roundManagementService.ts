import { battleRoomService, BattleRoom } from "./battleRoomService";
import { matchRepository } from "@/repository/matchRepository";
import { createClient } from "@/lib/supabase/server";

export const roundManagementService = {
  /**
   * Start a new round:
   * 1. Generate battle rooms (cleanup old ones first)
   * 2. Assign questions to each battle room
   * 3. Update match_rounds status
   */
  async startRound(
    gameId: string,
    roundNumber: number,
    questions: { question_id: string }[]
  ): Promise<BattleRoom[]> {
    console.log(
      `[RoundService] ==================================================`
    );
    console.log(
      `[RoundService] Starting round ${roundNumber} for game ${gameId}`
    );
    console.log(
      `[RoundService] ==================================================`
    );

    // 1. Generate battle rooms (ini sudah menghapus old ones di dalam)
    const battleRooms = await battleRoomService.generateBattleRooms(
      gameId,
      roundNumber,
      questions
    );

    if (battleRooms.length === 0) {
      console.log(
        `[RoundService] No battle rooms generated - checking if game should end`
      );
      // Check if game should end
      const shouldEnd = await this.checkGameEndCondition(gameId);
      if (shouldEnd) {
        await this.endGame(gameId);
      }
      return [];
    }

    // 2. Update battle room status to 'ongoing'
    console.log(
      `[RoundService] Updating ${battleRooms.length} battle rooms to 'ongoing'`
    );
    for (const battleRoom of battleRooms) {
      await battleRoomService.updateBattleRoomStatus(
        battleRoom.battle_room_id,
        "ongoing"
      );
    }

    // 3. Create/update match_rounds status
    console.log(`[RoundService] Updating match_rounds status`);
    const supabase = await createClient();

    // Cek apakah match_rounds sudah ada
    const { data: existingRound } = await supabase
      .from("match_rounds")
      .select("*")
      .eq("game_room_id", gameId)
      .eq("round_number", roundNumber)
      .maybeSingle();

    if (existingRound) {
      // Update existing
      await supabase
        .from("match_rounds")
        .update({
          status: "ongoing",
          all_battles_finished: false,
          damage_applied: false,
          updated_at: new Date().toISOString(),
        })
        .eq("game_room_id", gameId)
        .eq("round_number", roundNumber);
      console.log(`[RoundService] Updated existing match_rounds`);
    } else {
      // Create new
      await supabase.from("match_rounds").insert({
        game_room_id: gameId,
        round_number: roundNumber,
        status: "ongoing",
        all_battles_finished: false,
        damage_applied: false,
      });
      console.log(`[RoundService] Created new match_rounds`);
    }

    console.log(
      `[RoundService] ==================================================`
    );
    console.log(
      `[RoundService] Round ${roundNumber} started with ${battleRooms.length} battle rooms`
    );
    console.log(
      `[RoundService] ==================================================`
    );

    return battleRooms;
  },

  /**
   * Process answer submission:
   * 1. Check if this is the first answer in the battle room
   * 2. If first, record it and mark others as unable to answer
   * 3. Check if battle room is finished
   * 4. Check if all battle rooms are finished
   * 5. If all finished, apply damage and check for next round
   */
  async processAnswer(
    userId: string,
    answerId: string,
    battleRoomId: string,
    gameId: string,
    roundNumber: number
  ): Promise<{
    success: boolean;
    is_correct: boolean;
    damage_applied: boolean;
    new_health: number;
    message: string;
  }> {
    console.log(
      `[RoundService] Processing answer from user ${userId} in battle room ${battleRoomId}`
    );

    const supabase = await createClient();

    // 1. Get battle room info
    const battleRoom = await battleRoomService.getBattleRoomForPlayer(
      gameId,
      userId,
      roundNumber
    );

    if (!battleRoom) {
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Battle room not found",
      };
    }

    // 2. Check if someone already answered
    if (
      battleRoom.first_answer_user_id &&
      battleRoom.first_answer_user_id !== userId
    ) {
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Another player already answered in this battle room",
      };
    }

    // 3. Get answer details
    const answerDetail = await matchRepository.getAnswerDetail(answerId);
    if (!answerDetail) {
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Answer not found",
      };
    }

    // 4. Record the answer
    await matchRepository.submitAnswer(userId, answerId, gameId, roundNumber);

    // 5. If this is the first answer, record it in battle room
    if (!battleRoom.first_answer_user_id) {
      await battleRoomService.recordFirstAnswer(battleRoomId, userId, answerId);

      // Update user_answers to mark as first answer
      await supabase
        .from("user_answers")
        .update({
          battle_room_id: battleRoomId,
          is_first_answer: true,
        })
        .eq("user_id", userId)
        .eq("answer_id", answerId)
        .eq("round_number", roundNumber);
    }

    // 6. Get question metadata to calculate damage
    const { data: questionData } = await supabase
      .from("questions")
      .select("question_order, game_rooms(total_question)")
      .eq("question_id", answerDetail.question_id)
      .single();

    if (!questionData) {
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Question metadata not found",
      };
    }

    const currentOrder = questionData.question_order;
    const totalQuestions =
      (questionData.game_rooms as any).total_question || 20;

    // 7. Calculate damage
    const damage = this.calculateDamage(currentOrder, totalQuestions);

    // 8. Apply damage based on correctness
    let damageApplied = false;
    let newHealth = 100;

    if (answerDetail.is_correct) {
      // Correct answer - damage to opponents in same battle room
      const opponents = [
        battleRoom.player1_id,
        battleRoom.player2_id,
        battleRoom.player3_id,
      ].filter((id): id is string => id !== null && id !== userId);

      for (const opponentId of opponents) {
        const opponent = await matchRepository.getParticipants(gameId);
        const opponentState = opponent.find((p) => p.id === opponentId);
        if (opponentState && opponentState.health > 0) {
          const healthAfterDamage = Math.max(0, opponentState.health - damage);
          await matchRepository.updateHealth(
            opponentId,
            gameId,
            healthAfterDamage
          );
        }
      }
      damageApplied = opponents.length > 0;
    } else {
      // Wrong answer - damage to self
      const player = await matchRepository.getParticipants(gameId);
      const playerState = player.find((p) => p.id === userId);
      if (playerState) {
        newHealth = Math.max(0, playerState.health - damage);
        await matchRepository.updateHealth(userId, gameId, newHealth);
        damageApplied = true;
      }
    }

    // 9. Mark battle room as finished
    await battleRoomService.updateBattleRoomStatus(battleRoomId, "finished");

    // 10. Check if all battle rooms are finished
    const allFinished = await battleRoomService.areAllBattlesFinished(
      gameId,
      roundNumber
    );

    if (allFinished) {
      console.log(
        `[RoundService] All battle rooms finished for round ${roundNumber}`
      );

      // Update match_rounds
      await supabase
        .from("match_rounds")
        .update({
          all_battles_finished: true,
          damage_applied: true,
          status: "finished",
          updated_at: new Date().toISOString(),
        })
        .eq("game_room_id", gameId)
        .eq("round_number", roundNumber);

      // 11. Check game end condition
      const shouldEnd = await this.checkGameEndCondition(gameId);
      if (shouldEnd) {
        await this.endGame(gameId);
      } else {
        // Prepare next round
        await this.prepareNextRound(gameId, roundNumber);
      }
    }

    return {
      success: true,
      is_correct: answerDetail.is_correct,
      damage_applied: damageApplied,
      new_health: answerDetail.is_correct ? 100 : newHealth,
      message: answerDetail.is_correct ? "Correct answer!" : "Wrong answer",
    };
  },

  /**
   * Handle timeout for a battle room (no one answered)
   */
  async handleTimeout(
    battleRoomId: string,
    gameId: string,
    roundNumber: number
  ): Promise<void> {
    console.log(
      `[RoundService] Handling timeout for battle room ${battleRoomId}`
    );

    const supabase = await createClient();

    // Get battle room info
    const { data: battleRoom } = await supabase
      .from("battle_rooms")
      .select("*")
      .eq("battle_room_id", battleRoomId)
      .single();

    if (!battleRoom) return;

    // Get question metadata to calculate damage
    const { data: questionData } = await supabase
      .from("questions")
      .select("question_order, game_rooms(total_question)")
      .eq("question_id", battleRoom.question_id)
      .single();

    if (!questionData) return;

    const currentOrder = questionData.question_order;
    const totalQuestions =
      (questionData.game_rooms as any).total_question || 20;

    // Calculate damage
    const damage = this.calculateDamage(currentOrder, totalQuestions);

    // Apply damage to all players in the battle room
    const players = [
      battleRoom.player1_id,
      battleRoom.player2_id,
      battleRoom.player3_id,
    ].filter((id): id is string => id !== null);

    for (const playerId of players) {
      const player = await matchRepository.getParticipants(gameId);
      const playerState = player.find((p) => p.id === playerId);
      if (playerState && playerState.health > 0) {
        const healthAfterDamage = Math.max(0, playerState.health - damage);
        await matchRepository.updateHealth(playerId, gameId, healthAfterDamage);
      }
    }

    // Mark battle room as timeout
    await battleRoomService.updateBattleRoomStatus(battleRoomId, "timeout");

    // Check if all battle rooms are finished
    const allFinished = await battleRoomService.areAllBattlesFinished(
      gameId,
      roundNumber
    );

    if (allFinished) {
      console.log(
        `[RoundService] All battle rooms finished (with timeout) for round ${roundNumber}`
      );

      // Update match_rounds
      await supabase
        .from("match_rounds")
        .update({
          all_battles_finished: true,
          damage_applied: true,
          status: "finished",
          updated_at: new Date().toISOString(),
        })
        .eq("game_room_id", gameId)
        .eq("round_number", roundNumber);

      // Check game end condition
      const shouldEnd = await this.checkGameEndCondition(gameId);
      if (shouldEnd) {
        await this.endGame(gameId);
      } else {
        // Prepare next round
        await this.prepareNextRound(gameId, roundNumber);
      }
    }
  },

  /**
   * Calculate damage based on round number and total questions
   * Formula: Damage = 5 + (n / N) * 20
   * n = round number
   * N = total questions
   */
  calculateDamage(roundNumber: number, totalQuestions: number): number {
    if (!totalQuestions || totalQuestions === 0) return 20;
    const damage = 5 + (roundNumber / totalQuestions) * 20;
    return Math.floor(damage);
  },

  /**
   * Check if game should end:
   * 1. Only 1 player alive
   * 2. All rounds completed
   */
  async checkGameEndCondition(gameId: string): Promise<boolean> {
    const supabase = await createClient();

    // 1. Check alive players
    const { data: players } = await supabase
      .from("game_players")
      .select("health, status")
      .eq("game_room_id", gameId);

    const alivePlayers = (players || []).filter(
      (p: any) => p.health > 0 && p.status === "alive"
    );

    if (alivePlayers.length <= 1) {
      console.log(
        `[RoundService] Game should end - only ${alivePlayers.length} players alive`
      );
      return true;
    }

    // 2. Check if all rounds completed
    const { data: room } = await supabase
      .from("game_rooms")
      .select("total_question")
      .eq("game_room_id", gameId)
      .single();

    if (!room) return false;

    const { data: lastRound } = await supabase
      .from("match_rounds")
      .select("round_number")
      .eq("game_room_id", gameId)
      .order("round_number", { ascending: false })
      .limit(1)
      .single();

    if (lastRound && lastRound.round_number >= room.total_question) {
      console.log(
        `[RoundService] Game should end - all ${room.total_question} rounds completed`
      );
      return true;
    }

    return false;
  },

  /**
   * End the game:
   * 1. Update room status to 'finished'
   * 2. Calculate and save final results
   * 3. Delete game_players data
   */
  async endGame(gameId: string): Promise<void> {
    console.log(`[RoundService] Ending game ${gameId}`);

    const supabase = await createClient();

    // 1. Update room status
    await supabase
      .from("game_rooms")
      .update({
        room_status: "finished",
        updated_at: new Date().toISOString(),
      })
      .eq("game_room_id", gameId);

    // 2. Get final standings
    const { data: players } = await supabase
      .from("game_players")
      .select("user_id, health")
      .eq("game_room_id", gameId)
      .order("health", { ascending: false });

    // 3. Update user_games with trophy/coins (simplified - adjust based on your requirements)
    if (players && players.length > 0) {
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const placement = i + 1;
        const trophy_won = placement === 1 ? 50 : 0;
        const coins_earned = placement === 1 ? 100 : placement === 2 ? 50 : 20;

        await supabase
          .from("user_games")
          .update({
            trophy_won,
            coins_earned,
            updated_at: new Date().toISOString(),
          })
          .eq("game_room_id", gameId)
          .eq("user_id", player.user_id);
      }
    }

    // 4. Delete game_players data
    await supabase.from("game_players").delete().eq("game_room_id", gameId);

    console.log(`[RoundService] Game ${gameId} ended successfully`);
  },

  /**
   * Prepare next round:
   * Create match_rounds record for next round
   */
  async prepareNextRound(
    gameId: string,
    currentRoundNumber: number
  ): Promise<void> {
    const nextRoundNumber = currentRoundNumber + 1;

    const supabase = await createClient();

    // Create match_rounds record for next round
    await supabase.from("match_rounds").insert({
      game_room_id: gameId,
      round_number: nextRoundNumber,
      status: "waiting",
      all_battles_finished: false,
      damage_applied: false,
    });

    console.log(
      `[RoundService] Prepared next round ${nextRoundNumber} for game ${gameId}`
    );
  },
};
