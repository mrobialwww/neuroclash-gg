/**
 * userGameService.ts
 * Layer: Service — business logic for lobby join/leave flow.
 * Composes repository calls + user identity + participant mapping.
 */

import {
  userGameRepository,
  ParticipantRecord,
} from "@/repository/userGameRepository";
import { LobbyPlayer } from "@/components/quiz/Lobby";
import { createClient } from "@/lib/supabase/client";

export interface LobbyInitResult {
  userGameId: string;
  currentUserId: string;
}

export const userGameService = {
  /**
   * Called when user enters the lobby page.
   * Joins the room (inserts user_game) and returns tracking data.
   */
  async joinLobby(
    gameRoomId: string,
    userId: string
  ): Promise<LobbyInitResult | null> {
    const record = await userGameRepository.joinGame(gameRoomId, userId);
    if (!record) return null;

    return {
      userGameId: record.user_game_id,
      currentUserId: record.user_id,
    };
  },

  /**
   * Fetches all participants for a room and maps them to LobbyPlayer shape.
   * Needs to cross-reference /api/users/[user_id] for username + avatar.
   * For performance: batch-fetch distinct user_ids in parallel.
   */
  async getParticipantsAsPlayers(gameRoomId: string): Promise<LobbyPlayer[]> {
    const participants = await userGameRepository.getParticipants(gameRoomId);

    // De-duplicate by user_id (keep latest record per user)
    const uniqueUsers = new Map<string, ParticipantRecord>();
    for (const p of participants) {
      uniqueUsers.set(p.user_id, p);
    }

    // Parallel fetch user profile + active character for each unique user
    const playerPromises = Array.from(uniqueUsers.values()).map(async (p) => {
      try {
        const [userRes, charRes] = await Promise.all([
          fetch(`/api/users/${p.user_id}`, {
            cache: "no-store",
            credentials: "include",
          }),
          fetch(`/api/user-character/${p.user_id}?is_used=true`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        const userResult = await userRes.json();
        const userData = Array.isArray(userResult.data)
          ? userResult.data[0]
          : userResult.data;

        let characterData: {
          base_character: string;
          image_url: string;
        } | null = null;
        if (charRes.ok) {
          const charResult = await charRes.json();
          const raw = charResult.data;
          characterData = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
        }

        const player: LobbyPlayer = {
          id: p.user_id,
          name: userData?.username || "Pemain",
          character: characterData?.base_character || "Slime",
          image: characterData?.image_url || "/default/Slime.webp",
          health: 100,
          maxHealth: 100,
        };

        return player;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(playerPromises);
    return results.filter((p): p is LobbyPlayer => p !== null);
  },

  /**
   * Remove the user_game record when user exits the lobby or finishes quiz.
   */
  async leaveLobby(userGameId: string): Promise<void> {
    await userGameRepository.leaveGame(userGameId);
  },

  /**
   * Get the current authenticated user's ID from Supabase client.
   */
  async getCurrentUserId(): Promise<string | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  },
};
