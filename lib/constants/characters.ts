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
  "Naga Pusaka": "#F87171",
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
    (key) => key.trim().toLowerCase() === characterName.trim().toLowerCase()
  );

  return found ? CHARACTER_BG_COLORS[found] : "#E2E8F0";
}
