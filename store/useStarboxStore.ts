import { create } from "zustand";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { Player } from "@/lib/constants/players";
import { gameService } from "@/services/gameService";
import { createClient } from "@/lib/supabase/client";
import { abilityRoomRepository } from "@/repository/abilityRoomRepository";
import { abilityPlayerRepository } from "@/repository/abilityPlayerRepository";
import { userClientService } from "@/services/auth/userClientService";

const supabase = createClient();
let stockChannel: ReturnType<typeof supabase.channel> | null = null;

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
  serverStartTime: number | null;
  pickingAbilityId: string | null;
  isLoading: boolean;
  isHost: boolean;
  myPlayerId: string | null;

  /** Set of player IDs who have already picked an ability */
  pickedPlayerIds: string[];

  initGameData: (code: string, roomId: string) => Promise<void>;
  selectAbility: (
    roomId: string,
    abilityId: string,
    userId: string
  ) => Promise<void>;
  autoAssignRemaining: (roomId: string) => Promise<void>;
  setupRealtimeSubscription: (roomId: string) => void;
  cleanup: () => void;
  reset: () => void;
}

export const useStarboxStore = create<StarboxState>((set, get) => ({
  roomInfo: null,
  players: [],
  abilities: [],
  serverStartTime: null,
  pickingAbilityId: null,
  isLoading: true,
  isHost: false,
  myPlayerId: null,
  pickedPlayerIds: [],

  initGameData: async (code: string, roomId: string) => {
    // Reset state before fetching
    set({
      isLoading: true,
      abilities: [],
      serverStartTime: null,
      roomInfo: null,
      players: [],
      pickedPlayerIds: [],
      pickingAbilityId: null,
      isHost: false,
      myPlayerId: null,
    });

    try {
      // 1. Fetch room config
      const roomConfig = await gameService.getGameRoomConfig(code, roomId);
      if (!roomConfig) {
        set({ isLoading: false });
        return;
      }

      // 2. Ambil currentUser untuk mengecek isHost
      const currentUser = await userClientService.getCurrentUserNavbarData();
      const isHost = Boolean(
        currentUser && currentUser.id === roomConfig.user_id
      );

      // 3. Ambil participants dari API
      let activeParticipants: any[] = [];
      try {
        const res = await fetch(`/api/match/participants/${roomId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          activeParticipants = json.data || [];
        }
      } catch (err) {
        console.error("Gagal get participants di starbox", err);
      }

      const totalPlayer = activeParticipants.length || 1;

      // Sort by HP ascending (lowest HP picks first)
      activeParticipants = activeParticipants
        .sort((a: any, b: any) => (a.health ?? 100) - (b.health ?? 100))
        .map((p: any) => ({ ...p, isMe: p.id === currentUser?.id }));

      // 4. Insert dan Get all ability room (host initializes stock)
      let abilityRooms = await abilityRoomRepository.initialAbilites(
        roomId,
        totalPlayer,
        isHost
      );

      // Retry mechanism for non-host clients: wait for host to finish upsert/restock
      let totalStock =
        abilityRooms?.reduce(
          (sum: number, room: any) => sum + (room.stock || 0),
          0
        ) || 0;
      let retries = 5;

      while (!isHost && totalStock === 0 && retries > 0) {
        console.log(
          `[StarboxStore] Waiting for abilities to be initialized/restocked... (${retries} retries left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        abilityRooms = await abilityRoomRepository.initialAbilites(
          roomId,
          totalPlayer,
          false
        );
        totalStock =
          abilityRooms?.reduce(
            (sum: number, room: any) => sum + (room.stock || 0),
            0
          ) || 0;
        retries--;
      }

      // Map Supabase → Ability interface
      const mappedAbilities: Ability[] = (abilityRooms ?? []).map(
        (row: any) => {
          const detail = Array.isArray(row.abilities)
            ? row.abilities[0]
            : row.abilities;
          return {
            id: String(row.ability_id),
            name: detail?.name ?? "",
            description: detail?.description ?? "",
            stock: row.stock ?? 0,
            image: detail?.image ?? "",
            emptyImage: detail?.empty_image ?? "",
          };
        }
      );

      // Extract server Start Time (anchor)
      const serverStartTimeMs = abilityRooms && abilityRooms.length > 0
        ? Math.max(...abilityRooms.map((r: any) => new Date(r.updated_at).getTime()))
        : Date.now();

      set({
        roomInfo: roomConfig,
        players: activeParticipants as any,
        abilities: mappedAbilities,
        serverStartTime: serverStartTimeMs,
        isLoading: false,
        isHost,
        myPlayerId: currentUser?.id ?? null,
      });

      get().setupRealtimeSubscription(roomId);
    } catch (e: unknown) {
      const err = e as any;
      console.error(
        "Error initializing starbox game data:",
        err?.message || err?.details || JSON.stringify(err)
      );
      set({ isLoading: false });
    }
  },

  setupRealtimeSubscription: (roomId: string) => {
    // Clean up existing channel
    if (stockChannel) {
      supabase.removeChannel(stockChannel);
    }

    stockChannel = supabase
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

          // Update stock only — don't advance turn here
          set((state) => ({
            abilities: state.abilities.map((ability) =>
              ability.id === String(updatedAbility.ability_id)
                ? { ...ability, stock: updatedAbility.stock }
                : ability
            ),
          }));
        }
      )
      .subscribe();
  },

  selectAbility: async (roomId: string, abilityId: string, userId: string) => {
    const state = get();
    // Prevent double-picking
    if (state.pickedPlayerIds.includes(userId) || state.pickingAbilityId)
      return;

    // Optimistic UI update
    set((s) => ({
      pickingAbilityId: abilityId,
      abilities: s.abilities.map((a) =>
        a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a
      ),
      pickedPlayerIds: [...s.pickedPlayerIds, userId],
    }));

    // Persist to DB via RPC (this triggers postgres_changes for stock sync)
    try {
      await abilityPlayerRepository.insertPlayerAbility(
        roomId,
        abilityId,
        userId
      );
    } catch (error) {
      console.error("Gagal memilih ability", error);
    }
  },

  autoAssignRemaining: async (roomId: string) => {
    const { players, pickedPlayerIds, abilities } = get();

    // Find players who haven't picked
    const unpickedPlayerIds = players
      .map((p) => p.id)
      .filter((id) => !pickedPlayerIds.includes(id));

    if (unpickedPlayerIds.length === 0) return;

    // Get available abilities with stock > 0
    const availableAbilities = abilities.filter((a) => a.stock > 0);
    if (availableAbilities.length === 0) return;

    // Build a flat array of ability IDs based on remaining stock
    const abilityPool: string[] = [];
    for (const ability of availableAbilities) {
      for (let i = 0; i < ability.stock; i++) {
        abilityPool.push(ability.id);
      }
    }

    // Shuffle the pool (Fisher-Yates)
    for (let i = abilityPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [abilityPool[i], abilityPool[j]] = [abilityPool[j], abilityPool[i]];
    }

    const assignments = [];
    const updatedAbilities = [...abilities];
    const newPickedPlayerIds = [...pickedPlayerIds];

    // Assign one item per unpicked player (sequentially to avoid conflicts)
    for (
      let i = 0;
      i < unpickedPlayerIds.length && i < abilityPool.length;
      i++
    ) {
      const playerId = unpickedPlayerIds[i];
      const abilityId = abilityPool[i];

      assignments.push({ playerId, abilityId });

      // Apply optimistic update locally
      const abilityIndex = updatedAbilities.findIndex(
        (a) => a.id === abilityId
      );
      if (abilityIndex !== -1 && updatedAbilities[abilityIndex].stock > 0) {
        updatedAbilities[abilityIndex] = {
          ...updatedAbilities[abilityIndex],
          stock: updatedAbilities[abilityIndex].stock - 1,
        };
      }
      newPickedPlayerIds.push(playerId);
    }

    // Set optimistic state
    set({
      abilities: updatedAbilities,
      pickedPlayerIds: newPickedPlayerIds,
    });

    try {
      // Use the server API to bypass RLS, because the host cannot insert rows for other user_id directly
      const response = await fetch("/api/starbox/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, assignments }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal auto-assign dari server");
      }

      const resData = await response.json();
      if (!resData.success) {
        console.error("Partial failure in auto-assign:", resData.failed);
      }
    } catch (error: any) {
      console.error(
        "Gagal bulk auto-assign ability:",
        error?.message || error?.details || JSON.stringify(error)
      );
    }
  },

  cleanup: () => {
    if (stockChannel) {
      supabase.removeChannel(stockChannel);
      stockChannel = null;
    }
  },

  reset: () => {
    if (stockChannel) {
      supabase.removeChannel(stockChannel);
      stockChannel = null;
    }
    set({
      roomInfo: null,
      players: [],
      abilities: [],
      serverStartTime: null,
      pickingAbilityId: null,
      isLoading: true,
      isHost: false,
      myPlayerId: null,
      pickedPlayerIds: [],
    });
  },
}));
