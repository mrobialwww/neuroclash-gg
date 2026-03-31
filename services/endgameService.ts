import { createClient } from "@/lib/supabase/server";
import { endgameRepository } from "@/repository/endgameRepository";
import { calculateRewards } from "@/lib/game/rewardCalculator";
import { parseDBDate, calculateDuration } from "@/lib/utils/dateUtils";
import { GAME_CONSTANTS } from "@/lib/game/gameConstants";

export interface EndgameResult {
  userId: string;
  username: string;
  characterImage: string;
  baseCharacter: string;
  placement: number;
  trophyWon: number;
  coinsEarned: number;
  health: number;
  isAlive: boolean;
  deathRound: number;
  answerTime: number; // For tie-breaker
  win: number;
  lose: number;
  coinBoost: number;
  trophyBoost: number;
}

export const endgameService = {
  /**
   * Calculates match results from raw database data.
   * Business Logic: Ranking, Reward Formulas (Coins, Trophies), Win/Loss counts.
   */
  async calculateMatchResults(
    roomId: string,
    supabaseClient?: any
  ): Promise<EndgameResult[]> {
    const supabase = supabaseClient || (await createClient());

    // 1. Parallelize initial fetches
    const [{ data: players, error: playerError }, { data: gameRoomData }] =
      await Promise.all([
        endgameRepository.getGamePlayers(roomId, supabase),
        endgameRepository.getGameRoom(roomId, supabase),
      ]);

    if (playerError || !players) {
      console.error("[EndgameService] Error fetching players:", playerError);
      return [];
    }

    const totalPlayers = players.length;
    if (totalPlayers === 0) return [];

    const N = gameRoomData?.total_round || GAME_CONSTANTS.DEFAULT_TOTAL_ROUNDS;
    const Ef =
      1 +
      Math.max(0, N - GAME_CONSTANTS.EFFICIENCY_BASE_ROUNDS) *
        GAME_CONSTANTS.EFFICIENCY_INCREMENT_SCALE;

    const userIds = players.map((p: any) => p.user_id);

    // 2. Parallelize data enrichment fetches
    const [
      { data: chars },
      { data: answersData },
      { data: earlyRound },
      { data: abilitiesData },
      { data: battleRooms },
    ] = await Promise.all([
      endgameRepository.getUserCharacters(userIds, supabase),
      endgameRepository.getUserAnswers(roomId, supabase),
      endgameRepository.getEarliestRoundTime(roomId, supabase),
      supabase
        .from("ability_players")
        .select("user_id, ability_id, stock")
        .eq("game_room_id", roomId),
      endgameRepository.getBattleRooms(roomId, supabase),
    ]);

    const charMap = new Map();
    if (chars) {
      chars.forEach((c: any) => {
        const charDetail = Array.isArray(c.characters)
          ? c.characters[0]
          : c.characters;
        charMap.set(c.user_id, charDetail);
      });
    }

    // 3. Win/Loss Tracking setup
    const playerWins = new Map<string, number>();
    const playerLosses = new Map<string, number>();
    userIds.forEach((id: string) => {
      playerWins.set(id, 0);
      playerLosses.set(id, 0);
    });

    // Multiplayer calculation relies on battle_rooms records
    if (totalPlayers > 1) {
      console.log(
        `[EndgameService] [${roomId}] Found ${
          battleRooms?.length || 0
        } battle rooms for wins calculation.`
      );

      const firstAnswerIds =
        battleRooms?.map((b: any) => b.first_answer_id).filter(Boolean) || [];

      console.log(
        `[EndgameService] [${roomId}] Found ${firstAnswerIds.length} battle rooms with a recorded first answer.`
      );

      const { data: correctAnswers } =
        firstAnswerIds.length > 0
          ? await endgameRepository.getCorrectAnswers(firstAnswerIds, supabase)
          : { data: [] };

      const correctnessMap = new Map();
      correctAnswers?.forEach((a: any) =>
        correctnessMap.set(a.answer_id, a.is_correct)
      );

      battleRooms?.forEach((room: any) => {
        const roomPlayers = [
          room.player1_id,
          room.player2_id,
          room.player3_id,
        ].filter(Boolean);

        if (roomPlayers.length <= 1) return;

        if (!room.first_answer_user_id) {
          roomPlayers.forEach((p) =>
            playerLosses.set(p, (playerLosses.get(p) || 0) + 1)
          );
        } else {
          const isCorrect = correctnessMap.get(room.first_answer_id);
          const answerer = room.first_answer_user_id;

          roomPlayers.forEach((p) => {
            if (isCorrect) {
              if (p === answerer)
                playerWins.set(p, (playerWins.get(p) || 0) + 1);
              else playerLosses.set(p, (playerLosses.get(p) || 0) + 1);
            } else {
              if (p === answerer)
                playerLosses.set(p, (playerLosses.get(p) || 0) + 1);
              else playerWins.set(p, (playerWins.get(p) || 0) + 1);
            }
          });
        }
      });
    }

    // 4. Map and determine individual stats
    const playersStats = players.map((p: any) => {
      const pAnswers = (answersData || []).filter(
        (a: any) => a.user_id === p.user_id
      );

      // Calculate win/loss based on game_players record (round wins) for consistency
      let winCount = p.win || 0;
      let loseCount = Math.max(0, N - winCount);

      // Use earliest match_round as more accurate start time if possible
      const matchStart = parseDBDate(
        earlyRound?.created_at ||
          gameRoomData?.updated_at ||
          gameRoomData?.created_at ||
          p.created_at
      );

      // If player is still alive, survival time is until the room finished
      const isRoomFinished = gameRoomData?.room_status === "finished";
      const matchEnd =
        p.status === "alive"
          ? isRoomFinished
            ? parseDBDate(gameRoomData?.updated_at)
            : Date.now()
          : parseDBDate(p.updated_at);

      const survivalTime = calculateDuration(matchStart, matchEnd);

      const userObj = Array.isArray(p.users) ? p.users[0] : p.users;
      const cData = charMap.get(p.user_id);

      return {
        userId: p.user_id,
        username: userObj?.username || "Unknown",
        totalTrophy: userObj?.total_trophy || 0,
        characterImage: cData?.image_url || "/default/Slime.webp",
        baseCharacter: cData?.skin_name || "Slime",
        health: p.health || 0,
        status: p.status,
        deathRound:
          p.status !== "alive"
            ? pAnswers.length > 0
              ? Math.max(...pAnswers.map((a: any) => a.round_number))
              : 0
            : 999,
        answerCount: pAnswers.length,
        win: winCount,
        lose: loseCount,
        survivalTime,
      };
    });

    // 5. Determine Placements via Sorting
    playersStats.sort((a, b) => {
      const aAlive = a.status === "alive";
      const bAlive = b.status === "alive";
      if (aAlive && !bAlive) return -1;
      if (!aAlive && bAlive) return 1;
      if (aAlive && bAlive) {
        if (a.health !== b.health) return b.health - a.health;
      } else {
        if (a.deathRound !== b.deathRound) return b.deathRound - a.deathRound;
      }
      return b.answerCount - a.answerCount;
    });

    // 6. Final reward calculation loop
    return playersStats.map((p, index) => {
      const Rank = index + 1;

      // Ability Boosts (Multiplier) from match records
      let coinBoost = 0;
      let trophyBoost = 0;

      const pAbilities = (abilitiesData || []).filter(
        (a: any) => a.user_id === p.userId
      );

      // PIALA KEJAYAAN (ID 5) = Trophy Multiplier
      const piala = pAbilities.find(
        (a: any) => a.ability_id === GAME_CONSTANTS.TROPHY_BUFF_ID
      );
      if (piala)
        trophyBoost = Math.round(
          piala.stock * GAME_CONSTANTS.BUFF_PERCENT_PER_STOCK
        );

      // KANTONG HARTA (ID 6) = Coin Multiplier
      const kantong = pAbilities.find(
        (a: any) => a.ability_id === GAME_CONSTANTS.COIN_BUFF_ID
      );
      if (kantong)
        coinBoost = Math.round(
          kantong.stock * GAME_CONSTANTS.BUFF_PERCENT_PER_STOCK
        );

      // Use shared calculator for consistenty
      console.log(
        `[EndgameService] Calculating rewards for ${p.username}: Rank=${Rank}, Wins=${p.win}, N=${N}, totalPlayers=${totalPlayers}`
      );
      const { trophyWon, coinsEarned } = calculateRewards({
        rank: Rank,
        totalPlayers,
        totalRounds: N,
        wins: p.win,
        losses: p.lose,
        coinBoost,
        trophyBoost,
      });

      return {
        userId: p.userId,
        username: p.username,
        characterImage: p.characterImage,
        baseCharacter: p.baseCharacter,
        placement: Rank,
        trophyWon,
        coinsEarned,
        health: p.health,
        isAlive: p.status === "alive",
        deathRound: p.deathRound === 999 ? 0 : p.deathRound,
        answerTime: p.answerCount,
        survivalTime: p.survivalTime,
        win: p.win,
        lose: p.lose,
        coinBoost,
        trophyBoost,
      };
    });
  },

  /**
   * Centralized IDEMPOTENT endgame processing.
   * Logic: Reward calculations, ability multipliers, database updates for all players.
   *
   * Flow:
   * 1. Atomically transition room_status from "ongoing"/"playing" → "processing" (lock)
   * 2. Calculate and persist ALL rewards to user_games + users tables
   * 3. Set room_status → "finished" only AFTER all rewards are persisted
   *
   * This ensures rewards are ALWAYS written before the room is marked finished,
   * preventing the race condition where concurrent calls see "finished" and skip.
   */
  async processCentralizedRewards(
    roomId: string,
    supabaseClient?: unknown
  ): Promise<void> {
    const reqId = Math.random().toString(36).substring(2, 7).toUpperCase();
    console.log(
      `[${reqId}] [EndgameService] Processing rewards for room ${roomId}`
    );
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    try {
      // Step 1: Read current room status
      console.log(
        `[${reqId}] [EndgameService] Step 1: Checking status for room ${roomId}`
      );
      const { data: room } = await endgameRepository.getGameRoom(
        roomId,
        adminSupabase
      );

      if (!room) {
        console.error(`[EndgameService] Room ${roomId} not found in DB.`);
        return;
      }

      console.log(
        `[${reqId}] [EndgameService] [${roomId}] Current room_status: "${room.room_status}"`
      );

      // If room is already "finished", rewards have already been persisted — skip.
      if (room.room_status === "finished") {
        console.log(
          `[${reqId}] [EndgameService] [${roomId}] Room already finished (rewards already persisted). [SKIPPED]`
        );
        return;
      }

      // If "processing", check if it's stale (timeout-based lock)
      if (room.room_status === "processing") {
        const lastUpdate = new Date(room.updated_at).getTime();
        const now = Date.now();
        if (now - lastUpdate < 30000) {
          // 30 seconds
          console.log(
            `[${reqId}] [EndgameService] [${roomId}] Room is currently being processed by another worker (updated < 30s ago). [SKIPPED]`
          );
          return;
        }
        console.log(
          `[${reqId}] [EndgameService] [${roomId}] Room processing seems stale (>30s). Overriding lock for retry...`
        );
      }

      // Step 2 & 3: Calculate BEFORE Locking
      // Constants & Preparation
      const { data: maxRank } = await endgameRepository.getRankInfo(
        GAME_CONSTANTS.MAX_STATS_RANK_ID,
        adminSupabase
      );
      const MAX_TROPHY_LIMIT =
        maxRank?.max_trophy || GAME_CONSTANTS.DEFAULT_MAX_TROPHY;

      console.log(
        `[${reqId}] [EndgameService] Step 2: Calculating results for room ${roomId} (In-Memory prior to lock)`
      );
      const results = await this.calculateMatchResults(roomId, adminSupabase);

      const firstResult = results && results.length > 0 ? results[0] : null;
      console.log(
        `[${reqId}] [EndgameService] Step 3: Results calculated. Count: ${results.length}. First Player: ${firstResult?.username}, Trophy: ${firstResult?.trophyWon}, Coin: ${firstResult?.coinsEarned}`
      );

      if (results.length === 0) {
        console.warn(
          `[${reqId}] [EndgameService] No players found for room ${roomId}, nothing to process. Set finish later.`
        );
        return;
      }

      // Step 4: Atomically CAS room_status → "processing" to acquire the lock.
      // Only the FIRST caller whose CAS succeeds will proceed.
      console.log(
        `[${reqId}] [EndgameService] Step 4: Acquiring lock by marking room ${roomId} "processing" (Current Step 1 state: status="${room.room_status}", updated_at="${room.updated_at}")...`
      );

      // Attempt 1: Regular transition from playing/ongoing
      let { data: lockedRoom, error: lockError } = await adminSupabase
        .from("game_rooms")
        .update({
          room_status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("game_room_id", roomId)
        .in("room_status", ["open", "playing"])
        .select();

      // Attempt 2: If attempt 1 failed, check if we can override a stale "processing" lock
      if (
        !lockError &&
        (!lockedRoom || lockedRoom.length === 0) &&
        room.room_status === "processing"
      ) {
        console.log(
          `[EndgameService] [${roomId}] Initial lock failed, checking for stale override...`
        );
        const isStale =
          new Date().getTime() - new Date(room.updated_at).getTime() > 30000;

        if (isStale) {
          console.log(`[EndgameService] [${roomId}] Overriding stale lock...`);
          const staleRes = await adminSupabase
            .from("game_rooms")
            .update({
              room_status: "processing",
              updated_at: new Date().toISOString(),
            })
            .eq("game_room_id", roomId)
            .eq("room_status", "processing")
            .eq("updated_at", room.updated_at) // Atomic version check
            .select();

          lockedRoom = staleRes.data;
          lockError = staleRes.error;
        }
      }

      if (lockError || !lockedRoom || lockedRoom.length === 0) {
        console.log(
          `[${reqId}] [EndgameService] [${roomId}] Lock failed. Status: ${
            room.room_status
          }. Error: ${JSON.stringify(lockError)}. LockedRoom: ${JSON.stringify(
            lockedRoom
          )} [LOSER]`
        );
        return;
      }

      console.log(
        `[${reqId}] [EndgameService] [${roomId}] [WINNER] Lock acquired (status → "processing"). Proceeding with data persistence...`
      );

      // Step 5: Persist rewards for each player BEFORE setting room to "finished"
      console.log(
        `[${reqId}] [EndgameService] Step 5: Persisting rewards for ${results.length} players`
      );
      await Promise.all(
        results.map(async (player) => {
          try {
            console.log(
              `[${reqId}] [EndgameService] [${player.username}] Fetching current global stats for ${player.userId}`
            );
            const { data: userData, error: userFetchError } =
              await endgameRepository.getUserData(player.userId, adminSupabase);

            if (userFetchError || !userData) {
              console.error(
                `[${reqId}] [EndgameService] [${player.username}] Could not fetch user data for ${player.userId}:`,
                userFetchError
              );
              return;
            }

            const finalTrophy = player.trophyWon;
            const finalCoin = player.coinsEarned;
            const isRank1 = player.placement === 1;

            console.log(
              `[${reqId}] [EndgameService] [${player.username}] Persisting: Trophy_Add=${finalTrophy}, Coin_Add=${finalCoin}, Rank=${player.placement}`
            );

            // Update user's match performance in user_games
            const { error: ugError } = await endgameRepository.updateUserGame(
              player.userId,
              roomId,
              {
                trophy_won: finalTrophy,
                coins_earned: finalCoin,
                win: player.win,
                lose: player.lose,
              },
              adminSupabase
            );

            if (ugError) {
              console.error(
                `[${reqId}] [EndgameService] Error updating user_games for ${player.userId}:`,
                ugError
              );
            } else {
              console.log(
                `[${reqId}] [EndgameService] [${player.username}] user_games updated successfully`
              );
            }

            // Update user's global stats
            let newTrophy = (userData.total_trophy || 0) + finalTrophy;
            newTrophy = Math.max(0, Math.min(newTrophy, MAX_TROPHY_LIMIT));

            // placement_ratio += (placement / max_players)
            const currentMatchRatio = player.placement / results.length;

            const { error: statError } =
              await endgameRepository.updateUserStats(
                player.userId,
                {
                  total_trophy: newTrophy,
                  coin: (userData.coin || 0) + finalCoin,
                  total_match: (userData.total_match || 0) + 1,
                  total_rank_1:
                    (userData.total_rank_1 || 0) + (isRank1 ? 1 : 0),
                  placement_ratio:
                    (userData.placement_ratio || 0) + currentMatchRatio,
                },
                adminSupabase
              );

            if (statError) {
              console.error(
                `[${reqId}] [EndgameService] Error updating global stats for ${player.userId}:`,
                statError
              );
            } else {
              console.log(
                `[${reqId}] [EndgameService] [${
                  player.username
                }] Global stats updated: Trophy=${newTrophy}, Coin=${
                  (userData.coin || 0) + finalCoin
                }, Rank1=${isRank1}`
              );
            }
          } catch (err) {
            console.error(
              `[EndgameService] Fatal error processing user ${player.userId}:`,
              err
            );
          }
        })
      );

      console.log(
        `[${reqId}] [EndgameService] Step 6: Marking room ${roomId} as "finished" (from "processing") after successful persistence.`
      );
      const { data: finishedRoom, error: finishError } = await adminSupabase
        .from("game_rooms")
        .update({
          room_status: "finished",
          updated_at: new Date().toISOString(),
        })
        .eq("game_room_id", roomId)
        .eq("room_status", "processing") // ONLY if we still hold the lock!
        .select();

      if (finishError || !finishedRoom || finishedRoom.length === 0) {
        console.log(
          `[${reqId}] [EndgameService] [${roomId}] CRITICAL: Could not finalize room to "finished". This process might have lost its lock or was already finished.`
        );
      } else {
        console.log(
          `[${reqId}] [EndgameService] ✅ [SUCCESS] Rewards successfully processed and persisted for room ${roomId}. Room is now: ${JSON.stringify(
            finishedRoom[0].room_status
          )}`
        );
      }
    } catch (error: any) {
      console.error(
        `[EndgameService] FATAL ERROR in processCentralizedRewards for room ${roomId}:`,
        error
      );

      // Recovery: if we crashed mid-processing, try to revert status back to original 'playing' or 'ongoing' so another caller can retry
      try {
        console.log(
          `[EndgameService] [${roomId}] Attempting to revert "processing" status to "playing" for recovery...`
        );

        // Re-init admin client just in case
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminSupabase = createAdminClient();

        await adminSupabase
          .from("game_rooms")
          .update({
            room_status: "playing",
            updated_at: new Date().toISOString(),
          })
          .eq("game_room_id", roomId)
          .eq("room_status", "processing"); // Only revert if still in "processing" (our lock)
        console.log(
          `[EndgameService] [${roomId}] Status reverted to "playing" for retry by next caller.`
        );
      } catch (revertError) {
        console.error(
          `[EndgameService] [${roomId}] Failed to revert status:`,
          revertError
        );
      }
    }
  },
};
