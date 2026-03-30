import { createClient } from "@/lib/supabase/client";
const { createAdminClient } = await import("@/lib/supabase/admin");

export const gamePlayerRepository = {
  /**
   * Insert semua pemain saat match dimulai dengan health 100
   */
  async insertPlayers(roomId: string, userIds: string[]) {
    console.log(
      `[GamePlayerRepo] insertPlayers called for roomId: ${roomId}, userIds: ${userIds.length}`
    );

    const supabase = await createClient();

    const players = userIds.map((user_id) => ({
      game_room_id: roomId,
      user_id,
      health: 100,
      status: "alive",
    }));

    console.log(
      `[GamePlayerRepo] Inserting ${players.length} players with initial data`
    );

    const { data, error } = await supabase
      .from("game_players")
      .insert(players)
      .select()
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[GamePlayerRepo] insertPlayers error:", error);
      console.error("[GamePlayerRepo] Error code:", error.code);
      console.error("[GamePlayerRepo] Error message:", error.message);
      console.error("[GamePlayerRepo] Error details:", error.details);
      console.error("[GamePlayerRepo] Error hint:", error.hint);
      throw error;
    }

    console.log(
      `[GamePlayerRepo] Successfully inserted ${data?.length || 0} players`
    );

    return data;
  },

  /**
   * Fetch semua pemain + health untuk ditampilkan di UI
   * Uses Supabase client directly to fetch user and character data
   */
  async getPlayers(roomId: string) {
    console.log(`[GamePlayerRepo] getPlayers called for roomId: ${roomId}`);

    const supabase = await createClient();

    // Step 1: Fetch game_players (without join first)
    const { data: gamePlayers, error: gamePlayersError } = await supabase
      .from("game_players")
      .select("user_id, health, status")
      .eq("game_room_id", roomId);

    if (gamePlayersError) {
      console.error("[GamePlayerRepo] getPlayers error:", gamePlayersError);
      console.error("[GamePlayerRepo] Error code:", gamePlayersError.code);
      console.error(
        "[GamePlayerRepo] Error message:",
        gamePlayersError.message
      );
      return [];
    }

    console.log(
      `[GamePlayerRepo] Found ${gamePlayers?.length || 0} game_players`
    );

    // Log raw data for debugging
    console.log(
      `[GamePlayerRepo] Raw game_players data:`,
      JSON.stringify(gamePlayers, null, 2)
    );

    if (!gamePlayers || gamePlayers.length === 0) {
      console.warn(
        `[GamePlayerRepo] No players found in game_players for roomId: ${roomId}`
      );
      return [];
    }

    // Step 2: Fetch all user data for these user_ids
    const userIds = gamePlayers.map((gp: any) => gp.user_id);
    console.log(
      `[GamePlayerRepo] Fetching user data for ${userIds.length} users`
    );

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("user_id, username")
      .in("user_id", userIds);

    if (usersError) {
      console.error("[GamePlayerRepo] Error fetching users:", usersError);
      console.error("[GamePlayerRepo] Users error code:", usersError.code);
      console.error(
        "[GamePlayerRepo] Users error message:",
        usersError.message
      );
    }

    console.log(`[GamePlayerRepo] Fetched ${usersData?.length || 0} users`);
    console.log(
      `[GamePlayerRepo] Users data:`,
      JSON.stringify(usersData, null, 2)
    );

    // Create a map of user_id -> username for quick lookup
    const userMap = new Map(
      (usersData || []).map((u: any) => [u.user_id, u.username])
    );

    // Step 3: For each player, fetch equipped character using Supabase
    // Using same approach as lobby: query FROM characters and JOIN to user_characters
    const mappedPlayers = await Promise.all(
      gamePlayers.map(async (row: any, idx: number) => {
        console.log(
          `[GamePlayerRepo] Processing player ${
            idx + 1
          }: ${row.user_id.substring(0, 8)}`
        );

        try {
          // Get username from userMap
          const username = userMap.get(row.user_id);
          console.log(
            `[GamePlayerRepo] Username for user ${row.user_id.substring(
              0,
              8
            )}:`,
            username
          );

          // Fetch equipped character menggunakan admin client untuk mem-Bypass RLS
          // (karena getPlayers dipanggil via server route tanpa cookie session)

          const adminSupabase = createAdminClient();
          const { data: charData, error: charError } = await adminSupabase
            .from("characters")
            .select(
              "skin_name, image_url, user_characters!inner(user_id, is_used)"
            )
            .eq("user_characters.user_id", row.user_id)
            .eq("user_characters.is_used", true)
            .limit(1)
            .maybeSingle();

          if (charError) {
            console.error(
              `[GamePlayerRepo] ❌ Error fetching character for user ${row.user_id.substring(
                0,
                8
              )}:`,
              charError
            );
          }

          console.log(
            `[GamePlayerRepo] Character data for user ${row.user_id.substring(
              0,
              8
            )}:`,
            JSON.stringify(charData, null, 2)
          );

          // Extract character data - charData contains skin_name and image_url directly
          const skin_name = charData?.skin_name || "Slime";
          const image_url = charData?.image_url || "/default/Slime.webp";

          const mappedPlayer = {
            id: row.user_id,
            name: username || "Unknown",
            image: image_url, // Changed from avatar to image to match Player interface
            character: skin_name,
            health: row.health ?? 100,
            maxHealth: 100, // Added maxHealth to fix NaN percentage in PlayerGridCard
            is_alive: row.status === "alive",
            score: 0,
          };

          console.log(`[GamePlayerRepo] ✅ Mapped player ${idx + 1}:`, {
            id: mappedPlayer.id.substring(0, 8),
            name: mappedPlayer.name,
            character: mappedPlayer.character,
            image: mappedPlayer.image,
            health: mappedPlayer.health,
            maxHealth: mappedPlayer.maxHealth,
          });

          return mappedPlayer;
        } catch (err) {
          console.error(
            `[GamePlayerRepo] ❌ Error fetching data for player ${idx + 1}:`,
            err
          );
          // Return default data if fetch fails
          return {
            id: row.user_id,
            name: "Unknown",
            image: "/default/Slime.webp",
            character: "Slime",
            health: row.health ?? 100,
            maxHealth: 100,
            is_alive: row.status === "alive",
            score: 0,
          };
        }
      })
    );

    console.log(
      `[GamePlayerRepo] Returning ${mappedPlayers.length} mapped players`
    );

    return mappedPlayers;
  },

  /**
   * Get player health untuk user tertentu
   */
  async getPlayerHealth(userId: string, roomId: string): Promise<number> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_players")
      .select("health")
      .eq("game_room_id", roomId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("[GamePlayerRepo] getPlayerHealth error:", error);
      return 100;
    }

    return data?.health ?? 100;
  },

  /**
   * Update health pemain setelah jawaban diproses
   * Jika health <= 0, update status menjadi "died", catat round eliminasi,
   * dan update user_games dengan stats
   */
  async updateHealth(
    userId: string,
    roomId: string,
    newHealth: number,
    roundNumber?: number
  ) {
    const supabase = await createClient();

    console.log(
      `[GamePlayerRepo] updateHealth called: userId=${userId.substring(
        0,
        8
      )}, roomId=${roomId.substring(
        0,
        8
      )}, health=${newHealth}, round=${roundNumber}`
    );

    // Jika health <= 0, set status ke "died" dan catat round eliminasi
    const updateData: {
      health: number;
      status?: string;
      eliminated_at?: number;
    } = {
      health: newHealth,
    };
    if (newHealth <= 0) {
      updateData.status = "died";
      updateData.eliminated_at = roundNumber || 0;
      console.log(
        `[GamePlayerRepo] Player will be marked as died at round ${roundNumber}`
      );
    }

    const { data, error } = await supabase
      .from("game_players")
      .update(updateData)
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .select()
      .single();

    if (error) {
      console.error("[GamePlayerRepo] updateHealth error:", error);
      throw error;
    }

    console.log(`[GamePlayerRepo] updateHealth success:`, data);

    // Log jika player mati
    if (newHealth <= 0) {
      console.log(
        `[GamePlayerRepo] Player ${userId.substring(
          0,
          8
        )} has died at round ${roundNumber}`
      );

      // Update user_games dengan stats
      if (roundNumber) {
        console.log(`[GamePlayerRepo] Calling updateUserGamesOnDeath...`);
        await this.updateUserGamesOnDeath(userId, roomId, roundNumber);
      }
    }

    return data;
  },

  /**
   * Update user_games ketika player mati
   * - win = game_players.win
   * - lose = eliminated_at - win
   * - trophy_won berdasarkan formula peringkat
   * - coins_earned = trophy_won + (3/4 * trophy_won)
   */
  async updateUserGamesOnDeath(
    userId: string,
    roomId: string,
    roundNumber: number
  ) {
    const supabase = await createClient();

    console.log(
      `[GamePlayerRepo] ==================================================`
    );
    console.log(
      `[GamePlayerRepo] updateUserGamesOnDeath START: userId=${userId.substring(
        0,
        8
      )}, roomId=${roomId.substring(0, 8)}, round=${roundNumber}`
    );
    console.log(
      `[GamePlayerRepo] ==================================================`
    );

    // 1. Get win count dari game_players
    const { data: playerData, error: playerError } = await supabase
      .from("game_players")
      .select("win, eliminated_at")
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .single();

    if (playerError) {
      console.error(
        "[GamePlayerRepo] Error fetching player data:",
        playerError
      );
      return null;
    }

    const winCount = playerData?.win || 0;
    const eliminatedAt = playerData?.eliminated_at || roundNumber;
    const loseCount = Math.max(0, eliminatedAt - winCount);

    console.log(
      `[GamePlayerRepo] Player stats from game_players: win=${winCount}, eliminated_at=${eliminatedAt}, calculated_lose=${loseCount}`
    );

    // 2. Hitung placement saat ini (berapa player yang sudah mati)
    const { data: allPlayers } = await supabase
      .from("game_players")
      .select("user_id, status, eliminated_at")
      .eq("game_room_id", roomId)
      .order("eliminated_at", { ascending: true, nullsFirst: false });

    const totalPlayers = allPlayers?.length || 0;

    // Sort players: died players first (by eliminated_at), then alive players
    // This gives us the elimination order
    const sortedPlayers = [...(allPlayers || [])].sort((a, b) => {
      if (a.status === "died" && b.status === "died") {
        return (a.eliminated_at || 0) - (b.eliminated_at || 0);
      }
      if (a.status === "died") return -1;
      if (b.status === "died") return 1;
      return 0;
    });

    // Find current player's position in the sorted list
    const playerIndex = sortedPlayers.findIndex((p) => p.user_id === userId);
    // Placement: first eliminated = last place, last survivor = 1st place
    const placement = totalPlayers - playerIndex;

    console.log(
      `[GamePlayerRepo] Placement calculation: total=${totalPlayers}, playerIndex=${playerIndex}, placement=${placement}`
    );

    // 3. Hitung trophy berdasarkan formula
    // B = 3/4 of total players (rounded)
    const B = Math.ceil(totalPlayers * 0.75);
    const R = placement; // Rank (1 = best, N = worst)
    const N = totalPlayers;

    let trophy_won = 0;

    if (R <= B) {
      // Winning ranks
      if (B === 1) {
        trophy_won = 100;
      } else {
        trophy_won = Math.round(100 - (R - 1) * (90 / (B - 1)));
      }
    } else {
      // Losing ranks
      const losingPlayers = N - B;
      if (losingPlayers === 1) {
        trophy_won = -100;
      } else {
        trophy_won = Math.round(-10 - (R - (B + 1)) * (90 / (N - (B + 1))));
      }
    }

    // 4. Hitung coins = trophy + (3/4 * trophy)
    const coins_earned = Math.round(trophy_won + trophy_won * 0.75);

    console.log(
      `[GamePlayerRepo] Trophy formula: B=${B}, R=${R}, N=${N}, trophy=${trophy_won}, coins=${coins_earned}`
    );

    // 5. Cek apakah record user_games sudah ada
    console.log(
      `[GamePlayerRepo] Checking user_games record for user=${userId.substring(
        0,
        8
      )}, room=${roomId.substring(0, 8)}`
    );

    const { data: existingRecords, error: checkError } = await supabase
      .from("user_games")
      .select("user_game_id, game_room_id, user_id")
      .eq("game_room_id", roomId)
      .eq("user_id", userId);

    console.log(
      `[GamePlayerRepo] Existing user_games records:`,
      existingRecords
    );
    console.log(`[GamePlayerRepo] Check error:`, checkError);

    // 6. Update atau Insert user_games
    let updateResult;
    let error;

    if (existingRecords && existingRecords.length > 0) {
      // Record exists, update it
      console.log(
        `[GamePlayerRepo] Updating existing user_games record: ${existingRecords[0].user_game_id}`
      );
      const result = await supabase
        .from("user_games")
        .update({
          win: winCount,
          lose: loseCount,
          trophy_won,
          coins_earned,
          updated_at: new Date().toISOString(),
        })
        .eq("game_room_id", roomId)
        .eq("user_id", userId)
        .select();

      updateResult = result.data;
      error = result.error;
      console.log(`[GamePlayerRepo] Update result:`, updateResult);
      console.log(`[GamePlayerRepo] Update error:`, error);
    } else {
      // Record doesn't exist, insert it
      console.log(
        `[GamePlayerRepo] No existing record found, creating new user_games record...`
      );
      const result = await supabase
        .from("user_games")
        .insert({
          game_room_id: roomId,
          user_id: userId,
          win: winCount,
          lose: loseCount,
          trophy_won,
          coins_earned,
        })
        .select();

      updateResult = result.data;
      error = result.error;
      console.log(`[GamePlayerRepo] Insert result:`, updateResult);
      console.log(`[GamePlayerRepo] Insert error:`, error);
    }

    if (error) {
      console.error("[GamePlayerRepo] updateUserGamesOnDeath error:", error);
    } else {
      console.log(`[GamePlayerRepo] Updated user_games SUCCESS:`, updateResult);
      console.log(
        `[GamePlayerRepo] Final stats: Placement=${placement}, Win=${winCount}, Lose=${loseCount}, Trophy=${trophy_won}, Coins=${coins_earned}`
      );
    }

    console.log(
      `[GamePlayerRepo] ==================================================`
    );

    return {
      placement,
      win: winCount,
      lose: loseCount,
      trophy_won,
      coins_earned,
    };
  },

  /**
   * Update status pemain (alive/eliminated)
   */
  async updateStatus(userId: string, roomId: string, status: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_players")
      .update({ status })
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .select()
      .single();

    if (error) {
      console.error("[GamePlayerRepo] updateStatus error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Increment win count when user answers first and correctly
   */
  async incrementWin(userId: string, roomId: string) {
    const supabase = await createClient();

    console.log(
      `[GamePlayerRepo] incrementWin called: userId=${userId.substring(
        0,
        8
      )}, roomId=${roomId.substring(0, 8)}`
    );

    // First get current win count
    const { data: current, error: fetchError } = await supabase
      .from("game_players")
      .select("win")
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .single();

    if (fetchError) {
      console.error("[GamePlayerRepo] incrementWin fetch error:", fetchError);
      throw fetchError;
    }

    const newWin = (current?.win || 0) + 1;

    console.log(
      `[GamePlayerRepo] Current win: ${current?.win || 0}, New win: ${newWin}`
    );

    const { data, error } = await supabase
      .from("game_players")
      .update({ win: newWin })
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .select()
      .single();

    if (error) {
      console.error("[GamePlayerRepo] incrementWin update error:", error);
      throw error;
    }

    console.log(`[GamePlayerRepo] incrementWin SUCCESS:`, data);
    console.log(
      `[GamePlayerRepo] Player ${userId.substring(
        0,
        8
      )} won a battle! Win count: ${newWin}`
    );

    return data;
  },

  /**
   * Get player data including win count
   */
  async getPlayerWithWins(userId: string, roomId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_players")
      .select("user_id, health, status, win")
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .single();

    if (error) {
      console.error("[GamePlayerRepo] getPlayerWithWins error:", error);
      return null;
    }

    return data;
  },

  /**
   * Delete semua pemain di room saat match selesai
   */
  async deletePlayers(roomId: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("game_players")
      .delete()
      .eq("game_room_id", roomId);

    if (error) {
      console.error("[GamePlayerRepo] deletePlayers error:", error);
      throw error;
    }
  },
};
