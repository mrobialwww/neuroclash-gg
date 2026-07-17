import { create } from "zustand";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { PlayerMatchState, QuizQuestion } from "@/types/quiz";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserNavbarData } from "@/hooks/useUserClient";
import { BattleRoom } from "@/modules/battles/battle.schema";
import { fetchWithTimeout } from "@/lib/utils/httpUtils";

const supabase = createClient();

export const SECONDS_PER_ROUND = 30;
export const STARBOX_INTERVAL = 5;
export const INITIAL_ROUND = 1;

export interface MatchState {
    roomCode: string;
    gameRoomId: string;
    roomInfo: GameRoomWithPlayerCount | null;
    currentOrder: number;
    totalQuestions: number | null;
    currentQuestion: QuizQuestion | null;
    isLoadingQuestion: boolean;
    selectedAnswerId: string | null;
    isSubmitting: boolean;
    isFinished: boolean;
    timeLeft: number;
    players: PlayerMatchState[];
    currentUser: {
        id: string;
        username: string;
        avatar: string;
        character: string;
    } | null;
    currentBattleRoom: BattleRoom | null;
    opponentIds: string[];
    firstAnswerPlayerId: string | null;
    firstAnswerId: string | null;
    nextRoundUrl: string | null;
    error: string | null;
    isWaitingForAllBattles: boolean;
    isAdvancingRound: boolean;
    isSyncingPlayers: boolean;
    lastAnswerCorrect: boolean | null;
    correctAnswerId: string | null;
    matchStartTime: number | null;
    roundStartTimestamp: number;
    initializeMatch: (
        roomCode: string,
        gameRoomId: string,
        initialRound: number,
    ) => Promise<void>;
    loadQuestion: (gameRoomId: string, order: number) => Promise<void>;
    advanceRound: () => void;
    waitForAllBattlesAndAdvance: () => Promise<void>;
    handleSelectAnswer: (userId: string, answerId: string) => Promise<void>;
    decrementTimer: () => void;
    resetMatch: () => void;
    syncPlayersFromDB: (roomId: string, force?: boolean) => Promise<void>;
    syncBattleRoomFromDB: () => Promise<void>;
    setupRealtimeSubscription: (roomId: string) => void;
    isOpponent: (playerId: string) => boolean;
    canAnswer: () => boolean;
    isProfBubuPhase: boolean;
    profBubuQuestion: QuizQuestion | null;
    loadProfBubuQuestion: (
        roomId: string,
        totalRounds: number,
        currentOrder: number,
    ) => Promise<void>;
    endProfBubuPhase: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
    roomCode: "",
    gameRoomId: "",
    roomInfo: null,
    currentOrder: 1,
    totalQuestions: null,
    currentQuestion: null,
    isLoadingQuestion: true,
    selectedAnswerId: null,
    isSubmitting: false,
    isFinished: false,
    timeLeft: SECONDS_PER_ROUND,
    players: [],
    currentUser: null,
    currentBattleRoom: null,
    opponentIds: [],
    firstAnswerPlayerId: null,
    firstAnswerId: null,
    nextRoundUrl: null,
    error: null,
    isWaitingForAllBattles: false,
    isAdvancingRound: false,
    isSyncingPlayers: false,
    lastAnswerCorrect: null,
    correctAnswerId: null,
    matchStartTime: null,
    roundStartTimestamp: Date.now(),
    isProfBubuPhase: false,
    profBubuQuestion: null,

    loadProfBubuQuestion: async (roomId, totalRounds, currentOrder) => {
        console.log(`[MatchStore] Loading Prof Bubu question`);
        set({ isProfBubuPhase: true, profBubuQuestion: null });

        const offset = Math.floor((currentOrder - 1) / 10);
        const targetOrder = totalRounds + 1 + offset;

        let question: QuizQuestion | null = null;
        try {
            const qRes = await fetchWithTimeout(
                `/api/quiz/questions/${roomId}?question_order=${targetOrder}`,
            );
            const qJson = await qRes.json();
            const qData = Array.isArray(qJson?.data) ? qJson.data[0] : qJson?.data;
            if (qData?.question_id) {
                const aRes = await fetchWithTimeout(
                    `/api/quiz/questions/answers/${qData.question_id}`,
                );
                const aJson = await aRes.json();
                const rawAnswers = Array.isArray(aJson?.data) ? aJson.data : [];
                const sortedAnswers = [...rawAnswers].sort((a, b) =>
                    a.key.localeCompare(b.key),
                );

                const options = sortedAnswers.map((ans: any) => ({
                    id: ans.answer_id,
                    label: ans.key.toUpperCase(),
                    text: ans.answer_text,
                    isCorrect: ans.is_correct,
                    explanation: ans.explanation ?? null,
                }));
                question = { ...qData, options };
            }
        } catch (err) {
            console.error(`[MatchStore] Failed to fetch Prof Bubu question:`, err);
        }

        if (question) {
            set({ profBubuQuestion: question });
        } else {
            console.warn(`[MatchStore] Prof Bubu question not found, ending phase`);
            // Question tidak ditemukan — end phase agar game tidak stuck di "Memuat..."
            set({ isProfBubuPhase: false, profBubuQuestion: null });
        }
    },

    endProfBubuPhase: () => {
        set({
            isProfBubuPhase: false,
            profBubuQuestion: null,
            // Reset timer agar round normal tidak kehilangan waktu selama Prof Bubu.
            // roundStartTimestamp sudah diset sebelum/during Prof Bubu (di initializeMatch / advanceRound).
            // Tanpa reset, elapsed = (Date.now() - oldTimestamp) bisa 15+ detik → user cuma punya ~13s.
            roundStartTimestamp: Date.now(),
            timeLeft: SECONDS_PER_ROUND,
        });
    },

