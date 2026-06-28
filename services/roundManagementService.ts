import { GAME_CONSTANTS } from "@/lib/game/gameConstants";
import { battleRoomService } from "@/modules/battles/battle.service";
import { gamePlayersService } from "@/modules/gamePlayers/gamePlayers.service";
import { gameRoomService } from "@/modules/games/game.service";
import { getPlayerCharacterSkill } from "@/lib/game/characterSkill";

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
        let battleRoom = await battleRoomService.getBattleRoomById(battleRoomId);
        let isFirstAnswer = !battleRoom?.first_answer_user_id;

        if (isFirstAnswer) {
            console.log(`[RoundService] First answer by ${userId.substring(0, 8)} — attempting to record`);
            const recorded = await battleRoomService.recordFirstAnswer(battleRoomId, userId, answerId);
            
            if (recorded) {
                await gamePlayersService.markFirstAnswer(userId, answerId, roundNumber, battleRoomId);

                return {
                    success: true,
                    is_correct: answerDetail.is_correct,
                    damage_applied: false,
                    damage_dealt: 0,
                    new_health: null,
                    message: "Answer recorded",
                };
            } else {
                console.log(`[RoundService] User ${userId.substring(0, 8)} lost the first-answer race. Falling back to second answer logic.`);
                battleRoom = await battleRoomService.getBattleRoomById(battleRoomId);
                isFirstAnswer = false;
            }
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
            // StarBox Attack buff (+10) + [SKILL] Character Damage bonus
            const firstSkill = await getPlayerCharacterSkill(firstUserId);
            const characterDamageBonus =
                firstSkill?.type === "damage" ? firstSkill.value : 0;
            const baseOffensiveDamage =
                damage + (firstBuff === 2 ? 10 : 0) + characterDamageBonus;

            if (characterDamageBonus > 0) {
                console.log(
                    `[RoundService] [Skill] User ${firstUserId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`,
                );
            }

            if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);

            // Apply damage to second player (the slower one)
            const secondPlayer = allPlayers.find((p) => p.id === userId);
            if (secondPlayer && secondPlayer.health > 0) {
                // StarBox Shield buff (-20) + [SKILL] Character Defence bonus
                const secondSkill = await getPlayerCharacterSkill(userId);
                const characterDefenceBonus =
                    secondSkill?.type === "defence" ? secondSkill.value : 0;

                if (characterDefenceBonus > 0) {
                    console.log(
                        `[RoundService] [Skill] Opponent ${userId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} damage reduction`,
                    );
                }

                const finalDamage = Math.max(
                    0,
                    baseOffensiveDamage - (secondBuff === 4 ? 20 : 0) - characterDefenceBonus,
                );

                if (secondBuff === 4 && baseOffensiveDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 4);

                const newHealth = Math.max(0, secondPlayer.health - finalDamage);
                console.log(
                    `[RoundService] Applying damage to opponent ${userId.substring(0, 8)}: ${secondPlayer.health} -> ${newHealth}, round=${roundNumber} (OffensiveDamage: ${baseOffensiveDamage}, OpponentBuff: ${secondBuff}, CharDefence: ${characterDefenceBonus})`,
                );
                await gamePlayersService.updateHealth(userId, gameId, newHealth, roundNumber);
            }

            await gamePlayersService.incrementWin(firstUserId, gameId);
        } else if (firstIsCorrect && !secondIsCorrect) {
            // One Correct (first) -> Correct deals damage to wrong
            // StarBox Attack buff (+10) + [SKILL] Character Damage bonus
            const firstSkill = await getPlayerCharacterSkill(firstUserId);
            const characterDamageBonus =
                firstSkill?.type === "damage" ? firstSkill.value : 0;
            const baseOffensiveDamage =
                damage + (firstBuff === 2 ? 10 : 0) + characterDamageBonus;

            if (characterDamageBonus > 0) {
                console.log(
                    `[RoundService] [Skill] User ${firstUserId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`,
                );
            }

            if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);

            const secondPlayer = allPlayers.find((p) => p.id === userId);
            if (secondPlayer && secondPlayer.health > 0) {
                const secondSkill = await getPlayerCharacterSkill(userId);
                const characterDefenceBonus =
                    secondSkill?.type === "defence" ? secondSkill.value : 0;

                if (characterDefenceBonus > 0) {
                    console.log(
                        `[RoundService] [Skill] Opponent ${userId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} damage reduction`,
                    );
                }

                const finalDamage = Math.max(
                    0,
                    baseOffensiveDamage - (secondBuff === 4 ? 20 : 0) - characterDefenceBonus,
                );

                if (secondBuff === 4 && baseOffensiveDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 4);

                const newHealth = Math.max(0, secondPlayer.health - finalDamage);
                console.log(
                    `[RoundService] Applying damage to opponent ${userId.substring(0, 8)}: ${secondPlayer.health} -> ${newHealth}, round=${roundNumber} (OffensiveDamage: ${baseOffensiveDamage}, OpponentBuff: ${secondBuff}, CharDefence: ${characterDefenceBonus})`,
                );
                await gamePlayersService.updateHealth(userId, gameId, newHealth, roundNumber);
            }

            await gamePlayersService.incrementWin(firstUserId, gameId);
        } else if (!firstIsCorrect && secondIsCorrect) {
            // One Correct (second) -> Correct deals damage to wrong
            // StarBox Attack buff (+10) + [SKILL] Character Damage bonus
            const secondSkill = await getPlayerCharacterSkill(userId);
            const characterDamageBonus =
                secondSkill?.type === "damage" ? secondSkill.value : 0;
            const baseOffensiveDamage =
                damage + (secondBuff === 2 ? 10 : 0) + characterDamageBonus;

            if (characterDamageBonus > 0) {
                console.log(
                    `[RoundService] [Skill] User ${userId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`,
                );
            }

            if (secondBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 2);

            const firstPlayer = allPlayers.find((p) => p.id === firstUserId);
            if (firstPlayer && firstPlayer.health > 0) {
                const firstSkillDef = await getPlayerCharacterSkill(firstUserId);
                const characterDefenceBonus =
                    firstSkillDef?.type === "defence" ? firstSkillDef.value : 0;

                if (characterDefenceBonus > 0) {
                    console.log(
                        `[RoundService] [Skill] Opponent ${firstUserId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} damage reduction`,
                    );
                }

                const finalDamage = Math.max(
                    0,
                    baseOffensiveDamage - (firstBuff === 4 ? 20 : 0) - characterDefenceBonus,
                );

                if (firstBuff === 4 && baseOffensiveDamage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 4);

                const newHealth = Math.max(0, firstPlayer.health - finalDamage);
                console.log(
                    `[RoundService] Applying damage to opponent ${firstUserId.substring(0, 8)}: ${firstPlayer.health} -> ${newHealth}, round=${roundNumber} (OffensiveDamage: ${baseOffensiveDamage}, OpponentBuff: ${firstBuff}, CharDefence: ${characterDefenceBonus})`,
                );
                await gamePlayersService.updateHealth(firstUserId, gameId, newHealth, roundNumber);
            }

            await gamePlayersService.incrementWin(userId, gameId);
        } else {
            // Both Wrong -> Both receive self-damage
            // StarBox Shield buff (-20) + [SKILL] Character Defence bonus

            // First player self-damage
            const firstSkillDef = await getPlayerCharacterSkill(firstUserId);
            const firstCharDefenceBonus =
                firstSkillDef?.type === "defence" ? firstSkillDef.value : 0;
            if (firstCharDefenceBonus > 0) {
                console.log(
                    `[RoundService] [Skill] User ${firstUserId.substring(0, 8)} has Defence skill: -${firstCharDefenceBonus} self-damage reduction`,
                );
            }
            const firstSelfDamage = Math.max(0, damage - (firstBuff === 4 ? 20 : 0) - firstCharDefenceBonus);
            if (firstBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 4);

            const firstPlayer = allPlayers.find((p) => p.id === firstUserId);
            if (firstPlayer && firstPlayer.health > 0) {
                const newHealth = Math.max(0, firstPlayer.health - firstSelfDamage);
                console.log(
                    `[RoundService] Applying damage to self ${firstUserId.substring(0, 8)}: ${firstPlayer.health} -> ${newHealth}, round=${roundNumber} (SelfDamage: ${firstSelfDamage}, CharDefence: ${firstCharDefenceBonus})`,
                );
                await gamePlayersService.updateHealth(firstUserId, gameId, newHealth, roundNumber);
            }

            // Second player self-damage
            const secondSkillDef = await getPlayerCharacterSkill(userId);
            const secondCharDefenceBonus =
                secondSkillDef?.type === "defence" ? secondSkillDef.value : 0;
            if (secondCharDefenceBonus > 0) {
                console.log(
                    `[RoundService] [Skill] User ${userId.substring(0, 8)} has Defence skill: -${secondCharDefenceBonus} self-damage reduction`,
                );
            }
            const secondSelfDamage = Math.max(0, damage - (secondBuff === 4 ? 20 : 0) - secondCharDefenceBonus);
            if (secondBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, userId, 4);

            const secondPlayer = allPlayers.find((p) => p.id === userId);
            if (secondPlayer && secondPlayer.health > 0) {
                const newHealth = Math.max(0, secondPlayer.health - secondSelfDamage);
                console.log(
                    `[RoundService] Applying damage to self ${userId.substring(0, 8)}: ${secondPlayer.health} -> ${newHealth}, round=${roundNumber} (SelfDamage: ${secondSelfDamage}, CharDefence: ${secondCharDefenceBonus})`,
                );
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
                // StarBox Attack buff (+10) + [SKILL] Character Damage bonus
                const firstSkill = await getPlayerCharacterSkill(firstUserId);
                const characterDamageBonus =
                    firstSkill?.type === "damage" ? firstSkill.value : 0;
                const baseOffensiveDamage = damage + (firstBuff === 2 ? 10 : 0) + characterDamageBonus;

                if (characterDamageBonus > 0) {
                    console.log(
                        `[RoundService] [Timeout] [Skill] Player ${firstUserId.substring(0, 8)} has Damage skill: +${characterDamageBonus} bonus damage`,
                    );
                }

                if (firstBuff === 2) await gamePlayersService.userAttackorShieldAbility(gameId, firstUserId, 2);

                for (const playerId of players) {
                    if (playerId === firstUserId) continue;
                    const playerState = allPlayers.find((p) => p.id === playerId);
                    if (playerState && playerState.health > 0) {
                        const opponentBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                        const opponentSkill = await getPlayerCharacterSkill(playerId);
                        const characterDefenceBonus =
                            opponentSkill?.type === "defence" ? opponentSkill.value : 0;

                        if (characterDefenceBonus > 0) {
                            console.log(
                                `[RoundService] [Timeout] [Skill] Player ${playerId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} timeout damage reduction`,
                            );
                        }

                        const finalDamage = Math.max(0, baseOffensiveDamage - (opponentBuff === 4 ? 20 : 0) - characterDefenceBonus);
                        if (opponentBuff === 4 && baseOffensiveDamage > 0) {
                            await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);
                        }
                        const healthAfterDamage = Math.max(0, playerState.health - finalDamage);
                        console.log(
                            `[RoundService] [Timeout] Applying damage to ${playerId.substring(0, 8)}: ${playerState.health} -> ${healthAfterDamage}, round=${roundNumber} (CharDefence: ${characterDefenceBonus})`,
                        );
                        await gamePlayersService.updateHealth(playerId, gameId, healthAfterDamage, roundNumber);
                    }
                }

                await gamePlayersService.incrementWin(firstUserId, gameId);
            } else {
                // Wrong answerer takes self-damage, timeout players also take damage
                const firstSkillDef = await getPlayerCharacterSkill(firstUserId);
                const firstCharDefenceBonus =
                    firstSkillDef?.type === "defence" ? firstSkillDef.value : 0;
                const selfDamage = Math.max(0, damage - (firstBuff === 4 ? 20 : 0) - firstCharDefenceBonus);
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
                        const playerSkill = await getPlayerCharacterSkill(playerId);
                        const characterDefenceBonus =
                            playerSkill?.type === "defence" ? playerSkill.value : 0;
                        const finalDamage = Math.max(0, damage - (playerBuff === 4 ? 20 : 0) - characterDefenceBonus);
                        if (playerBuff === 4 && damage > 0) {
                            await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);
                        }
                        const newHealth = Math.max(0, playerState.health - finalDamage);
                        await gamePlayersService.updateHealth(playerId, gameId, newHealth, roundNumber);
                    }
                }
            }
        } else {
            // No one answered — all players take timeout damage with skill defence
            for (const playerId of players) {
                const playerState = allPlayers.find((p) => p.id === playerId);
                if (playerState && playerState.health > 0) {
                    const playerBuff = await gamePlayersService.getActiveAbilityBuff(gameId, playerId);
                    const playerSkill = await getPlayerCharacterSkill(playerId);
                    const characterDefenceBonus =
                        playerSkill?.type === "defence" ? playerSkill.value : 0;

                    if (characterDefenceBonus > 0) {
                        console.log(
                            `[RoundService] [Timeout] [Skill] Player ${playerId.substring(0, 8)} has Defence skill: -${characterDefenceBonus} timeout damage reduction`,
                        );
                    }

                    const finalDamage = Math.max(
                        0,
                        damage - (playerBuff === 4 ? 20 : 0) - characterDefenceBonus,
                    );

                    if (playerBuff === 4 && damage > 0) await gamePlayersService.userAttackorShieldAbility(gameId, playerId, 4);

                    const healthAfterDamage = Math.max(0, playerState.health - finalDamage);
                    console.log(
                        `[RoundService] [Timeout] Applying damage to ${playerId.substring(0, 8)}: ${playerState.health} -> ${healthAfterDamage}, round=${roundNumber} (CharDefence: ${characterDefenceBonus})`,
                    );
                    await gamePlayersService.updateHealth(playerId, gameId, healthAfterDamage, roundNumber);
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
