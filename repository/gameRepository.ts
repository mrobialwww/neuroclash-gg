import { GameRoomWithPlayerCount } from "@/types/GameRoom";

export const gameRepository = {
  /**
   * Fetch game room either by custom friendly code, or by its DB UUID.
   * Dipanggil dari komponen Client via API proxy.
   */
  async fetchRoomByCodeOrId(
    code: string,
    id: string
  ): Promise<GameRoomWithPlayerCount | null> {
    let targetRoom = null;

    if (code && code !== id) {
      const res = await fetch(`/api/game-rooms/code/${code}`, {
        credentials: "include",
      });
      const result = await res.json();
      targetRoom = result.data?.[0] ?? result.data ?? null;
    }

    if (!targetRoom && id) {
      const resId = await fetch(`/api/game-rooms/${id}`, {
        credentials: "include",
      });
      const resIdData = await resId.json();
      targetRoom = resIdData.data?.[0] ?? resIdData.data ?? null;
    }

    return targetRoom || null;
  },
};
