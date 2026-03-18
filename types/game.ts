import { Difficulty, RoomStatus, RoomVisibility } from './enums';

export interface GameRoom {
  game_room_id: string;
  user_id: string; // Pembuat room
  room_code: string;
  topic_material: string;
  max_player: number;
  total_question: number;
  total_round: number;
  difficulty: Difficulty;
  image_url: string;
  room_status: RoomStatus;
  room_visibility: RoomVisibility;
  created_at: string;
  updated_at: string;
}

export interface UserGame {
  user_game_id: string;
  game_room_id: string;
  user_id: string;
  trophy_won: number;
  coins_earned: number;
  created_at: string;
  updated_at: string;
}