    isOpponent: (playerId: string) => {
        return get().opponentIds.includes(playerId);
    },

    canAnswer: () => {
        const state = get();
        const isSolo = state.roomInfo?.max_player === 1;

        // Solo mode or Prof Bubu phase: only needs currentUser and no previous answer
        if (isSolo || state.isProfBubuPhase) {
            return !!(
                state.currentUser &&
                !state.selectedAnswerId &&
                !state.isSubmitting
            );
        }

        // Cannot answer if:
        // 1. No current user
        // 2. No battle room
        // 3. Already answered (selectedAnswerId is set)
        // 4. Already submitting
        // 5. User is not a player in this battle room
        const isUserInBattleRoom =
            state.currentBattleRoom?.player1_id === state.currentUser?.id ||
            state.currentBattleRoom?.player2_id === state.currentUser?.id ||
            state.currentBattleRoom?.player3_id === state.currentUser?.id;

        const hasFirstAnswer = !!state.currentBattleRoom?.first_answer_user_id;

        return !!(
            state.currentUser &&
            state.currentBattleRoom &&
            !state.selectedAnswerId &&
            !state.isSubmitting &&
            !hasFirstAnswer &&
            isUserInBattleRoom
        );
    },

    initializeMatch: async (roomCode, gameRoomId, initialRound) => {
        console.log(
            `[MatchStore] initializeMatch called: ${gameRoomId}, round: ${initialRound}`,
        );

        // Reset semua flag dari ronde/fase sebelumnya agar state bersih.
        // Penting saat kembali dari Starbox — flag lama bisa menyebabkan
        // canAnswer() return false atau timer skip.
        set({
            isLoadingQuestion: true,
            error: null,
            currentQuestion: null,
            selectedAnswerId: null,
            isSubmitting: false,
            isAdvancingRound: false,
            isWaitingForAllBattles: false,
            isSyncingPlayers: false,
            isFinished: false,
            firstAnswerPlayerId: null,
            firstAnswerId: null,
            nextRoundUrl: null,
            lastAnswerCorrect: null,
            correctAnswerId: null,
            currentBattleRoom: null,
            opponentIds: [],
            roundStartTimestamp: Date.now(),
        });

        // Capture match start time if it's the first round
        if (initialRound === 1) {
            set({ matchStartTime: Date.now() });
        }

        try {
            // 1. Get Room Info first — fetch via API (store is client-side)
            let room: GameRoomWithPlayerCount | null = null;
            if (roomCode && roomCode !== gameRoomId) {
                const res = await fetchWithTimeout(`/api/game-rooms/code/${roomCode}`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const json = await res.json();
                    room = json.data?.[0] ?? json.data ?? null;
                }
            }
            if (!room && gameRoomId) {
                const res = await fetchWithTimeout(`/api/game-rooms/${gameRoomId}`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const json = await res.json();
                    room = json.data?.[0] ?? json.data ?? null;
                }
            }
            if (!room) {
                set({
                    error: "Room tidak ditemukan atau sudah tidak aktif.",
                    isLoadingQuestion: false,
                });
                return;
            }

            // Trigger Prof Bubu at start
            if (initialRound === 1 && room.total_round) {
                await get().loadProfBubuQuestion(
                    gameRoomId,
                    room.total_round,
                    initialRound,
                );
            }

            console.log(`[MatchStore] Room status: ${room.room_status}`);

            // 2. Get current user
            const user = await getCurrentUserNavbarData();
            if (user) {
                set({ currentUser: user });
            }

            set({
                roomCode,
                gameRoomId,
                roomInfo: room,
                totalQuestions: room.total_round || null,
                currentOrder: initialRound,
                timeLeft: SECONDS_PER_ROUND,
            });

            // 3. Sync Players & Start Subscriptions
            await get().syncPlayersFromDB(gameRoomId);
            get().setupRealtimeSubscription(gameRoomId);

            // 4. Multiplayer: generate battle rooms untuk ronde ini.
            //    Saat kembali dari Starbox, advanceRound (yang biasanya membuat battle rooms)
            //    tidak pernah dipanggil — sehingga battle rooms belum ada.
            //    Tanpa ini, currentBattleRoom = null → canAnswer() return false → tidak bisa klik.
            //    API ini idempotent (ada locking), aman dipanggil berulang.
            const isSolo = room.max_player === 1;
            if (!isSolo) {
                try {
                    console.log(
                        `[MatchStore] Generating battle rooms for round ${initialRound}...`,
                    );
                    const startRoundRes = await fetchWithTimeout(
                        "/api/match/start-round",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                game_room_id: gameRoomId,
                                round_number: initialRound,
                            }),
                            credentials: "include",
                        },
                    );

                    if (startRoundRes.ok) {
                        const result = await startRoundRes.json();
                        console.log(
                            `[MatchStore] Battle rooms ready for round ${initialRound}: ${
                                result.battleRooms?.length || 0
                            } rooms`,
                        );
                    } else {
                        const errorText = await startRoundRes.text();
                        // Handle common lock error as a warning (expected in concurrent join/refresh)
                        if (
                            errorText.includes(
                                "Another request is currently generating battle rooms",
                            ) ||
                            startRoundRes.status === 423
                        ) {
                            console.warn(
                                `[MatchStore] Battle room generation in progress by another request (Round ${initialRound}).`,
                            );
                        } else {
                            console.error(
                                `[MatchStore] Failed to generate battle rooms:`,
                                errorText,
                            );
                        }
                    }
                } catch (err) {
                    console.error(
                        `[MatchStore] Error generating battle rooms for round ${initialRound}:`,
                        err,
                    );
                }
            }

            // 5. Sync Battle Room for current user (sekarang pasti ada karena start-round sudah dipanggil)
            await get().syncBattleRoomFromDB();

            // 6. Load Question
            await get().loadQuestion(gameRoomId, initialRound);
        } catch (err) {
            console.error("Failed to initialize match:", err);
            set({ error: "Gagal memuat arena.", isLoadingQuestion: false });
        }
    },

    syncPlayersFromDB: async (roomId, force = false) => {
        const { isSyncingPlayers, isAdvancingRound } = get();

        // IMPORTANT: Skip sync if we're currently advancing round
        // This prevents excessive sync calls during round transition
        // However, if force=true, we bypass this to allow syncing heal effects at round start
        if (isAdvancingRound && !force) {
            console.log(
                `[MatchStore] ⚠️ Skipping player sync - currently advancing round`,
            );
            return;
        }

        // Prevent infinite sync loops
        if (isSyncingPlayers) {
            console.log(`[MatchStore] ⚠️ Already syncing players, skipping`);
            return;
        }

        console.log(`[MatchStore] syncPlayersFromDB START - roomId: ${roomId}`);
        set({ isSyncingPlayers: true });

        try {
            const res = await fetchWithTimeout(`/api/match/participants/${roomId}`, {
                cache: "no-store",
                credentials: "include",
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(
                    `[MatchStore] API error response text: ${errorText}`,
                );
                set({ isSyncingPlayers: false });
                return;
            }

            const { data } = await res.json();
            const players: PlayerMatchState[] = data || [];

            console.log(`[MatchStore] Synced ${players.length} players`);

            // Check if game should end (only 1 player alive)
            const alivePlayers = players.filter(
                (p) => p.is_alive && p.health > 0,
            );
            if (alivePlayers.length <= 1 && players.length > 1) {
                console.log(
                    `[MatchStore] Game ended! Only ${alivePlayers.length} player(s) alive.`,
                );
                set({ players, isFinished: true, isSyncingPlayers: false });
                return;
            }

            set({ players, isSyncingPlayers: false });
        } catch (err) {
            console.error("[MatchStore] Failed to sync players:", err);
            set({ isSyncingPlayers: false });
        }
    },

    syncBattleRoomFromDB: async () => {
        const { gameRoomId, currentUser, currentOrder } = get();

        if (!gameRoomId || !currentUser) {
            console.log(
                "[MatchStore] Cannot sync battle room - missing gameRoomId or currentUser",
            );
            return;
        }

        // Optimization: Skip sync if current player is eliminated
        const currentPlayer = get().players.find(
            (p) => p.id === currentUser.id,
        );
        if (
            currentPlayer &&
            (!currentPlayer.is_alive || currentPlayer.health <= 0)
        ) {
            console.log(
                `[MatchStore] Current player ${currentUser.id.substring(
                    0,
                    8,
                )} is eliminated - skipping battle room sync`,
            );
            set({ currentBattleRoom: null, opponentIds: [] });
            return;
        }

        try {
            const battleRes = await fetchWithTimeout(
                `/api/battle/my-room?game_room_id=${gameRoomId}&user_id=${currentUser.id}&round_number=${currentOrder}`,
            );
            const battleRoom: BattleRoom | null = battleRes.ok
                ? await battleRes.json()
                : null;

            if (battleRoom) {
                // Get opponent IDs from battle room
                const opponentIds = [
                    battleRoom.player1_id,
                    battleRoom.player2_id,
                    battleRoom.player3_id,
                ].filter(
                    (id): id is string => id !== null && id !== currentUser.id,
                );

                console.log(
                    `[MatchStore] Synced battle room with opponents:`,
                    opponentIds,
                );

                // If someone has already answered, derive the correct answer ID
                // from the current question options (already in memory) so the
                // explanation panel can display immediately via Realtime —
                // without waiting for the current user to submit.
                const currentState = get();
                const derivedCorrectId =
                    battleRoom.first_answer_id && !currentState.correctAnswerId
                        ? currentState.currentQuestion?.options.find(
                              (o) => o.isCorrect,
                          )?.id ?? null
                        : currentState.correctAnswerId;

                set({
                    currentBattleRoom: battleRoom,
                    opponentIds,
                    firstAnswerPlayerId: battleRoom.first_answer_user_id,
                    firstAnswerId: battleRoom.first_answer_id,
                    correctAnswerId: derivedCorrectId,
                });
            } else {
                console.log(
                    `[MatchStore] No battle room found for round ${currentOrder}`,
                );
                set({ currentBattleRoom: null, opponentIds: [] });
            }
        } catch (err) {
            console.error("[MatchStore] Failed to sync battle room:", err);
            set({ currentBattleRoom: null, opponentIds: [] });
        }
    },

    setupRealtimeSubscription: (roomId) => {
        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "battle_rooms",
                    filter: `game_room_id=eq.${roomId}`,
                },
                async (payload) => {
                    // Sync battle room when updated (including first_answer changes)
                    console.log(`[MatchStore] Battle room updated:`, payload);
                    await get().syncBattleRoomFromDB();

                    // Also sync player HP — game_players realtime may not be configured,
                    // so we piggyback on battle_room updates (damage is applied by now)
                    await get().syncPlayersFromDB(roomId);

                    // Don't auto-advance here - timer will handle it
                    // Just sync the battle room state
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "match_rounds",
                    filter: `game_room_id=eq.${roomId}`,
                },
                async (payload) => {
                    if (
                        payload.eventType === "UPDATE" ||
                        payload.eventType === "INSERT"
                    ) {
                        const { new: newRound, old: oldRound } = payload;
                        const state = get();

                        // Hanya advance jika:
                        // 1. Status "ongoing" (ronde sudah aktif)
                        // 2. Tepat 1 round lebih maju (currentOrder + 1 === round_number)
                        //    — mencegah cascade skip multiple round
                        //
                        // STARBOX CHECK: Jika round SEBELUMNYA adalah Starbox round
                        // (currentOrder % STARBOX_INTERVAL === 0), maka player harus
                        // melewati Starbox DULU sebelum melanjutkan ke round berikutnya.
                        // Tanpa ini, player akan langsung sync ke round baru tanpa
                        // pernah masuk Starbox — terutama jika Realtime fires sebelum
                        // waitForAllBattlesAndAdvance sempat memproses Starbox redirect.
                        if (
                            newRound.status === "ongoing" &&
                            state.currentOrder + 1 === newRound.round_number
                        ) {
                            // Cek apakah kita skip Starbox
                            if (
                                state.currentOrder %
                                    STARBOX_INTERVAL ===
                                0
                            ) {
                                console.log(
                                    `[MatchStore] Starbox round! (Realtime handler, round ${state.currentOrder})`,
                                );
                                set({
                                    nextRoundUrl: `/starbox?roomId=${roomId}&code=${
                                        state.roomCode
                                    }&nextRound=${
                                        newRound.round_number
                                    }`,
                                    isWaitingForAllBattles: false,
                                    isAdvancingRound: false,
                                });
                                return;
                            }

                            console.log(
                                `[MatchStore] Realtime update: Round advanced to ${newRound.round_number}!`,
                            );

                            // Penting: Update currentOrder SEBELUM memanggil syncBattleRoomFromDB
                            // Jika tidak di-update, syncBattleRoomFromDB akan menarik data dari ronde SEBELUMNYA!
                            // Juga set isWaitingForAllBattles = true agar pemain ini melihat layar "Mempersiapkan Ronde..."
                            set({
                                currentOrder: newRound.round_number,
                                isWaitingForAllBattles: true,
                                roundStartTimestamp: Date.parse(
                                    newRound.updated_at || newRound.created_at,
                                ) || Date.now(),
                            });

                            await get().syncBattleRoomFromDB();
                            // Retry jika battle room null — event Realtime bisa tiba sebelum battle rooms dibuat
                            if (!get().currentBattleRoom) {
                                console.warn(
                                    `[MatchStore] Battle room null after Realtime sync, retrying...`,
                                );
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 1500),
                                );
                                await get().syncBattleRoomFromDB();
                            }
                            await get().syncPlayersFromDB(roomId, true);
                            await get().loadQuestion(
                                roomId,
                                newRound.round_number,
                            );

                            // Matikan layar "Mempersiapkan Ronde" setelah semuanya termuat
                            set({ isWaitingForAllBattles: false });
                        }
                    }
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "user_answers",
                },
                async () => {
                    // Sync battle room when someone answers
                    await get().syncBattleRoomFromDB();
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "game_players",
                    filter: `game_room_id=eq.${roomId}`,
                },
                async (payload) => {
                    // Sync players when health is updated
                    // Check if we're not already syncing AND not currently advancing round
                    const { isSyncingPlayers, isAdvancingRound } = get();

                    // IMPORTANT: Skip sync if we're currently advancing round
                    // This prevents excessive sync calls during round transition
                    if (isAdvancingRound) {
                        console.log(
                            `[MatchStore] ⚠️ Skipping player sync (real-time) - currently advancing round`,
                        );
                        return;
                    }

                    // Prevent infinite sync loops
                    if (isSyncingPlayers) {
                        console.log(
                            `[MatchStore] ⚠️ Skipping real-time sync, already syncing`,
                        );
                        return;
                    }

                    console.log(
                        `[MatchStore] Game player health updated:`,
                        payload,
                    );
                    await get().syncPlayersFromDB(roomId);
                },
            )
            .on("broadcast", { event: "game_ended" }, (payload) => {
                console.log(
                    `[MatchStore] Game ended broadcast received:`,
                    payload,
                );
                set({ isFinished: true });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    loadQuestion: async (roomId, order) => {
        console.log(`[MatchStore] Loading question for round ${order}`);

        // Calculate initial timeLeft from roundStartTimestamp untuk akurasi timer
        const state = get();
        const roundStart = state.roundStartTimestamp || Date.now();
        const elapsed = Math.floor((Date.now() - roundStart) / 1000);
        const initialTimeLeft = Math.max(0, SECONDS_PER_ROUND - elapsed);

        set({
            isLoadingQuestion: true,
            selectedAnswerId: null,
            firstAnswerId: null,
            firstAnswerPlayerId: null,
            timeLeft: initialTimeLeft,
            nextRoundUrl: null,
            lastAnswerCorrect: null,
            correctAnswerId: null,
        });

        // Fetch question + answers via API (store is client-side)
        let question: QuizQuestion | null = null;
        try {
            const qRes = await fetchWithTimeout(
                `/api/quiz/questions/${roomId}?question_order=${order}`,
            );
            const qJson = await qRes.json();
            const qData = Array.isArray(qJson?.data) ? qJson.data[0] : qJson?.data;
            if (qData?.question_id) {
                const aRes = await fetchWithTimeout(
                    `/api/quiz/questions/answers/${qData.question_id}`,
                );
                const aJson = await aRes.json();
                const rawAnswers = Array.isArray(aJson?.data) ? aJson.data : [];
                const sortedAnswers = [...rawAnswers].sort((a, b) =>
                    a.key.localeCompare(b.key),
                );

                const options = sortedAnswers.map((ans: any) => ({
                    id: ans.answer_id,
                    label: ans.key.toUpperCase(),
                    text: ans.answer_text,
                    isCorrect: ans.is_correct,
                    explanation: ans.explanation ?? null,
                }));
                question = { ...qData, options };
            }
        } catch (err) {
            console.error(
                `[MatchStore] Failed to fetch question for round ${order}:`,
                err,
            );
        }

        if (!question) {
            console.log(
                `[MatchStore] No question found for round ${order}, finishing game`,
            );
            set({ isFinished: true, isLoadingQuestion: false });
        } else {
            set({ currentQuestion: question, isLoadingQuestion: false });
            console.log(
                `[MatchStore] Question loaded: ${question.question_text.substring(
                    0,
                    30,
                )}...`,
            );
        }
    },

    advanceRound: async () => {
        const state = get();
        const isSolo = state.roomInfo?.max_player === 1;

        console.log(
            `[MatchStore] advanceRound called - current: ${state.currentOrder}, selectedAnswerId: ${state.selectedAnswerId}`,
        );
        console.log(
            `[MatchStore] Total questions: ${state.totalQuestions}, currentOrder: ${state.currentOrder}`,
        );

        if (
            state.totalQuestions &&
            state.currentOrder >= state.totalQuestions
        ) {
            console.log(`[MatchStore] Game finished!`);
            set({ isFinished: true });
            return;
        }

        // Starbox check: berlaku untuk SEMUA mode.
        // - Solo: advanceRound dipanggil langsung (tidak lewat waitForAllBattlesAndAdvance)
        // - Multiplayer: safety net jika advanceRound dipanggil dari code path tak terduga
        //   (e.g. Realtime handler). waitForAllBattlesAndAdvance juga punya check serupa.
        if (state.currentOrder % STARBOX_INTERVAL === 0) {
            console.log(
                `[MatchStore] Starbox round! (from advanceRound, round ${state.currentOrder})`,
            );
            set({
                nextRoundUrl: `/starbox?roomId=${state.gameRoomId}&code=${
                    state.roomCode
                }&nextRound=${state.currentOrder + 1}`,
            });
            return;
        }

        const nextOrder = state.currentOrder + 1;
        console.log(`[MatchStore] Advancing to round ${nextOrder}`);

        // Check if we're trying to go beyond total rounds
        if (state.totalQuestions && nextOrder > state.totalQuestions) {
            console.error(
                `[MatchStore] ERROR: Trying to advance to round ${nextOrder} but total rounds is ${state.totalQuestions}`,
            );
            set({ isFinished: true });
            return;
        }

        set({
            currentOrder: nextOrder,
            selectedAnswerId: null,
            firstAnswerId: null,
            firstAnswerPlayerId: null,
            timeLeft: SECONDS_PER_ROUND,
        });

        // Trigger Prof Bubu after every 10th round (if not finished)
        if (
            (nextOrder - 1) % 10 === 0 &&
            nextOrder > 1 &&
            state.totalQuestions &&
            nextOrder <= state.totalQuestions
        ) {
            await get().loadProfBubuQuestion(
                state.gameRoomId,
                state.totalQuestions,
                nextOrder,
            );
        }

        if (isSolo) {
            // ── SOLO MODE: Skip battle room generation, just load question ──
            console.log(
                `[MatchStore] Solo mode - loading question ${nextOrder} directly`,
            );
            set({ roundStartTimestamp: Date.now() });
            await get().loadQuestion(state.gameRoomId, nextOrder);
            return;
        }

        // ── MULTIPLAYER MODE: Start next round and generate battle rooms ──
        try {
            console.log(`[MatchStore] Starting round ${nextOrder}...`);
            const res = await fetchWithTimeout("/api/match/start-round", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    game_room_id: state.gameRoomId,
                    round_number: nextOrder,
                }),
                credentials: "include",
            });

            if (!res.ok) {
                const errorText = await res.text();

                // Handle common lock error gracefully
                if (
                    res.status === 423 ||
                    errorText.includes(
                        "Another request is currently generating battle rooms",
                    )
                ) {
                    console.warn(
                        `[MatchStore] Round ${nextOrder} is already being started by another player. Waiting to sync...`,
                    );
                    // Wait a bit for the primary request to finish generation
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                } else {
                    console.error(
                        `[MatchStore] Failed to start round ${nextOrder}:`,
                        errorText,
                    );

                    // Try to parse error as JSON
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.error(
                            `[MatchStore] Parsed error:`,
                            JSON.stringify(errorJson, null, 2),
                        );

                        // If it's a "question not found" or game-ended error, finish the game
                        if (
                            errorJson.error?.includes("Question not found") ||
                            errorJson.error?.includes("No battle rooms") ||
                            errorJson.details?.includes("activateMatchRound")
                        ) {
                            console.log(
                                `[MatchStore] Game ended or question not found for round ${nextOrder}, finishing game`,
                            );
                            set({ isFinished: true });
                            return;
                        }
                    } catch (e) {
                        console.error(
                            `[MatchStore] Could not parse error as JSON:`,
                            e,
                        );
                    }
                }
            } else {
                const result = await res.json();
                console.log(
                    `[MatchStore] Round ${nextOrder} started with ${
                        result.battleRooms?.length || 0
                    } battle rooms`,
                );
            }
        } catch (error) {
            console.error("[MatchStore] Error starting round:", error);
        }

        // Sync battle room for new round (after generating)
        await get().syncBattleRoomFromDB();

        // Set round timestamp tepat sebelum loadQuestion agar timer akurat
        set({ roundStartTimestamp: Date.now() });

        // Load question for new round
        await get().loadQuestion(state.gameRoomId, nextOrder);
        await get().syncPlayersFromDB(state.gameRoomId, true);
    },

    waitForAllBattlesAndAdvance: async () => {
        const state = get();

        // Prevent multiple concurrent calls
        if (state.isAdvancingRound) {
            console.log(
                `[MatchStore] ⚠️ Already advancing round, skipping duplicate call`,
            );
            return;
        }

        console.log(
            `[MatchStore] waitForAllBattlesAndAdvance called - current round: ${state.currentOrder}`,
        );

        // Check if game is finished
        if (
            state.totalQuestions &&
            state.currentOrder >= state.totalQuestions
        ) {
            console.log(`[MatchStore] Game finished!`);
            set({ isFinished: true });
            return;
        }

        // Set flags: prevent concurrent calls + show "Menunggu Pemain Lain..." segera
        set({ isAdvancingRound: true, isWaitingForAllBattles: true });

        // ✨ FIX: Simpan target round di awal — jangan pakai live state.
        // Agar polling loop tidak berubah arah kalau Realtime handler mengubah currentOrder
        // (misalnya karena event match_rounds "ongoing" tiba di tengah-tengah polling).
        const targetRound = state.currentOrder;

        // Wait for all battles to finish with polling
        let allFinished = false;
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds before force-recovery

        while (!allFinished && attempts < maxAttempts) {
            attempts++;

            try {
                const res = await fetchWithTimeout(
                    `/api/match/check-round-status?game_room_id=${state.gameRoomId}&round_number=${targetRound}`,
                    {
                        credentials: "include",
                    },
                );

                if (res.ok) {
                    const data = await res.json();
                    allFinished = data.all_finished;

                    console.log(
                        `[MatchStore] Polling round ${targetRound}: all_finished=${allFinished}, attempt=${attempts}`,
                    );

                    // Check if game should end (only 1 player alive)
                    if (data.game_ended) {
                        console.log(
                            `[MatchStore] Game ended! Only 1 player alive or all rounds completed.`,
                        );
                        set({
                            isFinished: true,
                            isWaitingForAllBattles: false,
                            isAdvancingRound: false,
                        });
                        return;
                    }

                    if (allFinished) {
                        break;
                    }
                } else {
                    console.error(
                        `[MatchStore] Polling failed with status: ${res.status}`,
                        await res.text(),
                    );
                }
            } catch (error) {
                console.error(
                    `[MatchStore] Error polling round status (attempt ${attempts}):`,
                    error,
                );
            }

            // Wait 1 second before next poll
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Sync player list setelah polling — pastikan data health/status fresh
        // sebelum advanceRound() memicu pairing round-robin untuk round berikutnya.
        await get().syncPlayersFromDB(state.gameRoomId);

        if (!allFinished) {
            // ── RECOVERY: force-finish any stuck battle rooms server-side ──
            // This prevents both clients from freezing when a battle room was
            // never properly closed (e.g. due to a race condition or failed API call).
            console.warn(
                `[MatchStore] Polling timed out for round ${targetRound}. Attempting force-advance-round...`,
            );

            try {
                const recoveryRes = await fetchWithTimeout(
                    "/api/match/force-advance-round",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            game_room_id: state.gameRoomId,
                            round_number: targetRound,
                        }),
                        credentials: "include",
                    },
                );

                if (recoveryRes.ok) {
                    const recoveryData = await recoveryRes.json();
                    console.log(
                        `[MatchStore] force-advance-round success:`,
                        recoveryData,
                    );

                    if (recoveryData.game_ended) {
                        set({
                            isFinished: true,
                            isWaitingForAllBattles: false,
                            isAdvancingRound: false,
                        });
                        return;
                    }

                    // Force-advance succeeded — treat as all_finished and proceed
                    allFinished = true;
                } else {
                    const errText = await recoveryRes.text();
                    console.error(
                        `[MatchStore] force-advance-round failed:`,
                        errText,
                    );
                    set({
                        isWaitingForAllBattles: false,
                        isAdvancingRound: false,
                    });
                    return;
                }
            } catch (err) {
                console.error(`[MatchStore] force-advance-round error:`, err);
                set({ isWaitingForAllBattles: false, isAdvancingRound: false });
                return;
            }
        }

        // ✨ FIX: Cek apakah Realtime sudah advance currentOrder selama polling.
        // Kalau iya, skip advanceRound() agar tidak terjadi double-advance.
        const currentOrderAfterPoll = get().currentOrder;
        if (currentOrderAfterPoll !== targetRound) {
            console.log(
                `[MatchStore] Realtime already advanced from ${targetRound} to ${currentOrderAfterPoll}, skipping advanceRound`,
            );
            // Jangan clear isWaitingForAllBattles — biar Realtime handler yang manage.
            // Realtime handler selalu set isWaitingForAllBattles=true dulu, lalu false setelah sync.
            // Clear di sini membuat window dimana currentOrder sudah baru tapi currentBattleRoom
            // masih lama → canAnswer() return false karena hasFirstAnswer dari room lama → jawaban disable.
            set({ isAdvancingRound: false });
            return;
        }

        // Check if this is a Starbox round (multiplayer only) — AFTER polling
        const isSolo = state.roomInfo?.max_player === 1;
        if (!isSolo && targetRound % STARBOX_INTERVAL === 0) {
            console.log(`[MatchStore] Starbox round!`);
            set({
                nextRoundUrl: `/starbox?roomId=${state.gameRoomId}&code=${
                    state.roomCode
                }&nextRound=${targetRound + 1}`,
                isWaitingForAllBattles: false,
                isAdvancingRound: false,
            });
            return;
        }

        console.log(
            `[MatchStore] All battles finished, preparing to advance to round ${
                targetRound + 1
            }`,
        );

        // Advance segera — tanpa 2s wait yang membuat race window.
        // RoundResultOverlay tetap tampil di atas waiting overlay selama 2500ms (via Timer di GamePage).
        await get().advanceRound();

        // Post-advance verification: pastikan currentBattleRoom tidak null untuk player yang masih hidup.
        // Jika null, retry sync — mengatasi race dimana start-round API selesai sebelum pairing di-render.
        const afterAdvance = get();
        if (
            !afterAdvance.currentBattleRoom &&
            !afterAdvance.isFinished &&
            afterAdvance.currentUser
        ) {
            const me = afterAdvance.players.find(
                (p) => p.id === afterAdvance.currentUser?.id,
            );
            if (me?.is_alive) {
                console.warn(
                    `[MatchStore] No battle room after advanceRound, retrying sync...`,
                );
                await new Promise((resolve) => setTimeout(resolve, 1500));
                await get().syncBattleRoomFromDB();
            }
        }

        // Hide loading state and reset flag
        set({ isWaitingForAllBattles: false, isAdvancingRound: false });
    },

    handleSelectAnswer: async (userId, answerId) => {
        const state = get();
        const isSolo = state.roomInfo?.max_player === 1;

        console.log(
            `[MatchStore] handleSelectAnswer called: userId=${userId.substring(
                0,
                8,
            )}, answerId=${answerId.substring(0, 8)}, isSolo=${isSolo}`,
        );

        if (state.selectedAnswerId || state.isSubmitting) return;

        set({ selectedAnswerId: answerId, isSubmitting: true });

        // ── SOLO MODE ──
        if (isSolo) {
            try {
                const res = await fetchWithTimeout("/api/solo/submit-answer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        answer_id: answerId,
                        game_room_id: state.gameRoomId,
                        round_number: state.currentOrder,
                    }),
                    credentials: "include",
                });

                if (res.ok) {
                    const result = await res.json();
                    console.log("[MatchStore] Solo answer result:", result);

                    // Find the correct answer id from current question options
                    const correctOpt = state.currentQuestion?.options.find(
                        (o) => o.isCorrect,
                    );
                    set({
                        lastAnswerCorrect: result.is_correct ?? false,
                        correctAnswerId: correctOpt?.id ?? null,
                        isSubmitting: false,
                    });

                    // Solo mode: show feedback briefly (allow overlay animation), then advance
                    await new Promise((resolve) => setTimeout(resolve, 2200));
                    get().advanceRound();
                } else {
                    console.error(
                        "[MatchStore] Solo answer submit failed",
                        await res.text(),
                    );
                    set({ isSubmitting: false });
                }
            } catch (e) {
                console.error("[MatchStore] Failed to submit solo answer:", e);
                set({ isSubmitting: false });
            }
            return;
        }

        // ── MULTIPLAYER MODE ──
        if (!state.currentBattleRoom) {
            console.error("[MatchStore] User not in any battle room");
            set({ isSubmitting: false });
            return;
        }

        console.log(
            `[MatchStore] currentBattleRoom: ${state.currentBattleRoom.battle_room_id}`,
        );

        try {
            // Submit answer to battle API
            const res = await fetchWithTimeout("/api/battle/submit-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    answer_id: answerId,
                    battle_room_id: state.currentBattleRoom.battle_room_id,
                    game_room_id: state.gameRoomId,
                    round_number: state.currentOrder,
                }),
                credentials: "include",
            });

            console.log(`[MatchStore] Response status: ${res.status}`);

            if (!res.ok) {
                console.error("[MatchStore] Failed to submit answer");
                const errorText = await res.text();
                console.error("[MatchStore] Error response:", errorText);
            } else {
                const result = await res.json();
                console.log("[MatchStore] Answer result:", result);

                // Update state dengan data first answer
                if (result.success) {
                    const correctOpt = state.currentQuestion?.options.find(
                        (o) => o.isCorrect,
                    );
                    set({
                        lastAnswerCorrect: result.is_correct ?? false,
                        correctAnswerId: correctOpt?.id ?? null,
                        firstAnswerId: answerId,
                    });

                    // Use server-returned first_answer_user_id (authoritative) instead of optimistic guess
                    if (result.first_answer_user_id) {
                        set({
                            firstAnswerPlayerId: result.first_answer_user_id,
                        });
                    }

                    console.log(
                        "[MatchStore] Syncing players after answer submission...",
                    );
                    await get().syncPlayersFromDB(state.gameRoomId);
                }
            }
        } catch (e) {
            console.error("[MatchStore] Failed to submit answer:", e);
        } finally {
            set({ isSubmitting: false });

            // Langsung mulai polling untuk lanjut ronde tanpa menunggu timer habis
            if (get().selectedAnswerId && !isSolo) {
                get().waitForAllBattlesAndAdvance();
            }
        }
    },

    decrementTimer: async () => {
        const state = get();
        const {
            isLoadingQuestion,
            isFinished,
            currentBattleRoom,
            gameRoomId,
            currentOrder,
            isAdvancingRound,
            roomInfo,
            roundStartTimestamp,
            selectedAnswerId,
            timeLeft,
        } = state;

        const isSolo = roomInfo?.max_player === 1;
        if (isLoadingQuestion || isFinished) return;

        // ── TIMER CALCULATION ──
        // Hitung timeLeft dari elapsed time sebenarnya (bukan decrement setInterval).
        // Ini membuat timer robust terhadap throttling/background tab dan drift.
        const elapsed = Math.floor(
            (Date.now() - (roundStartTimestamp || Date.now())) / 1000,
        );
        const calculatedTimeLeft = Math.max(
            0,
            SECONDS_PER_ROUND - elapsed,
        );

        // ── AUTO-RECOVERY: null battle room ──
        // Jika currentBattleRoom null saat timer berjalan, retry sync.
        // Ini mengatasi race condition dimana Realtime event tiba sebelum battle room dibuat.
        if (!currentBattleRoom && !isSolo && !selectedAnswerId) {
            const p = state.players.find(
                (p) => p.id === state.currentUser?.id,
            );
            // Only retry if player is alive (eliminated players legitimately have no room)
            if (p?.is_alive) {
                console.warn(
                    `[MatchStore] Timer: no battle room, retrying sync...`,
                );
                await get().syncBattleRoomFromDB();
            }
        }

        // ── OPPONENT ANSWERED FIRST ──
        // Ketika opponent menjawab duluan, kita harus polling untuk lanjut ronde
        // (termasuk deteksi Starbox). Tanpa ini, player hanya bisa menunggu Realtime.
        const s = get();
        if (
            !isSolo &&
            !s.selectedAnswerId &&
            s.currentBattleRoom?.first_answer_user_id &&
            s.currentBattleRoom.first_answer_user_id !== s.currentUser?.id
        ) {
            console.log(
                `[MatchStore] Opponent answered first, starting waitForAllBattlesAndAdvance...`,
            );
            s.waitForAllBattlesAndAdvance();
            return;
        }

        // ── EARLY EXIT ──
        // Room resolved, user answered, or already advancing → stop timer.
        // NOTE: Tidak ada guard timeLeft === 0 di sini. Kalau timeLeft === 0 dan
        // tidak ada yang menjawab, kita harus fall through ke timeout handler.
        if (
            isAdvancingRound ||
            get().selectedAnswerId ||
            !get().canAnswer()
        ) {
            return;
        }

        // ── TIMEOUT ──
        if (calculatedTimeLeft <= 1) {
            set({ timeLeft: 0 });
            console.log(
                `[MatchStore] Timer expired for round ${currentOrder}`,
            );

            if (isSolo) {
                console.log(
                    `[MatchStore] Solo mode - advancing round directly`,
                );
                await get().advanceRound();
                return;
            }

            // ── MULTIPLAYER MODE: apply timeout damage then poll ──
            if (currentBattleRoom) {
                const noOneAnswered =
                    !currentBattleRoom.first_answer_user_id;
                console.log(
                    `[MatchStore] Timer expired. Calling timeout API (noOneAnswered=${noOneAnswered})`,
                );

                try {
                    const res = await fetchWithTimeout("/api/battle/timeout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            game_room_id: gameRoomId,
                            round_number: currentOrder,
                            battle_room_id:
                                currentBattleRoom.battle_room_id,
                        }),
                        credentials: "include",
                    });

                    if (res.ok) {
                        console.log(
                            `[MatchStore] Timeout API call succeeded`,
                        );
                    } else {
                        const errorText = await res.text();
                        if (
                            errorText.includes("Battle room not found")
                        ) {
                            console.warn(
                                `[MatchStore] Battle room not found for timeout:`,
                                errorText,
                            );
                        } else {
                            console.error(
                                `[MatchStore] Failed timeout API call:`,
                                errorText,
                            );
                        }
                    }
                } catch (error) {
                    console.error(
                        `[MatchStore] Error calling timeout API:`,
                        error,
                    );
                }
            }

            console.log(
                `[MatchStore] Timer expired, waiting for all battles to finish...`,
            );
            await get().waitForAllBattlesAndAdvance();
            return;
        }

        // ── UPDATE DISPLAY ──
        if (calculatedTimeLeft !== timeLeft) {
            set({ timeLeft: calculatedTimeLeft });
        }
    },

    resetMatch: () => {
        set({
            roomCode: "",
            gameRoomId: "",
            roomInfo: null,
            currentOrder: 1,
            totalQuestions: null,
            currentQuestion: null,
            isLoadingQuestion: true,
            selectedAnswerId: null,
            isSubmitting: false,
            isFinished: false,
            timeLeft: SECONDS_PER_ROUND,
            roundStartTimestamp: Date.now(),
            players: [],
            currentUser: null,
            currentBattleRoom: null,
            opponentIds: [],
            firstAnswerPlayerId: null,
            firstAnswerId: null,
            nextRoundUrl: null,
            error: null,
            isWaitingForAllBattles: false,
            isAdvancingRound: false,
            isSyncingPlayers: false,
            lastAnswerCorrect: null,
            correctAnswerId: null,
            matchStartTime: null,
        });
    },
}));
