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
  async determineWinnerOfRound(
    roomId: string,
    questionId: string
  ): Promise<string | null> {
    const answers = await matchRepository.getQuestionAnswers(questionId);

    // Filter hanya yang benar
    const correctAnswers = (answers || []).filter(
      (ans: any) => ans?.answer?.is_correct
    );

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
  async processAnswerSubmission(userId: string, answerId: string) {
    // 1. Dapatkan detail jawaban
    const answerDetail = await matchRepository.getAnswerDetail(answerId);
    if (!answerDetail) throw new Error("Jawaban tidak ditemukan.");

    const { is_correct, question_id } = answerDetail;

    // 2. Dapatkan detail room dan question order melalui question_id
    const supabase = await (
      await import("@/lib/supabase/server")
    ).createClient();
    const { data: questionData } = await supabase
      .from("questions")
      .select("game_room_id, question_order, game_rooms(total_question)")
      .eq("question_id", question_id)
      .single();

    if (!questionData) throw new Error("Question metadata not found.");

    const roomId = questionData.game_room_id;
    const currentOrder = questionData.question_order;
    const totalQuestions =
      (questionData.game_rooms as any).total_question || 20;

    // 3. Simpan jawaban ke user_answers (Repo)
    await matchRepository.submitAnswer(userId, answerId);

    // 4. Kalkulasi damage
    const damage = this.calculateDamage(currentOrder, totalQuestions);
    let damageApplied = 0;
    let isWinner = false;

    if (!is_correct) {
      // Wrong Answer -> Apply damage
      damageApplied = damage;
      const participants = await matchRepository.getParticipants(roomId);
      const userState = participants.find((p) => p.id === userId);
      if (userState) {
        await matchRepository.updateHealth(
          userId,
          roomId,
          Math.max(0, userState.health - damage)
        );
      }
    } else {
      // Correct Answer -> Check if fastest
      const allAnswers = await matchRepository.getQuestionAnswers(question_id);

      // Karena getQuestionAnswers mengurutkan berdasarkan created_at ASC,
      // kita periksa apakah user_id ini adalah yang pertama menjawab benar.
      const correctOnes = allAnswers.filter((a: any) => a.answer.is_correct);

      if (correctOnes.length > 1 && correctOnes[0].user_id !== userId) {
        // Ada yang lebih cepat dan benar -> User ini kena damage
        damageApplied = damage;
        const participants = await matchRepository.getParticipants(roomId);
        const userState = participants.find((p) => p.id === userId);
        if (userState) {
          await matchRepository.updateHealth(
            userId,
            roomId,
            Math.max(0, userState.health - damage)
          );
        }
      } else if (
        correctOnes.length === 1 &&
        correctOnes[0].user_id === userId
      ) {
        // User ini yang tercepat (pertama kali benar)
        isWinner = true;
      }
    }

    return {
      is_correct,
      damageApplied,
      isWinner,
      newHealth: 0, // Will be synced via real-time
    };
  },

  /**
   * Proses damage untuk semua pemain yang tidak aman (selain pemenang tercepat).
   * Digunakan saat timer habis untuk finalisasi status ronde.
   */
  async finalizeRoundDamage(
    roomId: string,
    questionId: string,
    currentOrder: number,
    totalQuestions: number
  ) {
    const damage = this.calculateDamage(currentOrder, totalQuestions);
    const winnerId = await this.determineWinnerOfRound(roomId, questionId);

    const participants = await matchRepository.getParticipants(roomId);
    const updates = [];

    for (const player of participants) {
      // Player yang kena damage:
      // 1. Bukan pemenang ronde
      // 2. Masih hidup (health > 0)
      if (player.id !== winnerId && player.health > 0) {
        const newHealth = Math.max(0, player.health - damage);
        updates.push(
          matchRepository.updateHealth(player.id, roomId, newHealth)
        );
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return { winnerId, damageApplied: damage };
  },
};
