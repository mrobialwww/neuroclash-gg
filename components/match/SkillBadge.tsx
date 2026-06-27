"use client";

import { SkillType } from "@/lib/constants/characters";
import { cn } from "@/lib/utils/utils";

interface SkillBadgeProps {
    skillType: SkillType;
    skinLevel: "epic" | "legend";
    className?: string;
}

const SKILL_CONFIG: Record<
    SkillType,
    { icon: string; label: string; color: string; glow: string }
> = {
    damage: {
        icon: "⚔️",
        label: "Damage",
        color: "bg-orange-500/20 border-orange-400/50 text-orange-300",
        glow: "shadow-orange-500/30",
    },
    defence: {
        icon: "🛡️",
        label: "Defence",
        color: "bg-blue-500/20 border-blue-400/50 text-blue-300",
        glow: "shadow-blue-500/30",
    },
    heal: {
        icon: "❤️",
        label: "Heal",
        color: "bg-green-500/20 border-green-400/50 text-green-300",
        glow: "shadow-green-500/30",
    },
};

const SKILL_VALUE: Record<SkillType, { epic: string; legend: string }> = {
    damage: { epic: "+4 DMG", legend: "+8 DMG" },
    defence: { epic: "-4 DMG", legend: "-8 DMG" },
    heal: { epic: "+2 HP/ronde", legend: "+4 HP/ronde" },
};

/**
 * Badge kecil yang menampilkan tipe skill pasif karakter.
 * Ditampilkan di bawah avatar pada PlayerCard saat 1v1.
 */
export const SkillBadge = ({
    skillType,
    skinLevel,
    className,
}: SkillBadgeProps) => {
    const config = SKILL_CONFIG[skillType];
    const value = SKILL_VALUE[skillType][skinLevel];
    const isLegend = skinLevel === "legend";

    return (
        <div
            className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-sm transition-all duration-300",
                config.color,
                config.glow,
                // Legend punya ring ekstra emas
                isLegend && "ring-1 ring-yellow-400/50",
                className,
            )}
            title={`Skill Pasif: ${config.label} (${value})`}
        >
            <span className="text-[11px] leading-none">{config.icon}</span>
            <span className="leading-none tracking-tight">
                {isLegend ? (
                    <span className="text-yellow-300">{value}</span>
                ) : (
                    value
                )}
            </span>
        </div>
    );
};
