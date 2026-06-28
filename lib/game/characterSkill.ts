import { characterServices } from "@/modules/characters/character.service";
import {
    CHARACTER_SKILL_MAP,
    SKILL_VALUES,
    SkillType,
} from "@/lib/constants/characters";

export interface ResolvedSkill {
    type: SkillType;
    value: number;
}

/**
 * Mengambil skill pasif dari karakter yang sedang dipakai (is_used = true) oleh user.
 *
 * Return null jika:
 * - User tidak memiliki karakter aktif
 * - Karakter aktif adalah skin_level "default" (tidak punya skill)
 * - skin_name tidak terdaftar di CHARACTER_SKILL_MAP
 *
 * @param userId - ID user yang akan dicek skill-nya
 * @returns ResolvedSkill ({ type, value }) atau null jika tidak punya skill
 */
export async function getPlayerCharacterSkill(
    userId: string,
): Promise<ResolvedSkill | null> {
    // Ambil karakter yang sedang dipakai user (is_used = true)
    const equipped = await characterServices.getUserCharacters(userId, true);

    console.log(`[CharacterSkill] userId=${userId.substring(0, 8)} equipped:`, JSON.stringify(equipped));

    if (!equipped || equipped.length === 0) {
        console.log(`[CharacterSkill] No equipped character found for user ${userId.substring(0, 8)}`);
        return null;
    }

    const char = equipped[0];
    console.log(`[CharacterSkill] char:`, JSON.stringify({ skin_name: char.skin_name, skin_level: char.skin_level }));

    // Karakter base/default tidak mendapat skill pasif
    if (char.skin_level === "default") {
        console.log(`[CharacterSkill] skin_level is 'default' — no skill`);
        return null;
    }

    // Cari tipe skill berdasarkan nama skin — case-insensitive + trim whitespace
    // agar nama dari DB (misalnya "Mecha Blaze" atau "mecha blaze") tetap cocok
    const normalizedSkinName = char.skin_name.trim().toLowerCase();
    console.log(`[CharacterSkill] normalizedSkinName="${normalizedSkinName}"`);
    console.log(`[CharacterSkill] CHARACTER_SKILL_MAP keys:`, Object.keys(CHARACTER_SKILL_MAP).map(k => `"${k}"`).join(", "));

    const matchedKey = Object.keys(CHARACTER_SKILL_MAP).find(
        (key) => key.trim().toLowerCase() === normalizedSkinName,
    );
    console.log(`[CharacterSkill] matchedKey="${matchedKey}"`);

    const skillType = matchedKey ? CHARACTER_SKILL_MAP[matchedKey] : undefined;
    if (!skillType) {
        console.log(`[CharacterSkill] No skill found for skin_name="${char.skin_name}"`);
        return null;
    }

    // Tentukan nilai berdasarkan skin_level (epic atau legend)
    const skinLevel = char.skin_level as "epic" | "legend";
    const value = SKILL_VALUES[skillType][skinLevel];

    console.log(`[CharacterSkill] Resolved skill: type=${skillType}, value=${value}`);
    return { type: skillType, value };
}
