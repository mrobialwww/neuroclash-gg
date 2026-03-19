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

    if (code) {
      const res = await fetch(`/api/game-rooms/code/${code}`);
      const result = await res.json();
      targetRoom = result.data?.[0];
    }

    if (!targetRoom && id && code !== id) {
      const resId = await fetch(`/api/game-rooms/code/${id}`);
      const resIdData = await resId.json();
      targetRoom = resIdData.data?.[0];
    }

    return targetRoom || null;
  },
};
