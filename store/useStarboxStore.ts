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
let stockChannel: ReturnType<typeof supabase.channel> | null = null;
let playerChannel: ReturnType<typeof supabase.channel> | null = null;

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

export interface AbilityMaterial {
  ability_materi_id: string;
  title: string | null;
  content: string | null;
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
  ability_materials: AbilityMaterial | null;
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
  isHost: boolean;
  myPlayerId: string | null;
  pickedPlayerIds: string[];
  attackorShield: number;

  initGameData: (code: string, roomId: string, nextRound: string) => Promise<void>;
  selectAbility: (roomId: string, abilityId: string, userId: string) => Promise<void>;
  autoAssignRemaining: (roomId: string) => Promise<void>;
  setupRealtimeSubscription: (roomId: string) => void;
  useHeal: (roomId: string, userId: string) => Promise<void>;
  useAttackorShield: (roomId: string, userId: string, abilityId: number) => Promise<void>;
  /** Kurangi stock ability di local Zustand store tanpa menyentuh DB (Optimistic UI). */
  decrementLocalStock: (abilityId: number) => void;
  refreshMyInventory: (roomId: string, userId: string) => Promise<void>;
  cleanup: () => void;
  reset: () => void;
  triggerSkipTurn: () => void;
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
      isHost: false,
      myPlayerId: null,
      pickedPlayerIds: [],
      attackorShield: 0,

