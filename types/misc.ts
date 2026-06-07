export interface Rank {
  rank_id: number;
  name: string;
  min_trophy: number;
  max_trophy: number | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Ability {
  ability_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableMaterial {
  available_material_id: number;
  topic_material: string;
  material: string;
  created_at: string;
  updated_at: string;
}
