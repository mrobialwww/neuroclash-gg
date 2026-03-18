export interface User {
  user_id: string;
  username: string;
  email: string;
  total_trophy: number;
  coin: number;
  total_match: number;
  placement_ratio: number; // Decimal dalam DB, number dalam TS
  total_rank_1: number;
  created_at: string;
  updated_at: string;
}
