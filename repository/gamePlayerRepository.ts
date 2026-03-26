import { createClient } from "@/lib/supabase/client";

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

          // Fetch equipped character using same approach as lobby
          // Query FROM characters and JOIN to user_characters using !inner
          const { data: charData, error: charError } = await supabase
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
            avatar: image_url,
            character: skin_name,
            health: row.health ?? 100,
            is_alive: row.status === "alive",
            score: 0,
          };

          console.log(`[GamePlayerRepo] ✅ Mapped player ${idx + 1}:`, {
            id: mappedPlayer.id.substring(0, 8),
            name: mappedPlayer.name,
            character: mappedPlayer.character,
            avatar: mappedPlayer.avatar,
            health: mappedPlayer.health,
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
            avatar: "/default/Slime.webp",
            character: "Slime",
            health: row.health ?? 100,
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
   */
  async updateHealth(userId: string, roomId: string, newHealth: number) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_players")
      .update({ health: newHealth })
      .eq("user_id", userId)
      .eq("game_room_id", roomId)
      .select()
      .single();

    if (error) {
      console.error("[GamePlayerRepo] updateHealth error:", error);
      throw error;
    }

    return data;
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
