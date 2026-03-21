import { gameRepository } from "@/repository/gameRepository";
import { createClient } from "@/lib/supabase/client";
import { MOCK_PLAYERS, Player } from "@/lib/constants/players";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";

export const gameService = {
  /**
   * Orchestrate Game Room fetching based on UI parameters.
   */
  async getGameRoomConfig(code: string, id: string): Promise<GameRoomWithPlayerCount | null> {
    return await gameRepository.fetchRoomByCodeOrId(code, id);
  },

  /**
   * Mengambil data player pengguna aktif dari Supabase.
   */
  async getCurrentPlayer(): Promise<Player | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("*, user_characters(is_used, characters(*))")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) return null;

    const userChars: any = profile.user_characters;
    const activeChar = Array.isArray(userChars)
      ? userChars.find((uc: any) => uc.is_used)?.characters
      : null;

    return {
      id: user.id,
      name: profile.username || "Player",
      character: activeChar?.name || "Active Character",
      image: activeChar?.image_url || "/default/Slime.webp",
      health: 100,
      maxHealth: 100,
      isMe: true,
    };
  },

  /**
   * Orchestrate Match Players initializations (Aku vs Lawan).
   */
  async loadMatchPlayers(roomMaxPlayer: number = 8): Promise<{ me: Player; opponent: Player }> {
    let mePlayer = await this.getCurrentPlayer();
    
    if (!mePlayer) {
      mePlayer = MOCK_PLAYERS.find((p) => p.isMe) ?? MOCK_PLAYERS[0];
    }

    let opponentPlayer: Player;
    
    if (roomMaxPlayer === 1) {
      opponentPlayer = {
        id: "prof-bubu",
        name: "Prof. Bubu",
        character: "Prof Bubu",
        image: "/match/prof-bubu.webp",
        health: 100,
        maxHealth: 100,
      };
    } else {
      opponentPlayer = MOCK_PLAYERS.find((p) => !p.isMe) ?? MOCK_PLAYERS[1];
    }

    return { me: mePlayer, opponent: opponentPlayer };
  },

  /**
   * Orchestrate Starbox logic for turn-based player fetching.
   * Men-sortir player berdasarkan darah minimum.
   */
  async loadStarboxPlayersTurnBased(roomMaxPlayer: number = 8): Promise<Player[]> {
    // Sorting (terendah -> tertinggi di-copy agar MOCK tidak termutasi global)
    const sortedPlayers = [...MOCK_PLAYERS].sort((a, b) => a.health - b.health);

    if (roomMaxPlayer === 1) {
      // Solo mode, find me only
      return [sortedPlayers.find((p) => p.isMe) ?? sortedPlayers[0]];
    }

    return sortedPlayers.slice(0, roomMaxPlayer);
  }
};
