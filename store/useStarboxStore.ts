import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { Player } from "@/lib/constants/players";
import { gameService } from "@/services/gameService";
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

/** Bagian state yang dipersist ke sessionStorage untuk bertahan saat refresh */
interface PersistedStarboxSlice {
  /** roomId yang sedang aktif di fase Starbox ini */
  roomPersistedId: string | null;
  /** Nilai nextRound saat fase Starbox ini dimulai – dipakai sebagai kunci fase */
  activeStarboxRound: string | null;
  /** Giliran pick saat ini – dipertahankan agar tidak reset saat refresh */
  currentTurnIndex: number;
}

export interface StarboxState extends PersistedStarboxSlice {
  roomInfo: GameRoomWithPlayerCount | null;
  players: Player[];
  abilities: Ability[];
  pickingAbilityId: string | null;
  isLoading: boolean;

  /**
   * @param code       - room code dari URL
   * @param roomId     - room ID dari URL
   * @param nextRound  - ronde berikutnya dari URL (dipakai sebagai kunci fase Starbox)
   */
  initGameData: (code: string, roomId: string, nextRound: string) => Promise<void>;
  selectAbility: (roomId: string, abilityId: string, userId: string) => Promise<void>;
  setupRealtimeSubscription: (roomId: string) => void;
  reset: () => void;
}

export const useStarboxStore = create<StarboxState>()(
  persist(
    (set, get) => ({
      // ── Persisted slice ──────────────────────────────────────────
      roomPersistedId: null,
      activeStarboxRound: null,
      currentTurnIndex: 0,

      // ── Non-persisted slice ──────────────────────────────────────
      roomInfo: null,
      players: [],
      abilities: [],
      pickingAbilityId: null,
      isLoading: true,

      // ── Actions ──────────────────────────────────────────────────

      initGameData: async (code: string, roomId: string, nextRound: string) => {
        const state = get();

        /**
         * Strategi 3 – Phase Checking:
         * Cek apakah ini fase Starbox BARU (room berbeda ATAU ronde berbeda).
         * - Jika BARU  → reset currentTurnIndex ke 0 dan simpan kunci fase baru.
         * - Jika SAMA  → pertahankan currentTurnIndex dari sessionStorage (efek refresh).
         */
        const isNewPhase =
          state.roomPersistedId !== roomId ||
          state.activeStarboxRound !== nextRound;

        if (isNewPhase) {
          set({
            isLoading: true,
            currentTurnIndex: 0, // ← reset HANYA saat fase benar-benar baru
            abilities: [],
            roomInfo: null,
            players: [],
            roomPersistedId: roomId,
            activeStarboxRound: nextRound,
          });
        } else {
          // Refresh pada fase yang sama → jangan reset currentTurnIndex!
          set({ isLoading: true, abilities: [], roomInfo: null, players: [] });
        }

        try {
          // 1. Ambil config room
          const roomConfig = await gameService.getGameRoomConfig(code, roomId);
          if (!roomConfig) {
            set({ isLoading: false });
            return;
          }

          // 2. Ambil currentUser untuk mengecek isHost
          const currentUser = await userClientService.getCurrentUserNavbarData();
          const isHost = Boolean(currentUser && currentUser.id === roomConfig.user_id);

          // 3. Ambil participants dari API
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

          const totalPlayer = activeParticipants.length || 1;

          activeParticipants = activeParticipants
            .sort((a, b) => (a.health ?? 100) - (b.health ?? 100))
            .map((p) => ({ ...p, isMe: p.id === currentUser?.id }));

          // 4. Insert dan Get all ability room
          const abilityRooms = await abilityRoomRepository.initialAbilites(
            roomId,
            totalPlayer,
            isHost,
          );

          // 5. Map struktur Supabase → Ability interface
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
        } catch (e: unknown) {
          const err = e as { message?: string; details?: string };
          console.error(
            "Error initializing starbox game data:",
            err?.message || err?.details || JSON.stringify(e),
          );
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

              set((state) => ({
                abilities: state.abilities.map((ability) =>
                  ability.id === String(updatedAbility.ability_id)
                    ? { ...ability, stock: updatedAbility.stock }
                    : ability,
                ),
                pickingAbilityId: null,
                // Naikkan giliran setiap kali DB terkonfirmasi berubah
                currentTurnIndex: state.currentTurnIndex + 1,
              }));
            },
          )
          .subscribe();
      },

      selectAbility: async (roomId: string, abilityId: string, userId: string) => {
        set((state) => ({
          pickingAbilityId: abilityId,
          abilities: state.abilities.map((a) =>
            a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a,
          ),
        }));

        try {
          await abilityPlayerRepository.insertPlayerAbility(roomId, abilityId, userId);
        } catch (error) {
          console.error("Gagal memilih ability", error);
        }
      },

      reset: () => {
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
        set({
          roomPersistedId: null,
          activeStarboxRound: null,
          roomInfo: null,
          players: [],
          abilities: [],
          currentTurnIndex: 0,
          pickingAbilityId: null,
          isLoading: true,
        });
      },
    }),
    {
      name: "starbox-store",
      /**
       * Strategi 2 – Persistensi State Client (sessionStorage):
       * Hanya simpan slice kecil yang diperlukan untuk bertahan saat refresh.
       * sessionStorage dipilih karena otomatis terhapus ketika tab/browser ditutup.
       */
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): PersistedStarboxSlice => ({
        currentTurnIndex: state.currentTurnIndex,
        roomPersistedId: state.roomPersistedId,
        activeStarboxRound: state.activeStarboxRound,
      }),
    },
  ),
);
