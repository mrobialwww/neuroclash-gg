import { create } from "zustand";
import { quizService } from "@/services/quizService";
import { userClientService } from "@/services/auth/userClientService";
import { LobbyPlayer } from "@/components/quiz/Lobby";

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

  loadLobbyData: (roomId: string) => Promise<void>;
  decrementTimer: () => void;
  setError: (msg: string) => void;
}

let pendingJoinPromise: Promise<void> | null = null;

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

  setError: (msg: string) => set({ error: msg, isLoading: false }),

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
}));