      /**
       * Entry point halaman Starbox. Dipanggil sekali saat komponen mount.
       * Phase Checking:
       *   - Fase BARU → reset turn, pilihan lama, pickedPlayerIds
       *   - REFRESH (fase sama) → pertahankan currentTurnIndex & myPickedAbility
       * Retry mechanism: non-host client akan polling hingga 5x (interval 1 detik)
       * untuk menunggu host selesai inisialisasi stok ability di DB.
       */
      initGameData: async (code: string, roomId: string, nextRound: string) => {
        const state = get();
        const isNewPhase = state.roomPersistedId !== roomId || state.activeStarboxRound !== nextRound;

        if (isNewPhase) {
          set({
            isLoading: true,
            currentTurnIndex: 0,
            myPickedAbility: null,
            abilities: [],
            roomInfo: null,
            players: [],
            pickedPlayerIds: [],
            pickingAbilityId: null,
            isHost: false,
            myPlayerId: null,
            roomPersistedId: roomId,
            activeStarboxRound: nextRound,
          });
        } else {
          set({
            isLoading: true,
            abilities: [],
            roomInfo: null,
            players: [],
            pickedPlayerIds: [],
            pickingAbilityId: null,
            attackorShield: 0,
          });
        }

        try {
          const roomConfig = await gameService.getGameRoomConfig(code, roomId);
          if (!roomConfig) {
            set({ isLoading: false });
            return;
          }

          // Cek apakah user adalah host room ini — host yang mengontrol restock ability.
          const currentUser = await userClientService.getCurrentUserNavbarData();
          const isHost = Boolean(currentUser && currentUser.id === roomConfig.user_id);

          // Fetch semua peserta aktif di room. Fallback ke array kosong jika endpoint gagal
          // (misal: network error), agar proses tidak berhenti total.
          let activeParticipants: any[] = [];
          try {
            const res = await fetch(`/api/match/participants/${roomId}`, {
              cache: "no-store",
            });
            if (res.ok) activeParticipants = (await res.json()).data || [];
          } catch (err) {
            console.error("Gagal get participants di starbox", err);
          }

          const totalPlayer = activeParticipants.length || 1;

          // Urutan giliran Starbox = HP terendah memilih lebih dahulu (comeback mechanic).
          // Hanya pemain yang masih hidup yang bisa memilih.
          activeParticipants = activeParticipants
            .filter((p: any) => p.health > 0)
            .sort((a, b) => (a.health ?? 100) - (b.health ?? 100))
            .map((p) => ({ ...p, isMe: p.id === currentUser?.id }));

          // Host & fase baru → reset stok ke nilai awal (upsert semua ability_rooms).
          // Host fase lama / non-host → hanya baca stok yang sudah ada di DB.
          let abilityRooms = await abilityRoomRepository.initialAbilites(roomId, totalPlayer, isHost && isNewPhase);

          // Non-host bisa tiba sebelum host selesai insert, sehingga stok masih 0.
          // Polling maks 5× (interval 1 s) sebelum menyerah dan lanjut dengan stok 0.
          let totalStock = abilityRooms?.reduce((sum: number, r: any) => sum + (r.stock || 0), 0) || 0;
          let retries = 5;
          while (!isHost && totalStock === 0 && retries > 0) {
            console.log(`[StarboxStore] Waiting for abilities... (${retries} retries left)`);
            await new Promise((res) => setTimeout(res, 1000));
            abilityRooms = await abilityRoomRepository.initialAbilites(roomId, totalPlayer, false);
            totalStock = abilityRooms?.reduce((sum: number, r: any) => sum + (r.stock || 0), 0) || 0;
            retries--;
          }

          // Normalisasi shape DB (ability_rooms JOIN abilities) → shape Ability yang dipakai UI.
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

          // Commit ke store — komponen langsung render ulang dengan data real.
          // isLoading = false di sini mempersilakan UI Starbox tampil.
          set({
            roomInfo: roomConfig,
            players: activeParticipants as any,
            abilities: mappedAbilities,
            isLoading: false,
            isHost,
            myPlayerId: currentUser?.id ?? null,
          });

          // myInventory perlu di-hydrate dari DB karena sessionStorage hanya menyimpan
          // snapshot tanpa ability_materials (data materi quiz). DB selalu jadi source of truth.
          if (currentUser?.id) {
            try {
              const raw = await abilityPlayerRepository.getMyAbilities(roomId, currentUser.id);
              const myInventoryFromDb: PickedAbility[] = (raw ?? []).map((row: any) => {
                const detail = Array.isArray(row.abilities) ? row.abilities[0] : row.abilities;
                // ability_materials dipakai oleh OverlayMaterialCard (ability_id === 1).
                const material: AbilityMaterial | null = row.ability_materials ?? null;
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
                  ability_materials: material,
                };
              });
              set({ myInventory: myInventoryFromDb });
            } catch (err) {
              // Jika fetch gagal, biarkan myInventory tetap dari sessionStorage (mungkin stale).
              console.warn("[StarboxStore] Gagal hydrate myInventory dari DB, pakai sessionStorage:", err);
            }
          }

          // Buka koneksi Realtime setelah semua data siap — hindari event masuk sebelum state ready.
          get().setupRealtimeSubscription(roomId);
        } catch (e: unknown) {
          const err = e as { message?: string; details?: string };
          console.error("Error initializing starbox game data:", err?.message || err?.details || JSON.stringify(e));
          set({ isLoading: false });
        }
      },
      /**
       * Subscribe ke Supabase Realtime untuk memantau perubahan stok di `ability_rooms`,
       * dan menerima broadcast "player_picked" agar state pickedPlayerIds tersinkron.
       */
      setupRealtimeSubscription: (roomId: string) => {
        if (stockChannel) supabase.removeChannel(stockChannel);

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
              const updatedAbility = payload.new as any;
              set((state) => {
                const isOwnPick = state.pickingAbilityId !== null;
                return {
                  abilities: state.abilities.map((ability) =>
                    ability.id === String(updatedAbility.ability_id) ? { ...ability, stock: updatedAbility.stock } : ability,
                  ),
                  pickingAbilityId: null,
                };
              });
            },
          )
          .on("broadcast", { event: "player_picked" }, (payload) => {
            const userId = payload.payload.userId;
            set((state) => {
              if (state.pickedPlayerIds.includes(userId)) return state;
              return { pickedPlayerIds: [...state.pickedPlayerIds, userId] };
            });
          })
          .on("broadcast", { event: "turn_skipped" }, (payload) => {
            const turnIndexSkipped = payload.payload.turnIndex;
            set((state) => {
              if (state.currentTurnIndex === turnIndexSkipped) {
                return { currentTurnIndex: state.currentTurnIndex + 1 };
              }
              return state;
            });
          })
          .subscribe();

        // Separate channel for players so we can cleanup properly
        if (playerChannel) supabase.removeChannel(playerChannel);
        playerChannel = supabase
          .channel(`starbox_players:${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "game_players",
              filter: `game_room_id=eq.${roomId}`,
            },
            (payload) => {
              const updated = payload.new as any;
              set((state) => ({
                players: state.players.map((p) =>
                  p.id === updated.user_id
                    ? {
                        ...p,
                        health: updated.health,
                        is_alive: updated.status === "alive",
                      }
                    : p,
                ),
              }));
            },
          )
          .subscribe();
      },

      triggerSkipTurn: () => {
        const state = get();
        if (stockChannel) {
          stockChannel.send({
            type: "broadcast",
            event: "turn_skipped",
            payload: { turnIndex: state.currentTurnIndex },
          });
        }
        set({ currentTurnIndex: state.currentTurnIndex + 1 });
      },

      /**
       * Dipanggil saat user klik AbilityCard.
       */
      selectAbility: async (roomId: string, abilityId: string, userId: string) => {
        const state = get();
        if (state.pickedPlayerIds.includes(userId) || state.pickingAbilityId) return;

        const chosenAbility = state.abilities.find((a) => a.id === abilityId);

        set((s) => ({
          pickingAbilityId: abilityId,
          abilities: s.abilities.map((a) => (a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a)),
          pickedPlayerIds: [...s.pickedPlayerIds, userId],
          // currentTurnIndex is now handled only by timer expiration in page.tsx
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
                ability_materials: null,
              } satisfies PickedAbility)
            : null,
          myInventory: chosenAbility
            ? (() => {
                const prev = s.myInventory;
                const existingIdx = prev.findIndex((a) => a.ability_id === Number(chosenAbility.id));
                if (existingIdx !== -1) {
                  const updated = [...prev];
                  updated[existingIdx] = {
                    ...updated[existingIdx],
                    stock: updated[existingIdx].stock + 1,
                  };
                  return updated;
                }
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
                    ability_materials: null,
                  } satisfies PickedAbility,
                ];
              })()
            : s.myInventory,
        }));

        // Broadcast to other clients that this player has picked
        if (stockChannel) {
          stockChannel.send({
            type: "broadcast",
            event: "player_picked",
            payload: { userId },
          });
        }

        try {
          const result = await abilityPlayerRepository.insertPlayerAbility(roomId, abilityId, userId);
          // Isi ability_player_id dengan UUID asli dari DB jika RPC mengembalikannya
          if (result && typeof result === "object" && "ability_player_id" in result) {
            set((s) => ({
              myPickedAbility: s.myPickedAbility
                ? {
                    ...s.myPickedAbility,
                    ability_player_id: (result as AbilityPlayer).ability_player_id,
                  }
                : null,
            }));
          }
        } catch (error) {
          console.error("Gagal memilih ability", error);
          // Rollback semua perubahan optimistic
          set((s) => ({
            pickingAbilityId: null,
            myPickedAbility: null,
            pickedPlayerIds: s.pickedPlayerIds.filter((id) => id !== userId),
            abilities: s.abilities.map((a) => (a.id === abilityId ? { ...a, stock: a.stock + 1 } : a)),
            myInventory: (() => {
              const prev = s.myInventory;
              const idx = prev.findIndex((a) => a.ability_id === Number(abilityId));
              if (idx === -1) return prev;
              if (prev[idx].stock <= 1) return prev.filter((_, i) => i !== idx);
              const updated = [...prev];
              updated[idx] = { ...updated[idx], stock: updated[idx].stock - 1 };
              return updated;
            })(),
          }));
        }
      },

      /**
       * Dipanggil oleh Host ketika waktu Starbox habis.
       * Menggunakan pickedPlayerIds tersinkron untuk menghindari double assign.
       */
      autoAssignRemaining: async (roomId: string) => {
        const { players, abilities, pickedPlayerIds } = get();

        // Hitung pemain yang benar-benar belum memilih (menggunakan state yang sudah tersinkron via broadcast)
        const unpickedPlayerIds = players.map((p) => p.id).filter((id) => !pickedPlayerIds.includes(id));

        if (unpickedPlayerIds.length === 0) return;

        const availableAbilities = abilities.filter((a) => a.stock > 0);
        if (availableAbilities.length === 0) return;

        const abilityPool: string[] = [];
        for (const ability of availableAbilities) {
          for (let i = 0; i < ability.stock; i++) {
            abilityPool.push(ability.id);
          }
        }

        // Fisher-Yates shuffle — distribusi acak yang adil tanpa bias.
        for (let i = abilityPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [abilityPool[i], abilityPool[j]] = [abilityPool[j], abilityPool[i]];
        }

        const assignments = [];
        const updatedAbilities = [...abilities];
        const newPickedPlayerIds = [...pickedPlayerIds];

        for (let i = 0; i < unpickedPlayerIds.length && i < abilityPool.length; i++) {
          const playerId = unpickedPlayerIds[i];
          const abilityId = abilityPool[i];

          assignments.push({ playerId, abilityId });

          const abilityIndex = updatedAbilities.findIndex((a) => a.id === abilityId);
          if (abilityIndex !== -1 && updatedAbilities[abilityIndex].stock > 0) {
            updatedAbilities[abilityIndex] = {
              ...updatedAbilities[abilityIndex],
              stock: updatedAbilities[abilityIndex].stock - 1,
            };
          }
          newPickedPlayerIds.push(playerId);
        }

        set({
          abilities: updatedAbilities,
          pickedPlayerIds: newPickedPlayerIds,
        });

        try {
          const response = await fetch("/api/starbox/auto-assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, assignments }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Gagal auto-assign dari server");
          }
        } catch (error: any) {
          console.error("Gagal bulk auto-assign ability:", error?.message || JSON.stringify(error));
        }
      },

      /**
       * Gunakan Ramuan Penyembuh (ability_id = 3): +20 HP, max 100.
       * Update HP & stok lokal SETELAH RPC dikonfirmasi DB (konsisten dengan myInventory).
       * Lawan melihat HP berubah via useMatchStore realtime listener (game_players).
       */
      useHeal: async (roomId: string, userId: string) => {
        try {
          await abilityPlayerRepository.userHealAbility(roomId, userId);
          set((state) => ({
            players: state.players.map((p) => (p.id === userId ? { ...p, health: Math.min((p.health ?? 100) + 20, 100) } : p)),
            myInventory: state.myInventory.map((a) => (a.ability_id === 3 ? { ...a, stock: a.stock - 1 } : a)).filter((a) => a.stock > 0),
          }));
        } catch (error) {
          console.error("[StarboxStore] Gagal menggunakan Ramuan Penyembuh:", error);
        }
      },

      useAttackorShield: async (roomId: string, userId: string, abilityId: number) => {
        await abilityPlayerRepository.userAttackorShieldAbility(roomId, userId, abilityId);
        set({ attackorShield: abilityId });
      },

      /**
       * Kurangi stock ability di local store (Optimistic UI) — tidak menyentuh DB.
       * Digunakan saat player klik 'Aktifkan' untuk Attack/Shield agar ikon langsung hilang
       * dari BuffList, sementara DB dikurangi server saat damage ronde dihitung.
       */
      decrementLocalStock: (abilityId: number) => {
        set((state) => ({
          myInventory: state.myInventory
            .map((a) => (a.ability_id === abilityId ? { ...a, stock: a.stock - 1 } : a))
            .filter((a) => a.stock > 0),
          attackorShield: abilityId, // Tandai buff aktif untuk sesi ini
        }));
      },

      /**
       * Re-hydrate myInventory dari DB (termasuk ability_materials).
       * Dipanggil dari game page agar material content tersedia saat klik buff.
       */
      refreshMyInventory: async (roomId: string, userId: string) => {
        try {
          // Query JOIN ke tabel `ability_players`, `abilities`, dan `ability_materials`.
          // Dipisah dari initGameData agar bisa dipanggil kapan saja tanpa re-init penuh.
          const raw = await abilityPlayerRepository.getMyAbilities(roomId, userId);

          const myInventoryFromDb: PickedAbility[] = (raw ?? []).map((row: any) => {
            const detail = Array.isArray(row.abilities) ? row.abilities[0] : row.abilities;
            // ability_materials hanya ada untuk ability_id === 1 (Kitab Pengetahuan).
            // Null untuk ability lain — tidak perlu overlay materi.
            const material: AbilityMaterial | null = row.ability_materials ?? null;
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
              ability_materials: material,
            };
          });

          // Override myInventory sepenuhnya — bukan merge — karena DB selalu lebih akurat
          // dari sessionStorage yang mungkin menyimpan data sebelum RPC selesai.
          set({ myInventory: myInventoryFromDb });
        } catch (err) {
          // Biarkan myInventory tidak berubah jika fetch gagal; tidak fatal untuk game.
          console.warn("[StarboxStore] refreshMyInventory gagal:", err);
        }
      },

      /** Putuskan koneksi Realtime + set isLoading agar halaman berikutnya mulai dari loading */
      cleanup: () => {
        if (stockChannel) {
          supabase.removeChannel(stockChannel);
          stockChannel = null;
        }
        if (playerChannel) {
          supabase.removeChannel(playerChannel);
          playerChannel = null;
        }
        // PENTING: Reset isLoading agar Starbox berikutnya tidak langsung trigger auto-assign sebelum initGameData sempat reset state.
        set({ isLoading: true });
      },

      /** Bersihkan SEMUA state dan koneksi Realtime. Dipanggil saat game selesai. */
      reset: () => {
        if (stockChannel) {
          supabase.removeChannel(stockChannel);
          stockChannel = null;
        }
        if (playerChannel) {
          supabase.removeChannel(playerChannel);
          playerChannel = null;
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
          isHost: false,
          myPlayerId: null,
          pickedPlayerIds: [],
          attackorShield: 0,
        });
      },
    }),

    {
      name: "starbox-store",
      storage: createJSONStorage(() => sessionStorage),
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
