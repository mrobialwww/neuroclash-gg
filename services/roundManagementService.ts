import { GAME_CONSTANTS } from "@/lib/game/gameConstants";
import { battleRoomService } from "@/modules/battles/battle.service";
import { gamePlayersService } from "@/modules/gamePlayers/gamePlayers.service";
import { gameRoomService } from "@/modules/games/game.service";
import { getPlayerCharacterSkill } from "@/lib/game/characterSkill";

export const roundManagementService = {
    calculateDamage(roundNumber: number, totalQuestions: number): number {
        if (!totalQuestions || totalQuestions === 0)
            return GAME_CONSTANTS.BASE_DAMAGE;

        const damage =
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
        const answerDetail = await gamePlayersService.getAnswerDetail(answerId);
        if (!answerDetail) {
            return { success: false, is_correct: false, damage_applied: false, damage_dealt: 0, new_health: 100, message: "Answer not found" };
        }

        await gamePlayersService.submitAnswer(userId, answerId, gameId, roundNumber);

        // Atomically try to claim first answer — only succeeds if no one else already claimed it
        const wasFirst = await battleRoomService.recordFirstAnswer(battleRoomId, userId, answerId);

        if (wasFirst) {
            console.log(`[RoundService] First answer by ${userId.substring(0, 8)} — recording, no damage yet`);
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

        console.log(`[RoundService] Second answer by ${userId.substring(0, 8)} — resolving battle`);

        // Re-fetch battle room to get the actual first_answer_user_id (set by other player)
        const battleRoom = await battleRoomService.getBattleRoomById(battleRoomId);
        if (!battleRoom || !battleRoom.first_answer_user_id) {
            console.error(`[RoundService] ❌ Battle room ${battleRoomId} has no first answer after claiming failed`);
            return { success: false, is_correct: false, damage_applied: false, damage_dealt: 0, new_health: 100, message: "No first answer found" };
        }

        const firstAnswer = await gamePlayersService.getAnswerDetail(battleRoom.first_answer_id!);
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
            const firstSkill = await getPlayerCharacterSkill(firstUserId);
            const characterDamageBonus = firstSkill?.type === "damage" ? firstSkill.value : 0;
            const baseOffensiveDamage = damage + (firstBuff === 2 ? 10 : 0) + characterDamageBonus;

            if (characterDamageBonus > 0) {
                console.log(`[RoundService] [Skill] User ${firstUserId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`);
            }

            if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);

            const opponents = [battleRoom!.player1_id, battleRoom!.player2_id, battleRoom!.player3_id]
                .filter((id): id is string => id !== null && id !== firstUserId);

            for (const opponentId of opponents) {
                const opponentState = allPlayers.find((p) => p.id === opponentId);
                if (opponentState && opponentState.health > 0) {
                    const opponentBuff = await gamePlayersService.getActiveAbilityBuff(gameId, opponentId);
                    const opponentSkill = await getPlayerCharacterSkill(opponentId);
                    const characterDefenceBonus = opponentSkill?.type === "defence" ? opponentSkill.value : 0;

                    if (characterDefenceBonus > 0) {
                        console.log(`[RoundService] [Skill] Opponent ${opponentId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} damage reduction`);
                    }

                    const finalDamage = Math.max(0, baseOffensiveDamage - (opponentBuff === 4 ? 20 : 0) - characterDefenceBonus);

                    if (opponentBuff === 4 && baseOffensiveDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, opponentId, 4);

                    const newHealth = Math.max(0, opponentState.health - finalDamage);
                    await gamePlayersService.updateHealth(opponentId, gameId, newHealth, roundNumber);
                }
            }

            await gamePlayersService.incrementWin(firstUserId, gameId);
        } else if (firstIsCorrect && !secondIsCorrect) {
            const firstSkill = await getPlayerCharacterSkill(firstUserId);
            const characterDamageBonus = firstSkill?.type === "damage" ? firstSkill.value : 0;
            const baseOffensiveDamage = damage + (firstBuff === 2 ? 10 : 0) + characterDamageBonus;

            if (characterDamageBonus > 0) {
                console.log(`[RoundService] [Skill] User ${firstUserId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`);
            }

            if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);

            const opponents = [battleRoom!.player1_id, battleRoom!.player2_id, battleRoom!.player3_id]
                .filter((id): id is string => id !== null && id !== firstUserId);

            for (const opponentId of opponents) {
                const opponentState = allPlayers.find((p) => p.id === opponentId);
                if (opponentState && opponentState.health > 0) {
                    const opponentBuff = await gamePlayersService.getActiveAbilityBuff(gameId, opponentId);
                    const opponentSkill = await getPlayerCharacterSkill(opponentId);
                    const characterDefenceBonus = opponentSkill?.type === "defence" ? opponentSkill.value : 0;

                    if (characterDefenceBonus > 0) {
                        console.log(`[RoundService] [Skill] Opponent ${opponentId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} damage reduction`);
                    }

                    const finalDamage = Math.max(0, baseOffensiveDamage - (opponentBuff === 4 ? 20 : 0) - characterDefenceBonus);

                    if (opponentBuff === 4 && baseOffensiveDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, opponentId, 4);

                    const newHealth = Math.max(0, opponentState.health - finalDamage);
                    await gamePlayersService.updateHealth(opponentId, gameId, newHealth, roundNumber);
                }
            }

            await gamePlayersService.incrementWin(firstUserId, gameId);
        } else if (!firstIsCorrect && secondIsCorrect) {
            const secondSkill = await getPlayerCharacterSkill(userId);
            const characterDamageBonus = secondSkill?.type === "damage" ? secondSkill.value : 0;
            const baseOffensiveDamage = damage + (secondBuff === 2 ? 10 : 0) + characterDamageBonus;

            if (characterDamageBonus > 0) {
                console.log(`[RoundService] [Skill] User ${userId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`);
            }

            if (secondBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 2);

            const opponents = [battleRoom!.player1_id, battleRoom!.player2_id, battleRoom!.player3_id]
                .filter((id): id is string => id !== null && id !== userId);

            for (const opponentId of opponents) {
                const opponentState = allPlayers.find((p) => p.id === opponentId);
                if (opponentState && opponentState.health > 0) {
                    const opponentBuff = await gamePlayersService.getActiveAbilityBuff(gameId, opponentId);
                    const opponentSkill = await getPlayerCharacterSkill(opponentId);
                    const characterDefenceBonus = opponentSkill?.type === "defence" ? opponentSkill.value : 0;

                    if (characterDefenceBonus > 0) {
                        console.log(`[RoundService] [Skill] Opponent ${opponentId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} damage reduction`);
                    }

                    const finalDamage = Math.max(0, baseOffensiveDamage - (opponentBuff === 4 ? 20 : 0) - characterDefenceBonus);

                    if (opponentBuff === 4 && baseOffensiveDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, opponentId, 4);

                    const newHealth = Math.max(0, opponentState.health - finalDamage);
                    await gamePlayersService.updateHealth(opponentId, gameId, newHealth, roundNumber);
                }
            }

            await gamePlayersService.incrementWin(userId, gameId);
        } else {
            const firstPlayer = allPlayers.find((p) => p.id === firstUserId);
            if (firstPlayer && firstPlayer.health > 0) {
                const firstSkill = await getPlayerCharacterSkill(firstUserId);
                const firstDefenceBonus = firstSkill?.type === "defence" ? firstSkill.value : 0;

                if (firstDefenceBonus > 0) {
                    console.log(`[RoundService] [Skill] User ${firstUserId.substring(0, 8)} has Defence skill: -${firstDefenceBonus} self-damage reduction`);
                }

                const firstSelfDamage = Math.max(0, damage - (firstBuff === 4 ? 20 : 0) - firstDefenceBonus);

                if (firstBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 4);

                const newHealth = Math.max(0, firstPlayer.health - firstSelfDamage);
                await gamePlayersService.updateHealth(firstUserId, gameId, newHealth, roundNumber);
            }

            const secondPlayer = allPlayers.find((p) => p.id === userId);
            if (secondPlayer && secondPlayer.health > 0) {
                const secondSkill = await getPlayerCharacterSkill(userId);
                const secondDefenceBonus = secondSkill?.type === "defence" ? secondSkill.value : 0;

                if (secondDefenceBonus > 0) {
                    console.log(`[RoundService] [Skill] User ${userId.substring(0, 8)} has Defence skill: -${secondDefenceBonus} self-damage reduction`);
                }

                const secondSelfDamage = Math.max(0, damage - (secondBuff === 4 ? 20 : 0) - secondDefenceBonus);

                if (secondBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 4);

                const newHealth = Math.max(0, secondPlayer.health - secondSelfDamage);
                await gamePlayersService.updateHealth(userId, gameId, newHealth, roundNumber);
            }
        }

        await gameRoomService.updateBattleRoomStatus(battleRoomId, "finished");

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

        // Guard: if battle room was already resolved (e.g. second player answered just in time), skip
        if (battleRoom.status === "finished" || battleRoom.status === "timeout") {
            console.log(`[RoundService] Battle room ${battleRoomId} already ${battleRoom.status}, skipping timeout processing`);
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

        if (battleRoom.first_answer_user_id) {
            const firstUserId = battleRoom.first_answer_user_id;
            const firstAnswer = await gamePlayersService.getAnswerDetail(battleRoom.first_answer_id!);
            const firstIsCorrect = firstAnswer?.is_correct ?? false;
            const firstBuff = await gamePlayersService.getActiveAbilityBuff(gameId, firstUserId);

            if (firstIsCorrect) {
                const firstSkill = await getPlayerCharacterSkill(firstUserId);
                const characterDamageBonus = firstSkill?.type === "damage" ? firstSkill.value : 0;
                const baseDamage = damage + (firstBuff === 2 ? 10 : 0) + characterDamageBonus;

                if (characterDamageBonus > 0) {
                    console.log(`[RoundService] [Timeout] [Skill] User ${firstUserId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`);
                }

                if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);

                for (const playerId of players) {
                    if (playerId === firstUserId) continue;
                    const allPlayersTimeout = await gamePlayersService.getParticipantsList(gameId);
                    const playerState = allPlayersTimeout.find((p) => p.id === playerId);
                    if (playerState && playerState.health > 0) {
                        const opponentBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                        const opponentSkill = await getPlayerCharacterSkill(playerId);
                        const characterDefenceBonus = opponentSkill?.type === "defence" ? opponentSkill.value : 0;

                        if (characterDefenceBonus > 0) {
                            console.log(`[RoundService] [Timeout] [Skill] Player ${playerId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} timeout damage reduction`);
                        }

                        const finalDamage = Math.max(0, baseDamage - (opponentBuff === 4 ? 20 : 0) - characterDefenceBonus);

                        if (opponentBuff === 4 && baseDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);

                        const newHealth = Math.max(0, playerState.health - finalDamage);
                        await gamePlayersService.updateHealth(playerId, gameId, newHealth, roundNumber);
                    }
                }

                await gamePlayersService.incrementWin(firstUserId, gameId);
            } else {
                const firstSkill = await getPlayerCharacterSkill(firstUserId);
                const firstDefenceBonus = firstSkill?.type === "defence" ? firstSkill.value : 0;

                if (firstDefenceBonus > 0) {
                    console.log(`[RoundService] [Timeout] [Skill] User ${firstUserId.substring(0, 8)} has Defence skill: -${firstDefenceBonus} timeout damage reduction`);
                }

                const selfDamage = Math.max(0, damage - (firstBuff === 4 ? 20 : 0) - firstDefenceBonus);

                if (firstBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 4);

                const allPlayersTimeout = await gamePlayersService.getParticipantsList(gameId);
                const firstPlayer = allPlayersTimeout.find((p) => p.id === firstUserId);
                if (firstPlayer && firstPlayer.health > 0) {
                    const newHealth = Math.max(0, firstPlayer.health - selfDamage);
                    await gamePlayersService.updateHealth(firstUserId, gameId, newHealth, roundNumber);
                }

                for (const playerId of players) {
                    if (playerId === firstUserId) continue;
                    const playerState = (await gamePlayersService.getParticipantsList(gameId))
                        .find((p) => p.id === playerId);
                    if (playerState && playerState.health > 0) {
                        const playerBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                        const playerSkill = await getPlayerCharacterSkill(playerId);
                        const characterDefenceBonus = playerSkill?.type === "defence" ? playerSkill.value : 0;

                        if (characterDefenceBonus > 0) {
                            console.log(`[RoundService] [Timeout] [Skill] Player ${playerId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} timeout damage reduction`);
                        }

                        const finalDamage = Math.max(0, damage - (playerBuff === 4 ? 20 : 0) - characterDefenceBonus);

                        if (playerBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);

                        const newHealth = Math.max(0, playerState.health - finalDamage);
                        await gamePlayersService.updateHealth(playerId, gameId, newHealth, roundNumber);
                    }
                }
            }
        } else {
            for (const playerId of players) {
                const allPlayersTimeout = await gamePlayersService.getParticipantsList(gameId);
                const playerState = allPlayersTimeout.find((p) => p.id === playerId);
                if (playerState && playerState.health > 0) {
                    const playerBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                    const playerSkill = await getPlayerCharacterSkill(playerId);
                    const characterDefenceBonus = playerSkill?.type === "defence" ? playerSkill.value : 0;

                    if (characterDefenceBonus > 0) {
                        console.log(`[RoundService] [Timeout] [Skill] Player ${playerId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} timeout damage reduction`);
                    }

                    const finalDamage = Math.max(0, damage - (playerBuff === 4 ? 20 : 0) - characterDefenceBonus);

                    if (playerBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);

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
