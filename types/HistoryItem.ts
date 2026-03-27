export interface HistoryItem {
  id: string;
  avatar: string;
  time: string;
  date: string;
  material: string;
  rank: string;
  trophy: number;
  coin: number;
  win?: number;
  lose?: number;
  baseCharacter?: string;
}
