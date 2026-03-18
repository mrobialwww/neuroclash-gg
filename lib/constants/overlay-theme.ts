import { Difficulty } from "@/types";

export const CATEGORY_THEME_MAP: Record<string, string> = {
  Matematika: "bg-[#4361EE]",
  IPA: "bg-[#2ECC71]",
  IPS: "bg-[#E67E22]",
  "Bahasa Inggris": "bg-[#9B59B6]",
  "Bahasa Indonesia": "bg-[#E74C3C]",
  Pemrograman: "bg-[#256AF4]",
  Biologi: "bg-[#B4DD7F]",
  Sejarah: "bg-[#D35400]",
};

export const DIFFICULTY_THEME_MAP: Record<
  Difficulty,
  { badgeBg: string; badgeText: string }
> = {
  mudah: {
    badgeBg: "bg-[#67C48B]/20",
    badgeText: "text-[#1A7A45]",
  },
  sedang: {
    badgeBg: "bg-[#F3B600]/20",
    badgeText: "text-[#A17800]",
  },
  sulit: {
    badgeBg: "bg-[#FF5C5C]/20",
    badgeText: "text-[#C0392B]",
  },
};

export const getBannerColor = (category: string) =>
  CATEGORY_THEME_MAP[category] || "bg-[#256AF4]";
