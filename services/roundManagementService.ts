import { battleRoomService, BattleRoom } from "./battleRoomService";
import { matchRepository } from "@/repository/matchRepository";
import { createClient } from "@/lib/supabase/client";
import { endgameService } from "./endgameService";
import { useStarboxStore } from "@/store/useStarboxStore";
import { abilityPlayerRepository } from "@/repository/abilityPlayerRepository";

export const roundManagementService = {
  /**
   * Start a new round:
   * 1. Generate battle rooms (cleanup old ones first)
   * 2. Assign questions to each battle room
   * 3. Update match_rounds status
   */
  async startRound(gameId: string, roundNumber: number, questions: { question_id: string }[]): Promise<BattleRoom[]> {
    console.log(`[RoundService] ==================================================`);
    console.log(`[RoundService] Starting round ${roundNumber} for game ${gameId}`);
    console.log(`[RoundService] ==================================================`);

    // 1. Generate battle rooms (ini sudah menghapus old ones di dalam)
    const battleRooms = await battleRoomService.generateBattleRooms(gameId, roundNumber, questions);

    if (battleRooms.length === 0) {
      console.log(`[RoundService] No battle rooms generated - checking if game should end`);
      // Check if game should end
      const shouldEnd = await this.checkGameEndCondition(gameId);
      if (shouldEnd) {
        await this.endGame(gameId);
      }
      return [];
    }

    // 2. Update battle room status to 'ongoing'
    console.log(`[RoundService] Updating ${battleRooms.length} battle rooms to 'ongoing'`);
    for (const battleRoom of battleRooms) {
      await battleRoomService.updateBattleRoomStatus(battleRoom.battle_room_id, "ongoing");
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

    console.log(`[RoundService] ==================================================`);
    console.log(`[RoundService] Round ${roundNumber} started with ${battleRooms.length} battle rooms`);
    console.log(`[RoundService] ==================================================`);

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
    roundNumber: number,
  ): Promise<{
    success: boolean;
    is_correct: boolean;
    damage_applied: boolean;
    new_health: number;
    message: string;
  }> {
    console.log(`[RoundService] ==================================================`);
    console.log(`[RoundService] Processing answer from user ${userId} in battle room ${battleRoomId}`);
    console.log(`[RoundService] Answer ID: ${answerId}, Game ID: ${gameId}, Round: ${roundNumber}`);
    console.log(`[RoundService] ==================================================`);

    const supabase = await createClient();

    // 1. Get battle room info
    const battleRoom = await battleRoomService.getBattleRoomForPlayer(gameId, userId, roundNumber);

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
    if (battleRoom.first_answer_user_id && battleRoom.first_answer_user_id !== userId) {
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Another player already answered in this battle room",
      };
    }

    // 3. Get answer details
    console.log(`[RoundService] Step 2: Fetching answer details for ${answerId.substring(0, 8)}...`);
    const answerDetail = await matchRepository.getAnswerDetail(answerId);
    if (!answerDetail) {
      console.error(`[RoundService] ❌ Answer not found: ${answerId}`);
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Answer not found",
      };
    }
    console.log(`[RoundService] ✅ Answer found: is_correct=${answerDetail.is_correct}`);

    // 4. Record the answer
    console.log(`[RoundService] Step 3: Recording answer to user_answers...`);
    await matchRepository.submitAnswer(userId, answerId, gameId, roundNumber);
    console.log(`[RoundService] ✅ Answer recorded`);

    // 5. Check if this is the first answer BEFORE recording (for win tracking)
    const isFirstAnswer = !battleRoom.first_answer_user_id;
    console.log(`[RoundService] isFirstAnswer check: ${isFirstAnswer}, current first_answer_user_id: ${battleRoom.first_answer_user_id}`);

    // 6. If this is the first answer, record it in battle room
    if (isFirstAnswer) {
      console.log(`[RoundService] Step 4: Recording first answer...`);
      await battleRoomService.recordFirstAnswer(battleRoomId, userId, answerId);
      console.log(`[RoundService] ✅ First answer recorded in battle room`);

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
    // 7. Get question metadata to calculate damage
    // Fetch question and game_room separately to avoid JOIN issues
    const { data: questionData } = await supabase
      .from("questions")
      .select("question_order, game_room_id")
      .eq("question_id", answerDetail.question_id)
      .single();

    if (!questionData) {
      console.error(`[RoundService] ❌ Question not found for question_id: ${answerDetail.question_id}`);
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Question not found",
      };
    }

    // Fetch game_room separately to get total_round
    const { data: gameRoomData } = await supabase.from("game_rooms").select("total_round").eq("game_room_id", questionData.game_room_id).single();

    if (!gameRoomData) {
      console.error(`[RoundService] ❌ Game room not found for game_room_id: ${questionData.game_room_id}`);
      return {
        success: false,
        is_correct: false,
        damage_applied: false,
        new_health: 100,
        message: "Game room not found",
      };
    }

    console.log(`[RoundService] Question order: ${questionData.question_order}, Total rounds: ${gameRoomData.total_round}`);

    const currentOrder = questionData.question_order;
    const totalQuestions = gameRoomData.total_round || 20;

    // 7. Calculate damage
    const damage = this.calculateDamage(currentOrder, totalQuestions);

    // [BARU] Ambil buff aktif user dari DB untuk Attack (+10) / Shield (-20)
    const myBuff = await matchRepository.getActiveAbilityBuff(gameId, userId);

    // 8. Apply damage based on correctness
    let damageApplied = false;
    let newHealth = 100;
    let isFirstAndCorrect = false;

    if (answerDetail.is_correct) {
      // Correct answer - damage to opponents in same battle room
      const opponents = [battleRoom.player1_id, battleRoom.player2_id, battleRoom.player3_id].filter(
        (id): id is string => id !== null && id !== userId,
      );

      // Jika user punya Attack buff (ability_id=2), tambah 10 kepada basenya
      const baseOffensiveDamage = damage + (myBuff === 2 ? 10 : 0);

      // [BARU] Konsumsi buff Attack jika digunakan
      if (myBuff === 2) {
        await abilityPlayerRepository.userAttackorShieldAbility(gameId, userId, 2);
        console.log(`[RoundService] User ${userId.substring(0, 8)} consumed Attack Buff`);
      }

      for (const opponentId of opponents) {
        const opponent = await matchRepository.getParticipants(gameId);
        const opponentState = opponent.find((p) => p.id === opponentId);
        if (opponentState && opponentState.health > 0) {
          // [BARU] Cek apakah musuh punya Shield (ability_id=4) untuk ngeblok -20
          const opponentBuff = await matchRepository.getActiveAbilityBuff(gameId, opponentId);
          console.log(opponentBuff);
          const finalOpponentDamage = Math.max(0, baseOffensiveDamage - (opponentBuff === 4 ? 20 : 0));

          // [BARU] Konsumsi buff Shield musuh jika digunakan
          if (opponentBuff === 4 && baseOffensiveDamage > 0) {
            await abilityPlayerRepository.userAttackorShieldAbility(gameId, opponentId, 4);
            console.log(`[RoundService] Opponent ${opponentId.substring(0, 8)} consumed Shield Buff`);
          }

          const healthAfterDamage = Math.max(0, opponentState.health - finalOpponentDamage);
          console.log(
            `[RoundService] Applying damage to opponent ${opponentId.substring(0, 8)}: ${
              opponentState.health
            } -> ${healthAfterDamage}, round=${roundNumber} (OffensiveDamage: ${baseOffensiveDamage}, OpponentBuff: ${opponentBuff})`,
          );
          await matchRepository.updateHealth(opponentId, gameId, healthAfterDamage, roundNumber);
        }
      }
      damageApplied = opponents.length > 0;

      // If first answer and correct, increment win count
      if (isFirstAnswer) {
        isFirstAndCorrect = true;
        console.log(`[RoundService] User ${userId.substring(0, 8)} answered first and correctly! Incrementing win...`);
        await matchRepository.incrementWin(userId, gameId);
      }
    } else {
      // Wrong answer - damage to self
      const player = await matchRepository.getParticipants(gameId);
      const playerState = player.find((p) => p.id === userId);
      if (playerState) {
        // [BARU] Jika user salah jawab (damage diri sendiri), tapi dia ada shield, tetap dikurangi -20
        const selfDamage = Math.max(0, damage - (myBuff === 4 ? 20 : 0));
        newHealth = Math.max(0, playerState.health - selfDamage);

        // [BARU] Konsumsi buff Shield diri sendiri jika digunakan
        if (myBuff === 4 && damage > 0) {
          await abilityPlayerRepository.userAttackorShieldAbility(gameId, userId, 4);
          console.log(`[RoundService] User ${userId.substring(0, 8)} consumed Shield Buff for self-damage`);
        }

        console.log(
          `[RoundService] Applying damage to self ${userId.substring(0, 8)}: ${
            playerState.health
          } -> ${newHealth}, round=${roundNumber} (SelfDamage: ${selfDamage})`,
        );
        await matchRepository.updateHealth(userId, gameId, newHealth, roundNumber);
        damageApplied = true;
      }
    }

    // 9. Mark battle room as finished
    await battleRoomService.updateBattleRoomStatus(battleRoomId, "finished");

    // 10. Check if all battle rooms are finished
    const allFinished = await battleRoomService.areAllBattlesFinished(gameId, roundNumber);

    if (allFinished) {
      console.log(`[RoundService] All battle rooms finished for round ${roundNumber}`);

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
  async handleTimeout(battleRoomId: string, gameId: string, roundNumber: number): Promise<void> {
    console.log(`[RoundService] Handling timeout for battle room ${battleRoomId}`);

    const supabase = await createClient();

    // Get battle room info
    const { data: battleRoom } = await supabase.from("battle_rooms").select("*").eq("battle_room_id", battleRoomId).single();

    if (!battleRoom) return;
    // Get question metadata to calculate damage
    // Fetch question and game_room separately to avoid JOIN issues
    const { data: questionData } = await supabase
      .from("questions")
      .select("question_order, game_room_id")
      .eq("question_id", battleRoom.question_id)
      .single();

    if (!questionData) {
      console.error(`[RoundService] ❌ Question not found for question_id: ${battleRoom.question_id}`);
      return;
    }

    // Fetch game_room separately to get total_round
    const { data: gameRoomData } = await supabase.from("game_rooms").select("total_round").eq("game_room_id", questionData.game_room_id).single();

    if (!gameRoomData) {
      console.error(`[RoundService] ❌ Game room not found for game_room_id: ${questionData.game_room_id}`);
      return;
    }

    const currentOrder = questionData.question_order;
    const totalQuestions = gameRoomData.total_round || 20;

    console.log(`[RoundService] Timeout - Question order: ${currentOrder}, Total rounds: ${totalQuestions}`);

    // Calculate damage
    const damage = this.calculateDamage(currentOrder, totalQuestions);

    // Apply damage to all players in the battle room
    const players = [battleRoom.player1_id, battleRoom.player2_id, battleRoom.player3_id].filter((id): id is string => id !== null);

    for (const playerId of players) {
      const player = await matchRepository.getParticipants(gameId);
      const playerState = player.find((p) => p.id === playerId);
      if (playerState && playerState.health > 0) {
        // [BARU] Seluruh player yang kena damage timeout bisa pakai shield ngeblok -20
        const playerBuff = await matchRepository.getActiveAbilityBuff(gameId, playerId);
        const finalDamage = Math.max(0, damage - (playerBuff === 4 ? 20 : 0));

        // [BARU] Konsumsi buff Shield jika digunakan saat timeout
        if (playerBuff === 4 && damage > 0) {
          await abilityPlayerRepository.userAttackorShieldAbility(gameId, playerId, 4);
          console.log(`[RoundService] [Timeout] Player ${playerId.substring(0, 8)} consumed Shield Buff`);
        }

        const healthAfterDamage = Math.max(0, playerState.health - finalDamage);
        console.log(
          `[RoundService] [Timeout] Applying damage to ${playerId.substring(0, 8)}: ${
            playerState.health
          } -> ${healthAfterDamage}, round=${roundNumber}`,
        );
        await matchRepository.updateHealth(playerId, gameId, healthAfterDamage, roundNumber);
      }
    }

    // Mark battle room as timeout
    await battleRoomService.updateBattleRoomStatus(battleRoomId, "timeout");

    // Check if all battle rooms are finished
    const allFinished = await battleRoomService.areAllBattlesFinished(gameId, roundNumber);

    if (allFinished) {
      console.log(`[RoundService] All battle rooms finished (with timeout) for round ${roundNumber}`);

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
    let damage = 5 + (roundNumber / totalQuestions) * 20;

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
    const { data: players } = await supabase.from("game_players").select("user_id, health, status").eq("game_room_id", gameId);

    const alivePlayers = (players || []).filter((p: any) => p.health > 0 && p.status === "alive");

    console.log(`[RoundService] Checking game end condition - alive players: ${alivePlayers.length}, total players: ${players?.length || 0}`);

    if (alivePlayers.length <= 1) {
      console.log(`[RoundService] Game should end - only ${alivePlayers.length} players alive`);
      return true;
    }

    // 2. Check if all rounds completed
    const { data: room } = await supabase.from("game_rooms").select("total_round").eq("game_room_id", gameId).single();

    if (!room) {
      console.error(`[RoundService] Game room not found for game_id: ${gameId}`);
      return false;
    }

    const { data: lastRound } = await supabase
      .from("match_rounds")
      .select("round_number")
      .eq("game_room_id", gameId)
      .order("round_number", { ascending: false })
      .limit(1)
      .single();

    if (lastRound && lastRound.round_number >= room.total_round) {
      console.log(
        `[RoundService] Game should end - all ${room.total_round} rounds completed (current: ${lastRound.round_number}/${room.total_round})`,
      );
      return true;
    }

    console.log(`[RoundService] Game should NOT end - continuing to round ${lastRound ? lastRound.round_number + 1 : 2}`);

    return false;
  },

  /**
   * End the game:
   * 1. Update room status to 'finished'
   * 2. Calculate and save final results based on survival order
   * 3. Broadcast game end to all clients
   * 4. Delete game_players data
   *
   * Placement logic:
   * - First eliminated = last place (e.g., 4th)
   * - Last survivor = 1st place (winner)
   */
  async endGame(gameId: string): Promise<void> {
    console.log(`[RoundService] ==================================================`);
    console.log(`[RoundService] Ending game ${gameId}`);
    console.log(`[RoundService] ==================================================`);

    const supabase = await createClient();

    // Call Centralized Atomic Endgame Processing
    // This will calculate final trophies, coins, Win/Loss, apply abilities,
    // persist everything to user_games and users, and finally set room_status to "finished".
    await endgameService.processCentralizedRewards(gameId);

    // 1. Update room status
    await supabase
      .from("game_rooms")
      .update({
        room_status: "finished",
        updated_at: new Date().toISOString(),
      })
      .eq("game_room_id", gameId);

    // 2. Get final standings
    // Sort by eliminated_at ASC NULLS LAST:
    // - Players who died first (earliest eliminated_at) come first
    // - Players still alive (NULL eliminated_at) come last
    const { data: players } = await supabase
      .from("game_players")
      .select("user_id, health, win, eliminated_at, status")
      .eq("game_room_id", gameId)
      .order("eliminated_at", { ascending: true, nullsFirst: false });

    const totalPlayers = players?.length || 0;
    console.log(`[RoundService] Found ${totalPlayers} players in game_players`);

    // 3. Broadcast game end to all clients via realtime
    const channel = supabase.channel(`room:${gameId}`);
    await channel.send({
      type: "broadcast",
      event: "game_ended",
      payload: {
        game_room_id: gameId,
        message: "Game has ended!",
        players: players || [],
      },
    });

    // NOTE: game_players is deliberately NOT deleted here so the endgame stats page can fetch players.

    console.log(`[RoundService] ==================================================`);
    console.log(`[RoundService] Game ${gameId} ended successfully`);
    console.log(`[RoundService] ==================================================`);
  },

  /**
   * Prepare next round:
   * Create match_rounds record for next round
   */
  async prepareNextRound(gameId: string, currentRoundNumber: number): Promise<void> {
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

    console.log(`[RoundService] Prepared next round ${nextRoundNumber} for game ${gameId}`);
  },
};
