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

export interface AbilityPlayer {
  ability_player_id: string;
  game_room_id: string;
  ability_id: number;
  stock: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PickedAbility {
  ability_player_id: string | null;
  game_room_id: string;
  ability_id: number;
  stock: number;
  user_id: string;
  name: string;
  description: string;
  image: string;
  empty_image: string;
}

/**
 * State yang disimpan ke `sessionStorage` via middleware `persist`.
 * sessionStorage dipilih agar otomatis hilang saat tab/browser ditutup.
 */
interface PersistedStarboxSlice {
  /** roomId fase aktif — dipakai sebagai kunci Phase Checking */
  roomPersistedId: string | null;
  /** nextRound saat fase dimulai — dipakai sebagai kunci Phase Checking */
  activeStarboxRound: string | null;
  /** Index giliran saat ini — dipersist agar tidak reset saat refresh */
  currentTurnIndex: number;
  /** Ability yang dipilih di fase BERJALAN — direset saat masuk fase baru */
  myPickedAbility: PickedAbility | null;
  /**
   * Inventori kumulatif semua ability yang pernah dipilih sepanjang game.
   * Tidak direset antar fase, hanya dikosongkan saat game selesai via reset().
   * Di-hydrate ulang dari DB setiap halaman dimuat untuk menjamin sinkronisasi.
   */
  myInventory: PickedAbility[];
}

export interface StarboxState extends PersistedStarboxSlice {
  roomInfo: GameRoomWithPlayerCount | null;
  players: Player[];
  abilities: Ability[];
  pickingAbilityId: string | null;
  isLoading: boolean;

