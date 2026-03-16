import { AvatarItem } from "./AvatarItem";

export interface GameRoom {
  game_room_id: string;
  room_code: string;
  topic_material: string;
  category: string;
  max_player: number;
  usersRegistered: number;
  total_question: number;
  total_round: number;
  difficulty: "mudah" | "sedang" | "sulit";
  image_url: string;
  room_status: "open" | "started" | "finished";
  room_visibility: "public" | "private";
  players: AvatarItem[];
}
