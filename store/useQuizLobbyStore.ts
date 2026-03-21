import { create } from "zustand";
import { quizService } from "@/services/quizService";
import { userClientService } from "@/services/auth/userClientService";
import { LobbyPlayer } from "@/components/quiz/Lobby";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { quizRepository } from "@/repository/quizRepository";

export interface RoomData {
  game_room_id: string;
  room_code: string;
  max_player: number;
  user_id: string;
  title: string | null;
  topic_material: string;
}

export interface QuizLobbyState {
  roomData: RoomData | null;
  participants: LobbyPlayer[];
  isLoading: boolean;
  isSolo: boolean;
  isHost: boolean;
  participantsCount: number;
  maxPlayers: number;
  error: string | null;
  currentUser: { id: string; username: string; avatar: string } | null;
  isMigrating: boolean;

  loadLobbyData: (roomId: string) => Promise<void>;
  decrementTimer: () => void;
  setError: (msg: string) => void;
  setParticipants: (p: LobbyPlayer[]) => void;

  // Presence & Migration actions
  subscribeToPresence: (roomId: string) => void;
  unsubscribeFromPresence: () => void;
}

let pendingJoinPromise: Promise<void> | null = null;
let lobbyChannel: RealtimeChannel | null = null;

export const useQuizLobbyStore = create<QuizLobbyState>((set, get) => ({
  roomData: null,
  participants: [],
  isLoading: true,
  isSolo: false,
  isHost: false,
  participantsCount: 0,
  maxPlayers: 1,
  error: null,
  currentUser: null,
  isMigrating: false,

  setError: (msg: string) => set({ error: msg, isLoading: false }),
  setParticipants: (participants: LobbyPlayer[]) => set({ participants, participantsCount: participants.length }),

  loadLobbyData: async (roomId: string) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Get current user
      const currentUser = await userClientService.getCurrentUserNavbarData();
      if (!currentUser) {
        set({ error: "Unauthorized", isLoading: false });
        return;
      }
      set({ currentUser });

      // 2. Fetch Lobby Data
      let lobbyData = await quizService.getLobbyData(roomId);
      if (!lobbyData || !lobbyData.roomData) {
        set({ error: "Gagal memuat room.", isLoading: false });
        return;
      }

      // If user not in participants, try to joining
      const isParticipant = lobbyData.participants.some(
        (p) => p.user_id === currentUser.id
      );
      if (!isParticipant) {
        if (!pendingJoinPromise) {
          pendingJoinPromise = quizService
            .joinRoomByCode(roomId, currentUser.id)
            .then(() => {});
        }
        try {
          await pendingJoinPromise;
        } finally {
          pendingJoinPromise = null;
        }

        // re-fetch lobby data to get updated user_game list
        lobbyData = await quizService.getLobbyData(roomId);
        if (!lobbyData) {
          set({ error: "Gagal memuat room.", isLoading: false });
          return;
        }
      }

      const rd = lobbyData.roomData as any;

      const isHost = rd.user_id === currentUser.id;
      const isSolo = rd.max_player === 1;

      // 3. Resolve participant user info in client side
      const rawParticipants = lobbyData.participants as any[];
      const playerPromises = rawParticipants.map(async (raw) => {
        try {
          // Fetch info User & Karakter secara paralel (tanpa cache agar avatar selalu fresh)
          const [userRes, charRes] = await Promise.all([
            fetch(`/api/users/${raw.user_id}`, { cache: "no-store" }),
            fetch(`/api/user-character/${raw.user_id}?is_used=true`, {
              cache: "no-store",
            }),
          ]);

          const userResult = await userRes.json();
          const userData = Array.isArray(userResult.data)
            ? userResult.data[0]
            : userResult.data;

          let characterData = null;
          if (charRes.ok) {
            const charResult = await charRes.json();
            characterData = Array.isArray(charResult.data)
              ? charResult.data[0]
              : charResult.data;
          }

          return {
            id: String(raw.user_id),
            name: userData?.username || "Pemain",
            character: characterData?.base_character || "Slime",
            image: characterData?.image_url || "/default/Slime.webp",
            health: 100,
            maxHealth: 100,
            userGameId: String(raw.user_game_id),
            joinedAt: String(raw.created_at),
          } as LobbyPlayer;
        } catch (err) {
          console.error("Gagal resolving player:", err);
          return null;
        }
      });

      const resolved = await Promise.all(playerPromises);
      const participants = resolved.filter((p): p is LobbyPlayer => p !== null);

      set({
        roomData: {
          game_room_id: rd.game_room_id,
          room_code: rd.room_code,
          max_player: rd.max_player,
          user_id: rd.user_id,
          title: rd.title,
          topic_material: rd.topic_material,
        },
        participants,
        participantsCount: participants.length,
        maxPlayers: rd.max_player,
        isHost,
        isSolo,
        isLoading: false,
      });
    } catch (err: any) {
      console.error(err);
      set({
        error: err.message || "Gagal memuat lobby data",
        isLoading: false,
      });
    }
  },

  decrementTimer: () => {
    // Implement countdown if host starts the match
  },

  setParticipants: (participants: LobbyPlayer[]) =>
    set({ participants, participantsCount: participants.length }),

  subscribeToPresence: (roomId: string) => {
    const { currentUser, isHost, participants, setParticipants } = get();
    if (!currentUser || lobbyChannel) return;

    const supabase = createClient();
    const channel = supabase.channel(`lobby:${roomId}`, {
      config: { presence: { key: currentUser.id } },
    });

    const myPlayerPayload = participants.find((p) => p.id === currentUser.id);

    channel
      .on("presence", { event: "sync" }, async () => {
        const state = channel.presenceState();
        const activePresenceIds = Object.keys(state);

        // 1. Update UI List based on Online Status
        const activeUsersList = Object.values(state).flatMap((s) => s) as any[];
        const uniquePresencePlayers = new Map();
        for (const p of activeUsersList) {
          if (p?.id) uniquePresencePlayers.set(p.id, p);
        }
        setParticipants(Array.from(uniquePresencePlayers.values()));

        // 2. Automated Host Migration Logic
        const { roomData } = get();
        if (!roomData) return;

        const isCurrentHostOnline = activePresenceIds.includes(roomData.user_id);

        if (!isCurrentHostOnline && !get().isMigrating) {
          // Elect new host: The most senior (earliest joinedAt) active participant
          const onlineParticipants = get().participants.filter((p) =>
            activePresenceIds.includes(p.id)
          );

          if (onlineParticipants.length === 0) return;

          const newHostCandidate = [...onlineParticipants].sort((a, b) => {
            const timeA = new Date(a.joinedAt || 0).getTime();
            const timeB = new Date(b.joinedAt || 0).getTime();
            return timeA - timeB;
          })[0];

          // Only the candidate triggers the update to avoid collisions
          if (newHostCandidate.id === currentUser.id) {
            console.log("[Migration] Electing NEW Host:", currentUser.username);
            set({ isMigrating: true });
            const success = await quizRepository.updateRoomHost(
              roomId,
              currentUser.id
            );
            if (success) {
              set({
                roomData: { ...roomData, user_id: currentUser.id },
                isHost: true,
                isMigrating: false,
              });
            } else {
              set({ isMigrating: false });
            }
          }
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "game_rooms",
        filter: `game_room_id=eq.${roomId}`,
      }, (payload: any) => {
        // Real-time UI Sync for Host Label
        const { roomData } = get();
        if (roomData && payload.new.user_id) {
          const newHostId = payload.new.user_id;
          set({
            roomData: { ...roomData, user_id: newHostId },
            isHost: newHostId === get().currentUser?.id,
          });
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && myPlayerPayload) {
          await channel.track(myPlayerPayload);
        }
      });

    lobbyChannel = channel;
  },

  unsubscribeFromPresence: () => {
    if (lobbyChannel) {
      const supabase = createClient();
      supabase.removeChannel(lobbyChannel);
      lobbyChannel = null;
    }
  },
}));
