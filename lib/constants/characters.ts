export const CHARACTER_BG_COLORS: Record<string, string> = {
    // Element Dasar (Baris 1)
    Slime: "#75D875", // Hijau terang
    "Juragan Slime": "#75D875",
    Robot: "#94A3B8", // Abu-abu besi
    "Cyber Batik": "#94A3B8",
    Api: "#FFA52D", // Oranye
    "Api Baskara": "#FFA52D",
    "Mecha Blaze": "#FFA52D",
    Air: "#60A5FA", // Biru air
    "Tirta Lurik": "#60A5FA",
    Akuatron: "#60A5FA",
    Hantu: "#A78BFA", // Ungu
    "Jurig Peci": "#A78BFA",
    "Agen Hantu": "#A78BFA",

    // Mahluk Alam (Baris 2)
    Golem: "#A8A29E", // Coklat batu / abu-abu
    "Batu Pendekar": "#A8A29E",
    Awan: "#93C5FD", // Biru langit
    "Mega Mendung": "#93C5FD",
    Jamur: "#FCA5A5", // Merah muda keorenan
    "Raden Jamur": "#FCA5A5",
    Alien: "#86EFAC", // Hijau neon alien
    "Alien Nyasar": "#86EFAC",
    Bulu: "#FDBA74", // Oranye krem
    "Bulu Dalang": "#FDBA74",

    // Mahluk Buas & Mitos (Baris 3)
    Naga: "#F87171", // Merah naga
    "Naga Pustaka": "#F87171",
    Griffin: "#E4A560", // Krem emas
    "Griffin Garuda": "#E4A560",
    Phoenix: "#F5D858", // Kuning emas
    Srikandi: "#F5D858",
    Yeti: "#BAE6FD", // Putih salju / biru muda
    "Yeti Petapa": "#BAE6FD",

    // Mahluk Legenda (Baris 4)
    Peri: "#F9A8D4", // Merah muda peri
    "Peri Jelita": "#F9A8D4",
    Unicorn: "#D8B4FE", // Lavender magis
    "Kuda Kencana": "#D8B4FE",
    Serigala: "#B45309", // Coklat tua serigala
    "Roger Malam": "#B45309",
    Vampir: "#E11D48", // Merah darah gelap
    "Raden Drakula": "#E11D48",

    // Mascot
    "Prof. Bubu": "#3D79F3", // Biru Khas Neuroclash
};

/**
 * Mengambil kode hex warna latar belakang dari sebuah karakter.
 * Mengembalikan fallback color slate-200 (#E2E8F0) bila karakter tidak ditemukan.
 *
 * @param characterName Nama karakter sesuai database/konfigurasi
 * @returns Kode warna (hex)
 */
export function getCharacterBgColor(characterName: string): string {
    // Gunakan pencarian case-insensitive atau default jika tidak ditemukan
    const found = Object.keys(CHARACTER_BG_COLORS).find(
        (key) =>
            key.trim().toLowerCase() === characterName.trim().toLowerCase(),
    );

    return found ? CHARACTER_BG_COLORS[found] : "#E2E8F0";
}

// =============================================================================
// CHARACTER PASSIVE SKILL SYSTEM
// =============================================================================

/**
 * Tipe skill pasif karakter.
 * - damage  : menambah damage ke lawan saat menjawab benar di 1v1
 * - defence : mengurangi damage yang diterima saat kena serangan / timeout
 * - heal    : menambah HP di awal setiap ronde (sebelum soal dijawab)
 */
export type SkillType = "damage" | "defence" | "heal";

/**
 * Mapping skin_name → tipe skill pasif.
 * Hanya karakter epic dan legend yang terdaftar di sini.
 * Karakter base/default tidak mendapat skill (return null di helper).
 */
export const CHARACTER_SKILL_MAP: Record<string, SkillType> = {
    // ⚔️ Damage — menambah damage ke lawan saat menjawab benar
    "Api Baskara": "damage",
    "Naga Pustaka": "damage",
    "Roger Malam": "damage",
    "Griffin Garuda": "damage",
    "Kuda Kencana": "damage",
    "Alien Nyasar": "damage",
    "Mecha Blaze": "damage", // legend

    // 🛡️ Defence — mengurangi damage yang diterima
    "Tirta Lurik": "defence",
    "Batu Pendekar": "defence",
    "Mega Mendung": "defence",
    "Yeti Petapa": "defence",
    "Juragan Slime": "defence",
    "Bulu Dalang": "defence",
    Akuatron: "defence", // legend

    // ❤️ Heal — menambah HP di awal setiap ronde
    "Jurig Peci": "heal",
    "Peri Jelita": "heal",
    "Raden Jamur": "heal",
    "Cyber Batik": "heal",
    "Raden Drakula": "heal",
    Srikandi: "heal",
    "Agen Hantu": "heal", // legend
};

/**
 * Nilai bonus skill per skin_level.
 * - damage  : flat bonus damage yang ditambahkan ke serangan ke lawan
 * - defence : flat pengurangan damage yang diterima
 * - heal    : flat HP yang dipulihkan di awal setiap ronde
 */
export const SKILL_VALUES: Record<SkillType, { epic: number; legend: number }> =
    {
        damage: { epic: 4, legend: 8 },
        defence: { epic: 4, legend: 8 },
        heal: { epic: 2, legend: 4 },
    };
