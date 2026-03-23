import { createClient } from "@/lib/supabase/server";

export const gamePlayerRepository = {
  /**
   * Insert semua pemain saat match dimulai dengan health 100
   */
  async insertPlayers(roomId: string, userIds: string[]) {
    const supabase = await createClient();

    const players = userIds.map((user_id) => ({
      game_room_id: roomId,
      user_id,
      health: 100,
      status: "alive",
    }));

    const { data, error } = await supabase
      .from("game_players")
      .insert(players)
      .select()
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[GamePlayerRepo] insertPlayers error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Fetch semua pemain + health untuk ditampilkan di UI
   */
  async getPlayers(roomId: string) {
    const supabase = await createClient();

    console.log(`[GamePlayerRepo] getPlayers called for roomId: ${roomId}`);

    // QUERY FIX: Proper nested joins through users -> user_characters -> characters
    // Path: game_players -> users (FK) -> user_characters (reverse FK) -> characters (FK)
    const { data, error } = await supabase
      .from("game_players")
      .select(
        `
        user_id,
        health,
        status,
        users!inner(
          username,
          user_characters!inner(
            is_used,
            characters!inner(
              skin_name,
              image_url
            )
          )
        )
      `
      )
      .eq("game_room_id", roomId);

    console.log(`[GamePlayerRepo] Query executed, error:`, error);
    console.log(`[GamePlayerRepo] Raw data from DB:`, data);
    console.log(`[GamePlayerRepo] Raw data type: ${typeof data}`);
    console.log(`[GamePlayerRepo] Raw data length: ${data?.length || 0}`);

    if (error) {
      console.error("[GamePlayerRepo] getPlayers error:", error);
      console.error("[GamePlayerRepo] Error code:", error.code);
      console.error("[GamePlayerRepo] Error message:", error.message);
      console.error("[GamePlayerRepo] Error details:", error.details);
      console.error("[GamePlayerRepo] Error hint:", error.hint);
      return [];
    }

    console.log(
      `[GamePlayerRepo] getPlayers found ${data?.length || 0} players`
    );

    if (!data || data.length === 0) {
      console.warn(
        `[GamePlayerRepo] No players found in game_players for roomId: ${roomId}`
      );
      return [];
    }

    const mappedPlayers = data.map((row: any, idx: number) => {
      console.log(`[GamePlayerRepo] Processing row ${idx + 1}:`, row);
      console.log(`[GamePlayerRepo] Row keys:`, Object.keys(row));

      const user = row.users;
      console.log(`[GamePlayerRepo] User data:`, user);

      const userChars = user?.user_characters;
      console.log(`[GamePlayerRepo] User characters array:`, userChars);
      console.log(`[GamePlayerRepo] User characters type: ${typeof userChars}`);
      console.log(
        `[GamePlayerRepo] User characters length: ${userChars?.length || 0}`
      );

      // Find the equipped character (is_used = true)
      const equippedChar = userChars?.find(
        (c: any) => c.is_used === true
      )?.characters;

      console.log(`[GamePlayerRepo] Equipped character:`, equippedChar);

      const mappedPlayer = {
        id: row.user_id,
        name: user?.username || "Unknown",
        avatar: equippedChar?.image_url || "/default/Slime.webp",
        character: equippedChar?.skin_name || "Slime",
        health: row.health ?? 100,
        is_alive: row.status === "alive",
        score: 0,
      };

      console.log(`[GamePlayerRepo] Mapped player ${idx + 1}:`, mappedPlayer);

      return mappedPlayer;
    });

    console.log(
      `[GamePlayerRepo] Returning ${mappedPlayers.length} mapped players`
    );
    console.log(`[GamePlayerRepo] All mapped players:`, mappedPlayers);

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