  initGameData: (code: string, roomId: string, nextRound: string) => Promise<void>;
  selectAbility: (roomId: string, abilityId: string, userId: string) => Promise<void>;
  setupRealtimeSubscription: (roomId: string) => void;
  reset: () => void;
}

export const useStarboxStore = create<StarboxState>()(
  persist(
    (set, get) => ({
      roomPersistedId: null,
      activeStarboxRound: null,
      currentTurnIndex: 0,
      myPickedAbility: null,
      myInventory: [],
      roomInfo: null,
      players: [],
      abilities: [],
      pickingAbilityId: null,
      isLoading: true,

      /**
       * Entry point halaman Starbox. Dipanggil sekali saat komponen mount.
       * Menjalankan Phase Checking, fetch semua data, dan subscribe Realtime.
       *
       * Phase Checking:
       *   - Fase BARU (roomId/nextRound berbeda) → reset turn & pilihan lama
       *   - REFRESH (sama) → pertahankan currentTurnIndex & myPickedAbility dari sessionStorage
       */
      initGameData: async (code: string, roomId: string, nextRound: string) => {
        const state = get();

        // Deteksi apakah ini fase baru atau hanya refresh
        const isNewPhase = state.roomPersistedId !== roomId || state.activeStarboxRound !== nextRound;

        if (isNewPhase) {
          set({
            isLoading: true,
            currentTurnIndex: 0, // Reset giliran ke awal hanya jika fase benar-benar baru
            myPickedAbility: null, // Hapus pilihan fase lama
            abilities: [],
            roomInfo: null,
            players: [],
            roomPersistedId: roomId,
            activeStarboxRound: nextRound,
          });
        } else {
          // Refresh: jangan sentuh currentTurnIndex, myPickedAbility, myInventory
          set({ isLoading: true, abilities: [], roomInfo: null, players: [] });
        }

        try {
          const roomConfig = await gameService.getGameRoomConfig(code, roomId);
          if (!roomConfig) {
            set({ isLoading: false });
            return;
          }

          const currentUser = await userClientService.getCurrentUserNavbarData();
          const isHost = Boolean(currentUser && currentUser.id === roomConfig.user_id);

          let activeParticipants: any[] = [];
          try {
            const res = await fetch(`/api/match/participants/${roomId}`, { cache: "no-store" });
            if (res.ok) activeParticipants = (await res.json()).data || [];
          } catch (err) {
            console.error("Gagal get participants di starbox", err);
          }

          const totalPlayer = activeParticipants.length || 1;

          // Urutkan peserta HP terendah → tertinggi
          activeParticipants = activeParticipants
            .sort((a, b) => (a.health ?? 100) - (b.health ?? 100))
            .map((p) => ({ ...p, isMe: p.id === currentUser?.id }));

          // Init stok ability: hanya Host & fase baru yang boleh reset stok ke nilai awal
          // Jika refresh → skip upsert agar stok yang sudah berkurang tidak overwrite
          const abilityRooms = await abilityRoomRepository.initialAbilites(roomId, totalPlayer, isHost && isNewPhase);

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

          set({ roomInfo: roomConfig, players: activeParticipants as any, abilities: mappedAbilities, isLoading: false });

          // Hydrate myInventory dari DB — override sessionStorage agar selalu sinkron.
          // Untuk kasus: refresh, beda device, atau RPC gagal sebelumnya.
          if (currentUser?.id) {
            try {
              const raw = await abilityPlayerRepository.getMyAbilities(roomId, currentUser.id);
              const myInventoryFromDb: PickedAbility[] = (raw ?? []).map((row: any) => {
                const detail = Array.isArray(row.abilities) ? row.abilities[0] : row.abilities;
                return {
                  ability_player_id: row.ability_player_id,
                  game_room_id: row.game_room_id,
                  ability_id: row.ability_id,
                  stock: row.stock,
                  user_id: row.user_id,
                  name: detail?.name ?? "",
                  description: detail?.description ?? "",
                  image: detail?.image ?? "",
                  empty_image: detail?.empty_image ?? "",
                };
              });
              set({ myInventory: myInventoryFromDb });
            } catch (err) {
              console.warn("[StarboxStore] Gagal hydrate myInventory dari DB, pakai sessionStorage:", err);
            }
          }

          get().setupRealtimeSubscription(roomId);
        } catch (e: unknown) {
          const err = e as { message?: string; details?: string };
          console.error("Error initializing starbox game data:", err?.message || err?.details || JSON.stringify(e));
          set({ isLoading: false });
        }
      },

      /**
       * Subscribe ke Supabase Realtime untuk memantau perubahan stok di `ability_rooms`.
       * Setiap kali pemain lain pick ability → DB berubah → semua client menerima event ini
       * → stok di-update & giliran dinaikkan secara otomatis.
       */
      setupRealtimeSubscription: (roomId: string) => {
        // Hapus channel lama sebelum subscribe ulang (cegah listener duplikat)
        if (channel) supabase.removeChannel(channel);

        channel = supabase
          .channel(`starbox_room:${roomId}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "ability_rooms", filter: `game_room_id=eq.${roomId}` }, (payload) => {
            console.log("[StarboxStore] Stock updated via realtime:", payload);
            const updatedAbility = payload.new as any;

            set((state) => ({
              abilities: state.abilities.map((ability) =>
                ability.id === String(updatedAbility.ability_id) ? { ...ability, stock: updatedAbility.stock } : ability,
              ),
              pickingAbilityId: null,
              currentTurnIndex: state.currentTurnIndex + 1,
            }));
          })
          .subscribe();
      },

      /**
       * Dipanggil saat user klik AbilityCard. Menerapkan Optimistic Update:
       *   1. Update state lokal langsung (UI responsif)
       *   2. Kirim ke DB via RPC
       *   3. Jika RPC gagal → rollback semua perubahan lokal
       */
      selectAbility: async (roomId: string, abilityId: string, userId: string) => {
        const { abilities } = get();
        const chosenAbility = abilities.find((a) => a.id === abilityId);

        set((state) => ({
          pickingAbilityId: abilityId,
          abilities: state.abilities.map((a) => (a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a)),
          myPickedAbility: chosenAbility
            ? ({
                ability_player_id: null,
                game_room_id: roomId,
                ability_id: Number(chosenAbility.id),
                stock: 1,
                user_id: userId,
                name: chosenAbility.name,
                description: chosenAbility.description,
                image: chosenAbility.image,
                empty_image: chosenAbility.emptyImage,
              } satisfies PickedAbility)
            : null,
          myInventory: chosenAbility
            ? (() => {
                const prev = state.myInventory;
                const existingIdx = prev.findIndex((a) => a.ability_id === Number(chosenAbility.id));
                if (existingIdx !== -1) {
                  // Ability sudah ada → stack (increment stock)
                  const updated = [...prev];
                  updated[existingIdx] = { ...updated[existingIdx], stock: updated[existingIdx].stock + 1 };
                  return updated;
                }
                // Ability baru → push entry baru
                return [
                  ...prev,
                  {
                    ability_player_id: null,
                    game_room_id: roomId,
                    ability_id: Number(chosenAbility.id),
                    stock: 1,
                    user_id: userId,
                    name: chosenAbility.name,
                    description: chosenAbility.description,
                    image: chosenAbility.image,
                    empty_image: chosenAbility.emptyImage,
                  } satisfies PickedAbility,
                ];
              })()
            : state.myInventory,
        }));

        try {
          const result = await abilityPlayerRepository.insertPlayerAbility(roomId, abilityId, userId);
          // Jika RPC mengembalikan ID asli, update ability_player_id dari null → UUID DB
          if (result && typeof result === "object" && "ability_player_id" in result) {
            set((state) => ({
              myPickedAbility: state.myPickedAbility
                ? { ...state.myPickedAbility, ability_player_id: (result as AbilityPlayer).ability_player_id }
                : null,
            }));
          }
        } catch (error) {
          console.error("Gagal memilih ability", error);
          // Rollback: kembalikan stok, hapus pilihan, undo myInventory
          set((state) => ({
            pickingAbilityId: null,
            myPickedAbility: null,
            abilities: state.abilities.map((a) => (a.id === abilityId ? { ...a, stock: a.stock + 1 } : a)),
            myInventory: (() => {
              const prev = state.myInventory;
              const idx = prev.findIndex((a) => a.ability_id === Number(abilityId));
              if (idx === -1) return prev;
              if (prev[idx].stock <= 1) return prev.filter((_, i) => i !== idx); // Hapus jika stock jadi 0
              const updated = [...prev];
              updated[idx] = { ...updated[idx], stock: updated[idx].stock - 1 };
              return updated;
            })(),
          }));
        }
      },

      /**
       * Bersihkan semua state dan tutup koneksi Realtime.
       * Dipanggil saat game selesai sepenuhnya.
       */
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
          myPickedAbility: null,
          myInventory: [],
          pickingAbilityId: null,
          isLoading: true,
        });
      },
    }),

    {
      name: "starbox-store",
      storage: createJSONStorage(() => sessionStorage), // sessionStorage: otomatis hilang saat tab ditutup
      partialize: (state): PersistedStarboxSlice => ({
        currentTurnIndex: state.currentTurnIndex,
        roomPersistedId: state.roomPersistedId,
        activeStarboxRound: state.activeStarboxRound,
        myPickedAbility: state.myPickedAbility,
        myInventory: state.myInventory,
      }),
    },
  ),
);
