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
    image: string;
    character: string;
    /** Level skin karakter — digunakan untuk resolve skill badge di UI */
    skin_level?: "default" | "epic" | "legend";
    health: number; // Default 100
    is_alive: boolean;
    score: number;
}

export interface QuizOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface QuizQuestion {
    question_id: string;
    question_text: string;
    question_order: number;
    options: QuizOption[];
}
