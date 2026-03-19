import { create } from "zustand";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { Player } from "@/lib/constants/players";
import { gameService } from "@/services/gameService";

export interface Ability {
  id: string;
  name: string;
  description: string;
  stock: number;
  image: string;
  emptyImage: string;
}

const INITIAL_ABILITIES: Ability[] = [
  {
    id: "1",
    name: "KITAB PENGETAHUAN",
    description: "Mendapatkan materi untuk menjawab soal berikutnya",
    stock: 2,
    image: "/ability-card/material-card.webp",
    emptyImage: "/ability-card/material-card-empty.webp",
  },
  {
    id: "2",
    name: "SERANGAN TAJAM",
    description: "Meningkatkan kekuatan serangan dasar sebesar +10.",
    stock: 0,
    image: "/ability-card/attack-card.webp",
    emptyImage: "/ability-card/attack-card-empty.webp",
  },
  {
    id: "3",
    name: "RAMUAN PENYEMBUH",
    description: "Memulihkan 20 poin HP secara instan",
    stock: 2,
    image: "/ability-card/heal-card.webp",
    emptyImage: "/ability-card/heal-card-empty.webp",
  },
  {
    id: "4",
    name: "PERISAI KOKOH",
    description: "Mendapatkan pertahanan sebesar 20 poin",
    stock: 2,
    image: "/ability-card/shield-card.webp",
    emptyImage: "/ability-card/shield-card-empty.webp",
  },
  {
    id: "5",
    name: "PIALA KEJAYAAN",
    description: "Menambah jumlah trophy yang diperoleh sebesar 5%",
    stock: 2,
    image: "/ability-card/trophy-buff-card.webp",
    emptyImage: "/ability-card/trophy-buff-card-empty.webp",
  },
  {
    id: "6",
    name: "KANTONG HARTA",
    description: "Menambah jumlah koin yang diperoleh sebesar 5%",
    stock: 2,
    image: "/ability-card/coin-buff-card.webp",
    emptyImage: "/ability-card/coin-buff-card-empty.webp",
  },
];

export interface StarboxState {
  roomInfo: GameRoomWithPlayerCount | null;
  players: Player[];
  abilities: Ability[];
  currentTurnIndex: number;
  pickingAbilityId: string | null;
  isLoading: boolean;

  initGameData: (code: string, roomId: string) => Promise<void>;
  selectAbility: (abilityId: string) => void;
  nextTurn: () => void;
  reset: () => void;
}

export const useStarboxStore = create<StarboxState>((set) => ({
  roomInfo: null,
  players: [],
  abilities: INITIAL_ABILITIES,
  currentTurnIndex: 0,
  pickingAbilityId: null,
  isLoading: true,

  initGameData: async (code: string, roomId: string) => {
    // Reset state before fetching
    set({
      isLoading: true,
      currentTurnIndex: 0,
      abilities: INITIAL_ABILITIES,
      roomInfo: null,
      players: [],
    });

    try {
      // 1. Service Orchestrator untuk memangkas Logika kompleks dari global state.
      const roomConfig = await gameService.getGameRoomConfig(code, roomId);
      if (!roomConfig) {
        set({ isLoading: false });
        return;
      }
      
      const starboxPlayers = await gameService.loadStarboxPlayersTurnBased(roomConfig.max_player);

      set({
        roomInfo: roomConfig,
        players: starboxPlayers,
        isLoading: false,
      });
    } catch (e) {
      console.error("Error initializing starbox game data:", e);
      set({ isLoading: false });
    }
  },

  selectAbility: (abilityId: string) => {
    set((state) => ({
      pickingAbilityId: abilityId,
      abilities: state.abilities.map((a) =>
        a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a
      ),
    }));
  },

  nextTurn: () => {
    set((state) => ({
      pickingAbilityId: null,
      currentTurnIndex: state.currentTurnIndex + 1,
    }));
  },

  reset: () => {
    set({
      roomInfo: null,
      players: [],
      abilities: INITIAL_ABILITIES,
      currentTurnIndex: 0,
      pickingAbilityId: null,
      isLoading: true,
    });
  },
}));
