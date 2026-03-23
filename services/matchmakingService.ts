import { createClient } from "@/lib/supabase/server";

interface MatchRound {
  round_id: string;
  game_room_id: string;
  round_number: number;
  player1_id: string | null;
  player2_id: string | null;
  player3_id: string | null;
  winner_id: string | null;
  status: string;
}

interface PlayerPairing {
  round_number: number;
  player1_id: string;
  player2_id: string;
}

export const matchmakingService = {
  /**
   * Generate jadwal round-robin pairing untuk semua pemain
   * Algoritma: Rotasi sirkuler (Circle Method)
   */
  generateRoundRobinSchedule(playerIds: string[]): PlayerPairing[] {
    const schedules: PlayerPairing[] = [];
    const n = playerIds.length;

    if (n < 2) return schedules;

    // Untuk jumlah ganjil, tambahkan dummy player (bye)
    const players = [...playerIds];
    if (n % 2 !== 0) {
      players.push("bye");
    }

    const totalRounds = players.length - 1;
    let currentRound = 1;

    while (currentRound <= totalRounds) {
      for (let i = 0; i < players.length / 2; i++) {
        const player1 = players[i];
        const player2 = players[players.length - 1 - i];

        // Skip pairing dengan dummy player (bye)
        if (player1 !== "bye" && player2 !== "bye") {
          schedules.push({
            round_number: currentRound,
            player1_id: player1,
            player2_id: player2,
          });
        }
      }

      // Rotasi: pertahankan player pertama, rotasi yang lain
      const firstPlayer = players[0];
      const lastPlayer = players[players.length - 1];

      for (let i = players.length - 1; i > 1; i--) {
        players[i] = players[i - 1];
      }

      players[1] = lastPlayer;
      currentRound++;
    }

    return schedules;
  },

  /**
   * Generate dan simpan jadwal ronde ke database
   * Dipanggil saat host klik "Mulai Pertandingan"
   */
  async generateAndSaveSchedule(roomId: string, playerIds: string[]) {
    const supabase = await createClient();

    const schedules = this.generateRoundRobinSchedule(playerIds);

    const rounds = schedules.map((schedule) => ({
      game_room_id: roomId,
      round_number: schedule.round_number,
      player1_id: schedule.player1_id,
      player2_id: schedule.player2_id,
      status: "waiting",
    }));

    const { data, error } = await supabase
      .from("match_rounds")
      .insert(rounds)
      .select()
      .order("round_number", { ascending: true });

    if (error) {
      console.error("[MatchmakingService] generateAndSaveSchedule error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Ambil pairing ronde untuk user tertentu
   * Return round info dengan data lawan
   */
  async getRoomForPlayer(
    roomId: string,
    userId: string,
    roundNumber: number
  ): Promise<MatchRound | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("match_rounds")
      .select("*")
      .eq("game_room_id", roomId)
      .eq("round_number", roundNumber)
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .single();

    if (error) {
      console.error("[MatchmakingService] getRoomForPlayer error:", error);
      return null;
    }

    return data;
  },

  /**
   * Aktifkan ronde (ubah status jadi 'ongoing')
   * Dipanggil saat ronde baru dimulai
   */
  async activateRound(roomId: string, roundNumber: number) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("match_rounds")
      .update({ status: "ongoing", updated_at: new Date().toISOString() })
      .eq("game_room_id", roomId)
      .eq("round_number", roundNumber)
      .select()
      .single();

    if (error) {
      console.error("[MatchmakingService] activateRound error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Finalisasi ronde (ubah status jadi 'finished' dan set winner)
   * Dipanggil saat ronde selesai
   */
  async finalizeRound(
    roomId: string,
    roundNumber: number,
    winnerId: string | null
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("match_rounds")
      .update({
        status: "finished",
        winner_id: winnerId,
        updated_at: new Date().toISOString(),
      })
      .eq("game_room_id", roomId)
      .eq("round_number", roundNumber)
      .select()
      .single();

    if (error) {
      console.error("[MatchmakingService] finalizeRound error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Ambil semua pairing ronde untuk room tertentu
   */
  async getAllRounds(roomId: string): Promise<MatchRound[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("match_rounds")
      .select("*")
      .eq("game_room_id", roomId)
      .order("round_number", { ascending: true });

    if (error) {
      console.error("[MatchmakingService] getAllRounds error:", error);
      return [];
    }

    return data || [];
  },

  /**
   * Hapus semua ronde saat room dihapus
   */
  async deleteRounds(roomId: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("match_rounds")
      .delete()
      .eq("game_room_id", roomId);

    if (error) {
      console.error("[MatchmakingService] deleteRounds error:", error);
      throw error;
    }
  },
};
