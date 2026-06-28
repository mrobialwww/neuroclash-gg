import { createClient } from "@/lib/supabase/server";
import {
    UserGame,
    UserStats,
    GameRoom,
} from "@/modules/histories/history.schema";

/**
 * historyRepository.ts
 * Layer: Repository — raw database queries only.
 */
export const historyRepository = {
    /**
     * Fetch paginated history for a user.
     */
    async getUserGameHistory(
        userId: string,
        offset: number,
        limit: number,
    ): Promise<{ data: UserGame[]; count: number }> {
        const supabase = await createClient();
        const { data, error, count } = await supabase
            .from("user_games")
            .select("*", { count: "exact" })
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        return {
            data: data || [],
            count: count || 0,
        };
    },

    /**
     * Fetch global user statistics.
     */
    async getUserStats(userId: string): Promise<UserStats | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .select("total_match, total_rank_1, placement_ratio")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw new Error(error.message);

        return data || null;
    },

    /**
     * Fetch game room details for a list of IDs.
     */
    async getGameRooms(roomIds: string[]): Promise<GameRoom[]> {
        if (roomIds.length === 0) return [];

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("game_rooms")
            .select("game_room_id, title, category")
            .in("game_room_id", roomIds);

        if (error) throw new Error(error.message);

        return data || [];
    },

    /**
     * Fetch a single user_game record by its ID.
     */
    async getUserGameSummary(userGameId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_games")
            .select("*")
            .eq("user_game_id", userGameId)
            .single();

        if (error) {
            console.error("Supabase Error pengembalian user_games:", error.message);
            throw new Error(error.message);
        }

        return data;
    },

    /**
     * Fetch answers with questions and user_answers for a specific game room and user.
     */
    async getUserGameAnswerHistory(gameRoomId: string, userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("answers")
            .select("*, questions!inner(*), user_answers!inner(*)")
            .eq("questions.game_room_id", gameRoomId)
            .eq("user_answers.user_id", userId);

        if (error) {
            console.error("Supabase Error pengembalian history:", error.message);
            throw new Error(error.message);
        }

        return data;
    },

    /**
     * Fetch all questions with their answers for a game room (ordered by question_order).
     */
    async getQuestionsWithAnswers(gameRoomId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("questions")
            .select("*, answers(*)")
            .eq("game_room_id", gameRoomId)
            .order("question_order", { ascending: true });

        if (error) {
            console.error("Supabase Error questions:", error.message);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * Fetch all user_answers for a specific user in a game room.
     */
    async getUserAnswersForRoom(gameRoomId: string, userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_answers")
            .select("*, answers!inner(question_id)")
            .eq("game_room_id", gameRoomId)
            .eq("user_id", userId);

        if (error) {
            console.error("Supabase Error user_answers:", error.message);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * Fetch a single game_room by ID.
     */
    async getGameRoomById(roomId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("game_rooms")
            .select("title, category, total_round")
            .eq("game_room_id", roomId)
            .single();

        if (error) {
            console.error("Supabase Error game_room:", error.message);
            throw new Error(error.message);
        }

        return data;
    },
};
