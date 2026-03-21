import { User } from "./User";
import { Question, Answer, UserAnswer } from "./Quiz";
import { GameRoom, UserGame } from "./GameRoom";

export interface UserStats extends User {
  // Winrate = total_rank_1 / total_match * 100
  winrate: number;

  // Average_rank = placement_ratio / total_match
  // Catatan: Pastikan pembagi bukan nol dalam implementasi logic.
  average_rank: number;
}

// Type untuk detail riwayat game (menampilkan soal & jawaban)
export interface GameHistoryDetail extends UserGame {
  room_details: GameRoom;
  questions: (Question & {
    available_answers: Answer[];
    user_choice?: UserAnswer;
  })[];
}
