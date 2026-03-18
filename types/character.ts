import { SkinLevel } from "./enums";

export interface Character {
  character_id: number;
  base_character: string;
  skin_name: string;
  skin_level: SkinLevel;
  image_url: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface UserCharacter {
  character_id: number;
  user_id: string;
  is_used: boolean;
}
