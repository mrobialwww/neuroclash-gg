import { matchRepository } from "@/repository/matchRepository";

export const matchService = {
  /**
   * Mendapatkan semua partisipan untuk suatu room.
   */
  async getParticipantsList(roomId: string) {
    return matchRepository.getParticipants(roomId);
  },

  /**
   * Menghitung damage berdasarkan rumus: Damage = 5 + (n / N) * 20
   * n = nomor urut soal (currentOrder)
   * N = total soal (totalQuestions)
   */
  calculateDamage(currentOrder: number, totalQuestions: number): number {
    if (!totalQuestions || totalQuestions === 0) return 20; // Default base damage if N is invalid
    const damage = 5 + (currentOrder / totalQuestions) * 20;
    return Math.floor(damage); // We use floor for whole numbers damage
  },

  /**
   * Menentukan siapa pemenang ronde (tercepat & benar) untuk suatu soal.
   * Return user_id pemenang atau null jika tidak ada.
   */
  async determineWinnerOfRound(roomId: string, questionId: string): Promise<string | null> {
    const answers = await matchRepository.getQuestionAnswers(questionId);

    // Filter hanya yang benar
    const correctAnswers = (answers || []).filter((ans: any) => ans?.answer?.is_correct);

    if (correctAnswers.length > 0) {
      // Karena sudah diurutkan berdasarkan created_at ASC di repository,
      // maka elemen pertama adalah pemenang tercepat.
      return correctAnswers[0].user_id;
    }

    return null;
  },

  /**
   * Proses jawaban user saat disubmit.
   * Menghitung apakah user tersebut terkena damage.
   */
  async processAnswerSubmission(userId: string, answerId: string, roundNumber: number) {
    console.log(`[MatchService] Processing answer for userId: ${userId}, answerId: ${answerId}`);

    // 1. Dapatkan detail jawaban
    const answerDetail = await matchRepository.getAnswerDetail(answerId);
    if (!answerDetail) throw new Error("Jawaban tidak ditemukan.");

    const { is_correct, question_id } = answerDetail;
    console.log(`[MatchService] Found question_id: ${question_id} for answer_id: ${answerId}`);

    // 2. Dapatkan detail room dan question order melalui question_id
    const supabase = await (await import("@/lib/supabase/server")).createClient();

    // Fetch question details without join first to isolate issues
    const { data: questionData, error: qError } = await supabase
      .from("questions")
      .select("game_room_id, question_order")
      .eq("question_id", question_id)
      .maybeSingle();

    if (qError) {
      console.error("[MatchService] Supabase error fetching question:", qError);
      throw new Error(`Gagal mengambil metadata pertanyaan: ${qError.message}`);
    }

    if (!questionData) {
      console.error(`[MatchService] Question not found in DB for ID: ${question_id}`);
      throw new Error("Metadata pertanyaan tidak ditemukan di database.");
    }

    const roomId = questionData.game_room_id;
    const currentOrder = questionData.question_order;

    // Fetch room details separately for reliability
    const { data: roomData } = await supabase.from("game_rooms").select("total_round").eq("game_room_id", roomId).maybeSingle();

    const totalQuestions = roomData?.total_round || 20;

    console.log(`[MatchService] Match details: roomId=${roomId}, order=${currentOrder}, total=${totalQuestions}`);

    // 3. Simpan jawaban ke user_answers (Repo) dengan game_room_id dan round_number
    await matchRepository.submitAnswer(userId, answerId, roomId, roundNumber);

    // 4. Ambil buff aktif dari DB — Shield (4) atau Attack (2)
    // Ini dilakukan server-side agar tidak bisa dimanipulasi dari client.
    const myBuff = await matchRepository.getActiveAbilityBuff(roomId, userId);

    // 5. Kalkulasi damage
    const baseDamage = this.calculateDamage(currentOrder, totalQuestions);
    let damageApplied = 0;
    let isWinner = false;

    if (!is_correct) {
      // Jawaban salah → user kena damage.
      // Jika user punya Shield aktif (ability_id=4), kurangi damage yang diterima sebesar 20.
      const receivedDamage = Math.max(0, baseDamage - (myBuff === 4 ? 20 : 0));
      damageApplied = receivedDamage;

      const participants = await matchRepository.getParticipants(roomId);
      const userState = participants.find((p) => p.id === userId);
      if (userState) {
        await matchRepository.updateHealth(userId, roomId, Math.max(0, userState.health - receivedDamage));
      }
    } else {
      // Jawaban benar → cek apakah user paling cepat
      const allAnswers = await matchRepository.getQuestionAnswers(question_id);
      const correctOnes = allAnswers.filter((a: any) => a.answer.is_correct);

      if (correctOnes.length > 0 && correctOnes[0].user_id === userId) {
        // User tercepat & benar → winner ronde ini.
        isWinner = true;

        // Jika winner punya Attack buff (ability_id=2), semua lawan kena +10 extra damage.
        // Ini diterapkan di sini (bukan di finalizeRoundDamage) karena hanya winner
        // yang diketahui saat jawaban pertama masuk.
        if (myBuff === 2) {
          const participants = await matchRepository.getParticipants(roomId);
          const opponents = participants.filter((p) => p.id !== userId && p.health > 0);

          await Promise.all(opponents.map((opponent) => matchRepository.updateHealth(opponent.id, roomId, Math.max(0, opponent.health - 10))));
        }
      } else if (correctOnes.length > 1) {
        // Ada yang lebih cepat → user kena damage.
        // Shield (id=4) melindungi; Attack (id=2) hanya menambah damage ke lawan, bukan mengurangi damage yang diterima sendiri.
        const receivedDamage = Math.max(0, baseDamage - (myBuff === 4 ? 20 : 0));
        damageApplied = receivedDamage;

        const participants = await matchRepository.getParticipants(roomId);
        const userState = participants.find((p) => p.id === userId);
        if (userState) {
          await matchRepository.updateHealth(userId, roomId, Math.max(0, userState.health - receivedDamage));
        }
      }
    }

    return {
      is_correct,
      damageApplied,
      isWinner,
      newHealth: 0,
    };
  },

  /**
   * Proses damage untuk semua pemain yang tidak aman (selain pemenang tercepat).
   * Digunakan saat timer habis untuk finalisasi status ronde.
   */
  async finalizeRoundDamage(roomId: string, questionId: string, currentOrder: number, totalQuestions: number) {
    const baseDamage = this.calculateDamage(currentOrder, totalQuestions);
    const winnerId = await this.determineWinnerOfRound(roomId, questionId);
    const participants = await matchRepository.getParticipants(roomId);

    const updates = participants
      // Hanya player yang bukan pemenang ronde dan masih hidup
      .filter((player) => player.id !== winnerId && player.health > 0)
      .map(async (player) => {
        // Cek Shield aktif untuk setiap player yang akan kena damage
        const playerBuff = await matchRepository.getActiveAbilityBuff(roomId, player.id);
        // Shield (id=4): kurangi 20 dari damage yang diterima
        const finalDamage = Math.max(0, baseDamage - (playerBuff === 4 ? 20 : 0));
        const newHealth = Math.max(0, player.health - finalDamage);
        return matchRepository.updateHealth(player.id, roomId, newHealth);
      });

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    // Jika winner punya Attack buff (id=2), tambahkan +10 extra damage ke semua lawan.
    // Terapkan setelah damage normal selesai diaplikasikan.
    if (winnerId) {
      const winnerBuff = await matchRepository.getActiveAbilityBuff(roomId, winnerId);
      if (winnerBuff === 2) {
        const attackUpdates = participants
          .filter((player) => player.id !== winnerId && player.health > 0)
          .map(async (player) => {
            // Ambil health terbaru setelah damage ronde normal
            const fresh = await matchRepository.getParticipants(roomId);
            const freshPlayer = fresh.find((p) => p.id === player.id);
            if (!freshPlayer || freshPlayer.health <= 0) return;
            return matchRepository.updateHealth(player.id, roomId, Math.max(0, freshPlayer.health - 10));
          });
        await Promise.all(attackUpdates);
      }
    }

    return { winnerId, damageApplied: baseDamage };
  },
};
