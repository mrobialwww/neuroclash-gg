import { create } from "zustand";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { Player } from "@/lib/constants/players";
import { gameService } from "@/services/gameService";
import { useQuizLobbyStore } from "@/store/useQuizLobbyStore";
import { createClient } from "@/lib/supabase/client";
import { abilityRoomRepository } from "@/repository/abilityRoomRepository";
import { abilityPlayerRepository } from "@/repository/abilityPlayerRepository";
import { userClientService } from "@/services/auth/userClientService";

const supabase = createClient();
let channel: ReturnType<typeof supabase.channel> | null = null;

export interface Ability {
  id: string;
  name: string;
  description: string;
  stock: number;
  image: string;
  emptyImage: string;
}

export interface StarboxState {
  roomInfo: GameRoomWithPlayerCount | null;
  players: Player[];
  abilities: Ability[];
  currentTurnIndex: number;
  pickingAbilityId: string | null;
  isLoading: boolean;

  initGameData: (code: string, roomId: string) => Promise<void>;
  selectAbility: (roomId: string, abilityId: string, userId: string) => Promise<void>;
  setupRealtimeSubscription: (roomId: string) => void;
  reset: () => void;
}

export const useStarboxStore = create<StarboxState>((set, get) => ({
  roomInfo: null,
  players: [],
  abilities: [],
  currentTurnIndex: 0,
  pickingAbilityId: null,
  isLoading: true,

  initGameData: async (code: string, roomId: string) => {
    // Reset state before fetching
    set({
      isLoading: true,
      currentTurnIndex: 0,
      abilities: [],
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

      // 2. Ambil currentUser untuk mengecek isHost
      const currentUser = await userClientService.getCurrentUserNavbarData();
      const isHost = Boolean(currentUser && currentUser.id === roomConfig.user_id);

      // 3. Ambil participants dari API (karena useQuizLobbyStore bisa reset jika kena window.location.href)
      let activeParticipants: any[] = [];
      try {
        const res = await fetch(`/api/match/participants/${roomId}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          activeParticipants = json.data || [];
        }
      } catch (err) {
        console.error("Gagal get participants di starbox", err);
      }

      let totalPlayer = activeParticipants.length || 1;

      activeParticipants = activeParticipants.map((p) => ({ ...p, isMe: p.id === currentUser?.id }));
      // if (roomConfig.max_player === 1) {
      //   // Solo mode, find me only atau mock 1
      //   activeParticipants = activeParticipants.filter(p => p.id === currentUser?.id);
      //   if (activeParticipants.length === 0) activeParticipants = [{ id: currentUser?.id, isMe: true }];
      //   totalPlayer = 1;
      // }

      //Insert dan Get all ability room ✅
      const abilityRooms = await abilityRoomRepository.initialAbilites(roomId, totalPlayer, isHost);

      // Map struktur Supabase → Ability interface ✅
      const mappedAbilities: Ability[] = (abilityRooms ?? []).map((row: any) => {
        const detail = Array.isArray(row.abilities) ? row.abilities[0] : row.abilities;
        return {
          id: String(row.ability_id),
          name: detail?.name ?? "",
          description: detail?.description ?? "",
          stock: row.stock ?? 0,
          image: detail?.image ?? "",
          emptyImage: detail?.empty_image ?? "",
        };
      });

      set({
        roomInfo: roomConfig,
        players: activeParticipants as any,
        abilities: mappedAbilities,
        isLoading: false,
      });

      get().setupRealtimeSubscription(roomId);
    } catch (e: any) {
      console.error("Error initializing starbox game data:", e?.message || e?.details || JSON.stringify(e));
      set({ isLoading: false });
    }
  },

  setupRealtimeSubscription: (roomId: string) => {
    // Hindari subscribe berulang pada room yang sama
    if (channel) {
      supabase.removeChannel(channel);
    }

    channel = supabase
      .channel(`starbox_room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ability_rooms",
          filter: `game_room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("[StarboxStore] Stock updated via realtime:", payload);

          const updatedAbility = payload.new as any;

          // Update state abilities di Zustand
          set((state) => ({
            abilities: state.abilities.map((ability) =>
              ability.id === String(updatedAbility.ability_id) ? { ...ability, stock: updatedAbility.stock } : ability,
            ),
            pickingAbilityId: null,
            currentTurnIndex: state.currentTurnIndex + 1,
          }));
        },
      )
      .subscribe();
  },

  selectAbility: async (roomId: string, abilityId: string, userId: string) => {
    //Insert ability to rpc "increment ability" ✅
    try {
      await abilityPlayerRepository.insertPlayerAbility(roomId, abilityId, userId);
    } catch (error) {
      console.error("Gagal memilih ability", error);
    }

    set((state) => ({
      pickingAbilityId: abilityId,
      abilities: state.abilities.map((a) => (a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a)),
    }));
  },

  reset: () => {
    set({
      roomInfo: null,
      players: [],
      abilities: [],
      currentTurnIndex: 0,
      pickingAbilityId: null,
      isLoading: true,
    });
  },
}));
