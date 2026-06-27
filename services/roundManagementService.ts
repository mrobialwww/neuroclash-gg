import { GAME_CONSTANTS } from "@/lib/game/gameConstants";
import { battleRoomService } from "@/modules/battles/battle.service";
import { gamePlayersService } from "@/modules/gamePlayers/gamePlayers.service";
import { gameRoomService } from "@/modules/games/game.service";

export const roundManagementService = {
    calculateDamage(roundNumber: number, totalQuestions: number): number {
        if (!totalQuestions || totalQuestions === 0)
            return GAME_CONSTANTS.BASE_DAMAGE;

        let damage =
            GAME_CONSTANTS.ROUND_DAMAGE_MIN +
            (roundNumber / totalQuestions) * GAME_CONSTANTS.ROUND_DAMAGE_SCALE;

        return Math.floor(damage);
    },

    async processAnswer(
        userId: string,
        answerId: string,
        battleRoomId: string,
        gameId: string,
        roundNumber: number,
    ) {
        // 1. Get answer details
        const answerDetail = await gamePlayersService.getAnswerDetail(answerId);
        if (!answerDetail) {
            return { success: false, is_correct: false, damage_applied: false, damage_dealt: 0, new_health: 100, message: "Answer not found" };
        }

        // 2. Record the answer
        await gamePlayersService.submitAnswer(userId, answerId, gameId, roundNumber);

        // 3. Check if this is the first answer in this battle room
        const battleRoom = await battleRoomService.getBattleRoomById(battleRoomId);
        const isFirstAnswer = !battleRoom?.first_answer_user_id;

        if (isFirstAnswer) {
            console.log(`[RoundService] First answer by ${userId.substring(0, 8)} — recording, no damage yet`);
            await battleRoomService.recordFirstAnswer(battleRoomId, userId, answerId);
            await gamePlayersService.markFirstAnswer(userId, answerId, roundNumber, battleRoomId);

            return {
                success: true,
                is_correct: answerDetail.is_correct,
                damage_applied: false,
                damage_dealt: 0,
                new_health: null,
                message: "Answer recorded",
            };
        }

        // 4. Second answer — resolve the battle based on both answers
        console.log(`[RoundService] Second answer by ${userId.substring(0, 8)} — resolving battle`);

        const firstAnswer = await gamePlayersService.getAnswerDetail(battleRoom!.first_answer_id!);
        const firstIsCorrect = firstAnswer?.is_correct ?? false;
        const secondIsCorrect = answerDetail.is_correct;

        const questionData = await battleRoomService.getQuestionMeta(answerDetail.question_id);
        const gameRoomData = await gameRoomService.getGameRoom(gameId);
        const currentOrder = questionData?.question_order ?? roundNumber;
        const totalQuestions = gameRoomData?.total_round || 20;
        const damage = this.calculateDamage(currentOrder, totalQuestions);

        const allPlayers = await gamePlayersService.getParticipantsList(gameId);
        const firstUserId = battleRoom!.first_answer_user_id!;

        const firstBuff = await gamePlayersService.getActiveAbilityBuff(gameId, firstUserId);
        const secondBuff = await gamePlayersService.getActiveAbilityBuff(gameId, userId);

        if (firstIsCorrect && secondIsCorrect) {
            // Both Correct -> Fastest (first) deals damage to second
            const baseDamage = damage + (firstBuff === 2 ? 10 : 0);
            const finalDamage = Math.max(0, baseDamage - (secondBuff === 4 ? 20 : 0));

            if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);
            if (secondBuff === 4 && baseDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 4);

            const secondPlayer = allPlayers.find((p) => p.id === userId);
            if (secondPlayer && secondPlayer.health > 0) {
                const newHealth = Math.max(0, secondPlayer.health - finalDamage);
                await gamePlayersService.updateHealth(userId, gameId, newHealth, roundNumber);
            }

            await gamePlayersService.incrementWin(firstUserId, gameId);
        } else if (firstIsCorrect && !secondIsCorrect) {
            // One Correct (first) -> Correct deals damage to wrong
            const baseDamage = damage + (firstBuff === 2 ? 10 : 0);
            const finalDamage = Math.max(0, baseDamage - (secondBuff === 4 ? 20 : 0));

            if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);
            if (secondBuff === 4 && baseDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 4);

            const secondPlayer = allPlayers.find((p) => p.id === userId);
            if (secondPlayer && secondPlayer.health > 0) {
                const newHealth = Math.max(0, secondPlayer.health - finalDamage);
                await gamePlayersService.updateHealth(userId, gameId, newHealth, roundNumber);
            }

            await gamePlayersService.incrementWin(firstUserId, gameId);
        } else if (!firstIsCorrect && secondIsCorrect) {
            // One Correct (second) -> Correct deals damage to wrong
            const baseDamage = damage + (secondBuff === 2 ? 10 : 0);
            const finalDamage = Math.max(0, baseDamage - (firstBuff === 4 ? 20 : 0));

            if (secondBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 2);
            if (firstBuff === 4 && baseDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 4);

            const firstPlayer = allPlayers.find((p) => p.id === firstUserId);
            if (firstPlayer && firstPlayer.health > 0) {
                const newHealth = Math.max(0, firstPlayer.health - finalDamage);
                await gamePlayersService.updateHealth(firstUserId, gameId, newHealth, roundNumber);
            }

            await gamePlayersService.incrementWin(userId, gameId);
        } else {
            // Both Wrong -> Both receive self-damage
            const firstSelfDamage = Math.max(0, damage - (firstBuff === 4 ? 20 : 0));
            const secondSelfDamage = Math.max(0, damage - (secondBuff === 4 ? 20 : 0));

            if (firstBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 4);
            if (secondBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 4);

            const firstPlayer = allPlayers.find((p) => p.id === firstUserId);
            if (firstPlayer && firstPlayer.health > 0) {
                const newHealth = Math.max(0, firstPlayer.health - firstSelfDamage);
                await gamePlayersService.updateHealth(firstUserId, gameId, newHealth, roundNumber);
            }

            const secondPlayer = allPlayers.find((p) => p.id === userId);
            if (secondPlayer && secondPlayer.health > 0) {
                const newHealth = Math.max(0, secondPlayer.health - secondSelfDamage);
                await gamePlayersService.updateHealth(userId, gameId, newHealth, roundNumber);
            }
        }

        // 5. Mark battle room as finished
        await gameRoomService.updateBattleRoomStatus(battleRoomId, "finished");

        // 6. Check if all battle rooms finished
        const allFinished = await battleRoomService.areAllBattlesFinished(gameId, roundNumber);
        if (allFinished) {
            console.log(`[RoundService] All battle rooms finished for round ${roundNumber}`);
            await battleRoomService.finalizeMatchRound(gameId, roundNumber);

            const shouldEnd = await gameRoomService.checkGameEndCondition(gameId);
            if (shouldEnd) {
                await gameRoomService.endGame(gameId);
            } else {
                const gameRoom = await gameRoomService.getGameRoom(gameId);
                if (gameRoom && gameRoom.room_status === "finished") {
                    console.log(`[RoundService] Game already ended — skipping prepareNextRound`);
                } else {
                    await gameRoomService.prepareNextRound(gameId, roundNumber);
                }
            }
        }

        return {
            success: true,
            is_correct: secondIsCorrect,
            damage_applied: true,
            damage_dealt: damage,
            message: secondIsCorrect ? "Correct answer!" : "Wrong answer",
        };
    },

    async handleTimeout(
        battleRoomId: string,
        gameId: string,
        roundNumber: number,
    ): Promise<void> {
        const battleRoom = await battleRoomService.getBattleRoomById(battleRoomId);
        if (!battleRoom) {
            console.warn(`[RoundService] Battle room ${battleRoomId} not found during timeout`);
            return;
        }

        const questionData = await battleRoomService.getQuestionMeta(battleRoom.question_id);
        const gameRoomData = await gameRoomService.getGameRoom(gameId);
        if (!gameRoomData) return;

        const currentOrder = questionData?.question_order ?? roundNumber;
        const totalQuestions = gameRoomData.total_round || 20;
        const damage = this.calculateDamage(currentOrder, totalQuestions);

        const players = [battleRoom.player1_id, battleRoom.player2_id, battleRoom.player3_id]
            .filter((id): id is string => id !== null);

        const allPlayers = await gamePlayersService.getParticipantsList(gameId);

        if (battleRoom.first_answer_user_id) {
            // Someone already answered — resolve based on their answer
            const firstUserId = battleRoom.first_answer_user_id;
            const firstAnswer = await gamePlayersService.getAnswerDetail(battleRoom.first_answer_id!);
            const firstIsCorrect = firstAnswer?.is_correct ?? false;
            const firstBuff = await gamePlayersService.getActiveAbilityBuff(gameId, firstUserId);

            if (firstIsCorrect) {
                // Correct answerer deals damage to timeout players
                const baseDamage = damage + (firstBuff === 2 ? 10 : 0);
                if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);

                for (const playerId of players) {
                    if (playerId === firstUserId) continue;
                    const playerState = allPlayers.find((p) => p.id === playerId);
                    if (playerState && playerState.health > 0) {
                        const opponentBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                        const finalDamage = Math.max(0, baseDamage - (opponentBuff === 4 ? 20 : 0));
                        if (opponentBuff === 4 && baseDamage > 0) {
                            await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);
                        }
                        const newHealth = Math.max(0, playerState.health - finalDamage);
                        await gamePlayersService.updateHealth(playerId, gameId, newHealth, roundNumber);
                    }
                }

                await gamePlayersService.incrementWin(firstUserId, gameId);
            } else {
                // Wrong answerer takes self-damage, timeout players also take damage
                const selfDamage = Math.max(0, damage - (firstBuff === 4 ? 20 : 0));
                if (firstBuff === 4 && damage > 0) {
                    await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 4);
                }

                const firstPlayer = allPlayers.find((p) => p.id === firstUserId);
                if (firstPlayer && firstPlayer.health > 0) {
                    const newHealth = Math.max(0, firstPlayer.health - selfDamage);
                    await gamePlayersService.updateHealth(firstUserId, gameId, newHealth, roundNumber);
                }

                for (const playerId of players) {
                    if (playerId === firstUserId) continue;
                    const playerState = allPlayers.find((p) => p.id === playerId);
                    if (playerState && playerState.health > 0) {
                        const playerBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                        const finalDamage = Math.max(0, damage - (playerBuff === 4 ? 20 : 0));
                        if (playerBuff === 4 && damage > 0) {
                            await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);
                        }
                        const newHealth = Math.max(0, playerState.health - finalDamage);
                        await gamePlayersService.updateHealth(playerId, gameId, newHealth, roundNumber);
                    }
                }
            }
        } else {
            // No one answered — all players take timeout damage
            for (const playerId of players) {
                const playerState = allPlayers.find((p) => p.id === playerId);
                if (playerState && playerState.health > 0) {
                    const playerBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                    const finalDamage = Math.max(0, damage - (playerBuff === 4 ? 20 : 0));
                    if (playerBuff === 4 && damage > 0) {
                        await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);
                    }
                    const newHealth = Math.max(0, playerState.health - finalDamage);
                    await gamePlayersService.updateHealth(playerId, gameId, newHealth, roundNumber);
                }
            }
        }

        await gameRoomService.updateBattleRoomStatus(battleRoomId, "timeout");

        const allFinished = await battleRoomService.areAllBattlesFinished(gameId, roundNumber);
        if (allFinished) {
            console.log(`[RoundService] All battle rooms finished (timeout) for round ${roundNumber}`);
            await battleRoomService.finalizeMatchRound(gameId, roundNumber);

            const shouldEnd = await gameRoomService.checkGameEndCondition(gameId);
            if (shouldEnd) {
                await gameRoomService.endGame(gameId);
            } else {
                const gameRoom = await gameRoomService.getGameRoom(gameId);
                if (gameRoom && gameRoom.room_status === "finished") {
                    console.log(`[RoundService] Game already ended — skipping prepareNextRound (timeout)`);
                } else {
                    await gameRoomService.prepareNextRound(gameId, roundNumber);
                }
            }
        }
    },
};
