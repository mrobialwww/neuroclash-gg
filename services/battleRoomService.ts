import { createClient } from "@/lib/supabase/client";

export interface BattleRoom {
  battle_room_id: string;
  game_room_id: string;
  round_number: number;
  player1_id: string;
  player2_id: string;
  player3_id: string | null;
  question_id: string;
  first_answer_user_id: string | null;
  first_answer_id: string | null;
  status: "waiting" | "ongoing" | "finished" | "timeout";
  created_at: string;
  updated_at: string;
}

export interface PlayerWithHealth {
  user_id: string;
  health: number;
  status: string;
}

// Track opponents untuk setiap player agar tidak bertemu sama dua kali
interface PlayerOpponents {
  user_id: string;
  opponents: Set<string>;
}

// In-memory track opponents untuk setiap game (reset per round)
const playerOpponentsCache: Map<string, PlayerOpponents[]> = new Map();

export const battleRoomService = {
  playerOpponentsCache,

  /**
   * Reset opponent cache untuk game tertentu
   */
  resetOpponentCache(gameId: string) {
    this.playerOpponentsCache.set(gameId, []);
    console.log(`[BattleRoomService] Reset opponent cache for game ${gameId}`);
  },

  /**
   * Check apakah semua kombinasi lawan sudah terpenuhi
   * Untuk n players, total kombinasi = n * (n-1) / 2
   * Contoh: 4 players = 6 kombinasi, 5 players = 10 kombinasi
   *
   * SPECIAL RULE: Jika hanya tersisa 2-3 players, jangan reset
   * Biarkan mereka terus bertemu (request dari user)
   */
  allOpponentsAssigned(gameId: string, alivePlayerIds: string[]): boolean {
    const cache = this.playerOpponentsCache.get(gameId) || [];

    if (cache.length === 0) return false;

    const alivePlayerCount = alivePlayerIds.length;

    // SPECIAL RULE: Jika hanya 2-3 players, jangan reset
    // Biarkan mereka terus bertemu meskipun semua kombinasi sudah habis
    if (alivePlayerCount <= 3) {
      console.log(
        `[BattleRoomService] ⚠️ Only ${alivePlayerCount} players alive - NO RESET`
      );
      return false;
    }

    // Hitung total kombinasi yang mungkin: n * (n-1) / 2
    const totalPossibleCombos =
      (alivePlayerIds.length * (alivePlayerIds.length - 1)) / 2;

    // Hitung total lawan yang sudah terassign
    let totalAssigned = 0;
    cache.forEach((player) => {
      totalAssigned += player.opponents.size;
    });

    console.log(`[BattleRoomService] Opponent history check:`);
    console.log(
      `[BattleRoomService]   - Total possible combos: ${totalPossibleCombos}`
    );
    console.log(`[BattleRoomService]   - Total assigned: ${totalAssigned}`);
    console.log(
      `[BattleRoomService]   - All combos assigned: ${
        totalAssigned >= totalPossibleCombos
      }`
    );

    return totalAssigned >= totalPossibleCombos;
  },

  /**
   * Reset opponent history ketika semua kombinasi sudah habis
   * Tidak akan dipanggil jika hanya 2-3 players yang hidup
   */
  resetOpponentHistory(gameId: string) {
    console.log(
      `[BattleRoomService] ==================================================`
    );
    console.log(`[BattleRoomService] ⚠️ ALL COMBINATIONS COMPLETED`);
    console.log(`[BattleRoomService] 🔄 RESETTING opponent history`);
    console.log(
      `[BattleRoomService] Note: Only for 4+ players (2-3 players keep meeting)`
    );
    console.log(
      `[BattleRoomService] ==================================================`
    );
    this.resetOpponentCache(gameId);
  },

  /**
   * Get previous opponents untuk player
   */
  getPreviousOpponents(gameId: string, userId: string): Set<string> {
    const cache = this.playerOpponentsCache.get(gameId) || [];
    const playerData = cache.find((p: PlayerOpponents) => p.user_id === userId);
    return playerData?.opponents || new Set();
  },

  /**
   * Add opponent ke history
   */
  addOpponent(gameId: string, userId: string, opponentId: string) {
    let cache = this.playerOpponentsCache.get(gameId) || [];
    let playerData = cache.find((p: PlayerOpponents) => p.user_id === userId);

    if (!playerData) {
      playerData = { user_id: userId, opponents: new Set() };
      cache.push(playerData);
    }

    playerData.opponents.add(opponentId);
    this.playerOpponentsCache.set(gameId, cache);
  },

  /**
   * Round-robin pairing algorithm
   * Setiap round, player tidak akan bertemu lawan yang sama
   * Jika ganjil, 1 room berisi 3 players
   */
  generateRoundRobinPairings(
    playerIds: string[],
    gameId: string
  ): Array<{
    player1_id: string;
    player2_id: string;
    player3_id?: string;
  }> {
    const totalPlayers = playerIds.length;
    const totalRooms = Math.floor(totalPlayers / 2);
    const isOdd = totalPlayers % 2 !== 0;

    console.log(
      `[BattleRoomService] ==================================================`
    );
    console.log(
      `[BattleRoomService] Generating pairings for ${totalPlayers} players → ${totalRooms} rooms`
    );
    console.log(`[BattleRoomService] Is odd: ${isOdd}`);
    console.log(
      `[BattleRoomService] Players:`,
      playerIds.map((id) => id.substring(0, 8))
    );
    console.log(
      `[BattleRoomService] ==================================================`
    );

    // Cek apakah semua kombinasi lawan sudah terpenuhi
    if (this.allOpponentsAssigned(gameId, playerIds)) {
      this.resetOpponentHistory(gameId);
    }

    // Shuffle players
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    console.log(
      `[BattleRoomService] Shuffled players:`,
      shuffled.map((id) => id.substring(0, 8))
    );

    const pairings: Array<{
      player1_id: string;
      player2_id: string;
      player3_id?: string;
    }> = [];

    const usedPlayers = new Set<string>();

    // Helper untuk cek apakah player sudah pernah bertemu
    const hasMet = (playerId: string, opponentId: string): boolean => {
      const prevOpponents = this.getPreviousOpponents(gameId, playerId);
      return prevOpponents.has(opponentId);
    };

    // Helper untuk assign player ke room
    const assignToRoom = (playerId: string, roomId: number): boolean => {
      if (usedPlayers.has(playerId)) {
        console.log(
          `[BattleRoomService] Player ${playerId.substring(
            0,
            8
          )} already assigned`
        );
        return false;
      }

      // Cari lawan yang belum pernah bertemu
      for (let i = 0; i < shuffled.length; i++) {
        const opponentId = shuffled[i];

        // Skip jika:
        // - Sama dengan sendiri
        // - Sudah dipakai
        // - Sudah pernah bertemu sebelumnya
        if (
          opponentId === playerId ||
          usedPlayers.has(opponentId) ||
          hasMet(playerId, opponentId)
        ) {
          continue;
        }

        // Found opponent!
        console.log(
          `[BattleRoomService] Room ${roomId}: ${playerId.substring(
            0,
            8
          )} vs ${opponentId.substring(0, 8)}`
        );

        pairings.push({
          player1_id: playerId,
          player2_id: opponentId,
          player3_id: undefined,
        });

        // Mark sebagai used
        usedPlayers.add(playerId);
        usedPlayers.add(opponentId);

        // Track opponents
        this.addOpponent(gameId, playerId, opponentId);
        this.addOpponent(gameId, opponentId, playerId);

        return true;
      }

      console.log(
        `[BattleRoomService] No opponent found for ${playerId.substring(0, 8)}`
      );
      return false;
    };

    // Assign players ke rooms
    for (let roomNum = 0; roomNum < totalRooms; roomNum++) {
      // Jika ganjil dan ini room terakhir, beri 3 players
      if (isOdd && roomNum === totalRooms - 1) {
        // Cari 3 players yang belum dipakai
        const availablePlayers = shuffled.filter((id) => !usedPlayers.has(id));

        if (availablePlayers.length >= 3) {
          // Ambil 3 pertama
          const room = {
            player1_id: availablePlayers[0],
            player2_id: availablePlayers[1],
            player3_id: availablePlayers[2],
          };

          console.log(`[BattleRoomService] Room ${roomNum + 1} (3 players):`, {
            p1: room.player1_id.substring(0, 8),
            p2: room.player2_id.substring(0, 8),
            p3: room.player3_id.substring(0, 8),
          });

          pairings.push(room);

          // Track semua kombinasi 3 players
          for (let i = 0; i < 3; i++) {
            for (let j = i + 1; j < 3; j++) {
              this.addOpponent(
                gameId,
                availablePlayers[i],
                availablePlayers[j]
              );
              this.addOpponent(
                gameId,
                availablePlayers[j],
                availablePlayers[i]
              );
            }
          }

          availablePlayers.slice(0, 3).forEach((id) => usedPlayers.add(id));
        }
      } else {
        // Regular room dengan 2 players
        // Cari player pertama yang belum dipakai
        for (const playerId of shuffled) {
          if (usedPlayers.has(playerId)) continue;

          // Coba assign player ini
          if (assignToRoom(playerId, roomNum + 1)) {
            break;
          }
        }
      }
    }

    // Verifikasi: Pastikan semua player ter-assign
    const unassignedPlayers = playerIds.filter((id) => !usedPlayers.has(id));
    if (unassignedPlayers.length > 0) {
      console.error(
        `[BattleRoomService] ERROR: ${unassignedPlayers.length} players not assigned:`,
        unassignedPlayers.map((id) => id.substring(0, 8))
      );
      throw new Error(`Unassigned players: ${unassignedPlayers.length}`);
    }

    // Verifikasi: Pastikan tidak ada player di multiple rooms
    const playerRoomCount = new Map<string, number>();
    pairings.forEach((room) => {
      playerRoomCount.set(
        room.player1_id,
        (playerRoomCount.get(room.player1_id) || 0) + 1
      );
      playerRoomCount.set(
        room.player2_id,
        (playerRoomCount.get(room.player2_id) || 0) + 1
      );
      if (room.player3_id) {
        playerRoomCount.set(
          room.player3_id,
          (playerRoomCount.get(room.player3_id) || 0) + 1
        );
      }
    });

    const duplicatePlayers = Array.from(playerRoomCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([id, count]) => ({ id, count }));

    if (duplicatePlayers.length > 0) {
      console.error(
        `[BattleRoomService] ERROR: Players in multiple rooms:`,
        duplicatePlayers.map((d) => ({
          id: d.id.substring(0, 8),
          count: d.count,
        }))
      );
      throw new Error(`Players in multiple rooms: ${duplicatePlayers.length}`);
    }

    console.log(
      `[BattleRoomService] ✓ Generated ${pairings.length} battle rooms for ${totalPlayers} players`
    );

    // Log summary
    const summary = pairings
      .map((room, idx) => {
        const count = room.player3_id ? 3 : 2;
        return `R${idx + 1}:[${room.player1_id.substring(
          0,
          6
        )} vs ${room.player2_id.substring(0, 6)}${
          room.player3_id ? ` vs ${room.player3_id.substring(0, 6)}` : ""
        }](${count})`;
      })
      .join(", ");
    console.log(`[BattleRoomService] Summary: ${summary}`);
    console.log(
      `[BattleRoomService] ==================================================`
    );

    return pairings;
  },

  /**
   * Generate battle rooms for a round using round-robin algorithm
   * Only includes alive players (health > 0 and status = 'alive')
   */
  async generateBattleRooms(
    gameId: string,
    roundNumber: number,
    questions: { question_id: string }[]
  ): Promise<BattleRoom[]> {
    const supabase = await createClient();

    console.log(
      `[BattleRoomService] ==================================================`
    );
    console.log(
      `[BattleRoomService] Generating battle rooms for game ${gameId}, round ${roundNumber}`
    );
    console.log(
      `[BattleRoomService] ==================================================`
    );

    // 0. Reset opponent cache hanya saat first round (round 1)
    if (roundNumber === 1) {
      this.resetOpponentCache(gameId);
      console.log(
        `[BattleRoomService] Round 1 - Reset opponent cache for fresh start`
      );
    }

    // 1. Hapus battle rooms yang sudah ada untuk round ini
    console.log(
      `[BattleRoomService] Cleaning up existing battle rooms for round ${roundNumber}`
    );
    const { error: deleteError } = await supabase
      .from("battle_rooms")
      .delete()
      .eq("game_room_id", gameId)
      .eq("round_number", roundNumber);

    if (deleteError) {
      console.warn(
        "[BattleRoomService] Warning deleting old battle rooms:",
        deleteError
      );
    }

    // 2. Fetch alive players from game_players
    const { data: players, error: playersError } = await supabase
      .from("game_players")
      .select("user_id, health, status")
      .eq("game_room_id", gameId)
      .order("created_at", { ascending: true });

    if (playersError) {
      console.error(
        "[BattleRoomService] Error fetching players:",
        playersError
      );
      throw playersError;
    }

    // 3. Filter only alive players
    const alivePlayers = (players || []).filter(
      (p: PlayerWithHealth) => p.health > 0 && p.status === "alive"
    );

    console.log(
      `[BattleRoomService] Alive players: ${alivePlayers.length} / ${
        (players || []).length
      } total`
    );
    console.log(
      `[BattleRoomService] Alive player IDs:`,
      alivePlayers.map((p) => p.user_id.substring(0, 8))
    );

    if (alivePlayers.length < 2) {
      console.log(
        "[BattleRoomService] Not enough alive players for battle rooms"
      );
      return [];
    }

    // 4. Generate round-robin pairings
    const pairings = this.generateRoundRobinPairings(
      alivePlayers.map((p) => p.user_id),
      gameId
    );

    // 5. Create battle rooms with assigned questions
    const battleRooms: BattleRoom[] = [];
    let questionIndex = 0;

    for (const pairing of pairings) {
      const question = questions[questionIndex % questions.length];

      const battleRoomData = {
        game_room_id: gameId,
        round_number: roundNumber,
        player1_id: pairing.player1_id,
        player2_id: pairing.player2_id,
        player3_id: pairing.player3_id || null,
        question_id: question.question_id,
        status: "waiting" as const,
      };

      console.log(`[BattleRoomService] Inserting room:`, {
        p1: pairing.player1_id.substring(0, 8),
        p2: pairing.player2_id.substring(0, 8),
        p3: pairing.player3_id?.substring(0, 8) || "none",
        question: question.question_id.substring(0, 8),
      });

      const { data: battleRoom, error: insertError } = await supabase
        .from("battle_rooms")
        .insert(battleRoomData)
        .select()
        .single();

      if (insertError) {
        console.error(
          "[BattleRoomService] Error inserting battle room:",
          insertError
        );
        console.error("[BattleRoomService] Battle room data:", battleRoomData);
        throw insertError;
      }

      battleRooms.push(battleRoom);
      questionIndex++;
    }

    console.log(
      `[BattleRoomService] Successfully created ${battleRooms.length} battle rooms`
    );

    // 6. Verifikasi di database
    const { data: verifyData } = await supabase
      .from("battle_rooms")
      .select("player1_id, player2_id, player3_id")
      .eq("game_room_id", gameId)
      .eq("round_number", roundNumber);

    if (verifyData) {
      console.log(
        `[BattleRoomService] Verification: ${verifyData.length} rooms in DB`
      );

      const roomPlayers = new Set<string>();
      verifyData.forEach((room) => {
        roomPlayers.add(room.player1_id);
        roomPlayers.add(room.player2_id);
        if (room.player3_id) roomPlayers.add(room.player3_id);
      });

      console.log(
        `[BattleRoomService] Unique players in DB: ${roomPlayers.size} (expected: ${alivePlayers.length})`
      );

      if (roomPlayers.size !== alivePlayers.length) {
        console.error(`[BattleRoomService] ERROR: Player count mismatch!`);
      }
    }

    return battleRooms;
  },

  /**
   * Get battle room for a specific player in a specific round
   */
  async getBattleRoomForPlayer(
    gameId: string,
    userId: string,
    roundNumber: number
  ): Promise<BattleRoom | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("battle_rooms")
      .select("*")
      .eq("game_room_id", gameId)
      .eq("round_number", roundNumber)
      .or(
        `player1_id.eq.${userId},player2_id.eq.${userId},player3_id.eq.${userId}`
      )
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("[BattleRoomService] Error fetching battle room:", error);
    }

    if (!data) {
      console.log(
        `[BattleRoomService] No battle room found for user ${userId.substring(
          0,
          8
        )} in round ${roundNumber}`
      );
    }

    return data;
  },

  /**
   * Check if all battle rooms in a round are finished
   */
  async areAllBattlesFinished(
    gameId: string,
    roundNumber: number
  ): Promise<boolean> {
    const battleRooms = await this.getBattleRoomsForRound(gameId, roundNumber);

    if (battleRooms.length === 0) return true;

    const allFinished = battleRooms.every(
      (br) => br.status === "finished" || br.status === "timeout"
    );

    return allFinished;
  },

  /**
   * Get all battle rooms for a round
   */
  async getBattleRoomsForRound(
    gameId: string,
    roundNumber: number
  ): Promise<BattleRoom[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("battle_rooms")
      .select("*")
      .eq("game_room_id", gameId)
      .eq("round_number", roundNumber)
      .order("battle_room_id", { ascending: true });

    if (error) {
      console.error("[BattleRoomService] Error fetching battle rooms:", error);
      return [];
    }

    return data || [];
  },

  /**
   * Update battle room status
   */
  async updateBattleRoomStatus(
    battleRoomId: string,
    status: "waiting" | "ongoing" | "finished" | "timeout"
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("battle_rooms")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("battle_room_id", battleRoomId);

    if (error) {
      console.error("[BattleRoomService] Error updating battle room:", error);
      throw error;
    }
  },

  /**
   * Record first answer in battle room
   */
  async recordFirstAnswer(
    battleRoomId: string,
    userId: string,
    answerId: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("battle_rooms")
      .update({
        first_answer_user_id: userId,
        first_answer_id: answerId,
        updated_at: new Date().toISOString(),
      })
      .eq("battle_room_id", battleRoomId);

    if (error) {
      console.error("[BattleRoomService] Error recording first answer:", error);
      throw error;
    }
  },

  /**
   * Delete all battle rooms for a game
   */
  async deleteBattleRooms(gameId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("battle_rooms")
      .delete()
      .eq("game_room_id", gameId);

    if (error) {
      console.error("[BattleRoomService] Error deleting battle rooms:", error);
      throw error;
    }
  },
};
