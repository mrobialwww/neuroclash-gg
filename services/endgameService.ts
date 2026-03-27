import { createClient } from "@/lib/supabase/server";
import { endgameRepository } from "@/repository/endgameRepository";

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

    // 1. Fetch participants and basic room info
    const { data: players, error: playerError } =
      await endgameRepository.getGamePlayers(roomId, supabase);

    if (playerError || !players) {
      console.error("[EndgameService] Error fetching players:", playerError);
      return [];
    }

    const totalPlayers = players.length;
    if (totalPlayers === 0) return [];

    const { data: gameRoomData } = await endgameRepository.getGameRoom(
      roomId,
      supabase
    );
    const N = gameRoomData?.total_round || 15;
    const Ef = 1 + Math.max(0, N - 15) * 0.01;

    // 2. Fetch characters and answer history
    const userIds = players.map((p: any) => p.user_id);
    const { data: chars } = await endgameRepository.getUserCharacters(
      userIds,
      supabase
    );
    const { data: answersData } = await endgameRepository.getUserAnswers(
      roomId,
      supabase
    );

    // Fetch abilities for all players in this room to apply boosts
    const { data: abilitiesData } = await supabase
      .from("ability_players")
      .select("user_id, ability_id, stock")
      .eq("game_room_id", roomId);

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
      const { data: battleRooms } = await endgameRepository.getBattleRooms(
        roomId,
        supabase
      );
      const firstAnswerIds =
        battleRooms?.map((b: any) => b.first_answer_id).filter(Boolean) || [];

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

      // Calculate win/loss based on answer correctness for all modes (Solo and Multiplayer)
      // This ensures "17 Menang - 3 Kalah" consistency as requested by the user.
      let winCount = pAnswers.filter((a: any) => {
        const ansData = a.answers || a.answer;
        const ans = Array.isArray(ansData) ? ansData[0] : ansData;
        return ans?.is_correct === true;
      }).length;
      let loseCount = Math.max(0, N - winCount);

      let deathRound = 999;
      if (p.status !== "alive") {
        deathRound =
          pAnswers.length > 0
            ? Math.max(...pAnswers.map((a: any) => a.round_number))
            : 0;
      }

      const totalSeconds = (deathRound !== 999 ? deathRound : N) * 20; // Assuming 20 seconds per round
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      const survivalTime = `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;

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
        deathRound,
        answerCount: pAnswers.length,
        win: winCount,
        lose: loseCount,
        survivalTime, // Add survivalTime here
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
      let baseCoin = 0;
      let baseTrophy = 0;

      if (totalPlayers === 1) {
        // Solo Mode Rewards
        baseCoin = p.win * 15 + p.lose * 5;
        baseTrophy = Math.round(Math.max(0, p.win * 1.2 - p.lose * 0.5));
      } else {
        // Multiplayer Rewards
        const BaseCoin =
          200 + (600 * (totalPlayers - Rank)) / (totalPlayers - 1);
        baseCoin = Math.round(BaseCoin * Ef);

        const dynamicScale = Math.max(2, 10 - Math.floor(totalPlayers / 5));
        const boundary = Math.floor(totalPlayers / 2);
        let TrophyBase =
          Rank <= boundary
            ? 20 + (boundary - Rank) * dynamicScale
            : -(15 + (Rank - boundary - 1) * dynamicScale);
        baseTrophy = Math.round(TrophyBase * Ef);
      }

      // Apply Ability Boosts (Multiplier)
      let coinBoost = 0;
      let trophyBoost = 0;

      const pAbilities = (abilitiesData || []).filter(
        (a: any) => a.user_id === p.userId
      );

      // PIALA KEJAYAAN (ID 5) = Trophy Multiplier
      const piala = pAbilities.find((a: any) => a.ability_id === 5);
      if (piala) trophyBoost = Math.round(piala.stock * 5); // 5% per stock

      // KANTONG HARTA (ID 6) = Coin Multiplier
      const kantong = pAbilities.find((a: any) => a.ability_id === 6);
      if (kantong) coinBoost = Math.round(kantong.stock * 5); // 5% per stock

      // If trophy/coin is negative, boost should REDUCE the penalty (make it closer to 0)
      // Formula: final = base + abs(base * boost/100)
      const finalTrophy = baseTrophy >= 0
        ? Math.round(baseTrophy * (1 + trophyBoost / 100))
        : Math.round(baseTrophy + Math.abs(baseTrophy * (trophyBoost / 100)));

      const finalCoin = baseCoin >= 0
        ? Math.round(baseCoin * (1 + coinBoost / 100))
        : Math.round(baseCoin + Math.abs(baseCoin * (coinBoost / 100)));

      return {
        userId: p.userId,
        username: p.username,
        characterImage: p.characterImage,
        baseCharacter: p.baseCharacter,
        placement: Rank,
        trophyWon: finalTrophy,
        coinsEarned: finalCoin,
        health: p.health,
        isAlive: p.status === "alive",
        deathRound: p.deathRound === 999 ? 0 : p.deathRound,
        answerTime: p.answerCount,
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
   */
  async processCentralizedRewards(roomId: string): Promise<void> {
    console.log(`[EndgameService] Processing rewards for room ${roomId}`);
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    // 1. Idempotency Check
    const { data: room } = await endgameRepository.getGameRoom(
      roomId,
      adminSupabase
    );
    if (!room || room.room_status === "finished") return;

    // 2. Constants & Preparation
    const { data: maxRank } = await endgameRepository.getRankInfo(
      6,
      adminSupabase
    );
    const MAX_TROPHY_LIMIT = maxRank?.max_trophy || 3000;

    const results = await this.calculateMatchResults(roomId, adminSupabase);
    if (results.length === 0) {
      await endgameRepository.updateGameRoomStatus(
        roomId,
        "finished",
        adminSupabase
      );
      return;
    }

    // 3. Atomic processing for each player
    await Promise.all(
      results.map(async (player) => {
        try {
          const { data: userData } = await endgameRepository.getUserData(
            player.userId,
            adminSupabase
          );
          if (!userData) return;

          const finalTrophy = player.trophyWon;
          const finalCoin = player.coinsEarned;

          // Update user's match performance
          await endgameRepository.updateUserGame(
            player.userId,
            roomId,
            {
              trophy_won: finalTrophy,
              coins_earned: finalCoin,
              win: player.win,
              lose: player.lose,
              placement: player.placement,
            },
            adminSupabase
          );

          // Update user's global stats
          let newTrophy = (userData.total_trophy || 0) + finalTrophy;
          newTrophy = Math.max(0, Math.min(newTrophy, MAX_TROPHY_LIMIT));

          await endgameRepository.updateUserStats(
            player.userId,
            {
              total_trophy: newTrophy,
              coin: (userData.coin || 0) + finalCoin,
              total_match: (userData.total_match || 0) + 1,
              total_rank_1:
                (userData.total_rank_1 || 0) + (player.placement === 1 ? 1 : 0),
            },
            adminSupabase
          );
        } catch (err) {
          console.error(
            `[EndgameService] Error processing user ${player.userId}:`,
            err
          );
        }
      })
    );

    // 4. Finalize Room
    await endgameRepository.updateGameRoomStatus(
      roomId,
      "finished",
      adminSupabase
    );
    console.log(
      `[EndgameService] Rewards successfully processed for room ${roomId}`
    );
  },
};
