export interface Question {
  question_id: string;
  game_room_id: string;
  question_order: number;
  question_text: string;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  answer_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  key: string; // e.g., 'A', 'B', 'C', 'D'
}

export interface UserAnswer {
  user_answer_id: string;
  user_id: string;
  answer_id: string;
  created_at: string;
}

export interface PlayerMatchState {
  id: string;
  name: string;
  avatar: string;
  character: string;
  health: number; // Default 100
  is_alive: boolean;
  score: number;
}
