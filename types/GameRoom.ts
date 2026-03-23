import { Difficulty, RoomStatus, RoomVisibility } from "./enums";

/**
 * Matches the DB schema: public.game_rooms
 * This is the raw row shape returned from Supabase.
 */
export interface GameRoom {
  game_room_id: string;
  user_id: string;
  room_code: string;
  category: string;
  title: string | null;
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

/**
 * Extended game room with computed/joined fields for the dashboard.
 * player_count comes from a DB aggregate (user_games count).
 */
export interface GameRoomWithPlayerCount extends GameRoom {
  player_count: number;
}

/**
 * Matches the DB schema: public.user_games
 */
export interface UserGame {
  user_game_id: string;
  game_room_id: string;
  user_id: string;
  trophy_won: number;
  coins_earned: number;
  created_at: string;
  updated_at: string;
}
