export interface DemoQuestion {
  id: string;
  order: number;
  text: string;
  options: DemoOption[];
}

export interface DemoOption {
  id: string;
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface DemoBot {
  id: string;
  name: string;
  character: string;
  image: string;
  accuracy: number;
  speedRangeMs: [number, number];
}

export interface DemoRoundScript {
  round: number;
  title: string;
  botScripts: {
    botId: string;
    isCorrect: boolean;
    delayMs: number;
  }[];
  tutorialMessage: string;
  isProfBubu?: boolean;
  gameOverMessage?: string;
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "demo-q1",
    order: 1,
    text: "Berapa hasil dari 10 + 5 \u00d7 2?",
    options: [
      { id: "demo-q1-a", key: "A", text: "30", isCorrect: false },
      { id: "demo-q1-b", key: "B", text: "20", isCorrect: true },
      { id: "demo-q1-c", key: "C", text: "25", isCorrect: false },
      { id: "demo-q1-d", key: "D", text: "15", isCorrect: false },
    ],
  },
  {
    id: "demo-q2",
    order: 2,
    text: "Apa ibu kota negara Indonesia?",
    options: [
      { id: "demo-q2-a", key: "A", text: "Bandung", isCorrect: false },
      { id: "demo-q2-b", key: "B", text: "Surabaya", isCorrect: false },
      { id: "demo-q2-c", key: "C", text: "Jakarta", isCorrect: true },
      { id: "demo-q2-d", key: "D", text: "Medan", isCorrect: false },
    ],
  },
  {
    id: "demo-q3",
    order: 3,
    text: "Planet terbesar di tata surya kita adalah?",
    options: [
      { id: "demo-q3-a", key: "A", text: "Saturnus", isCorrect: false },
      { id: "demo-q3-b", key: "B", text: "Jupiter", isCorrect: true },
      { id: "demo-q3-c", key: "C", text: "Neptunus", isCorrect: false },
      { id: "demo-q3-d", key: "D", text: "Mars", isCorrect: false },
    ],
  },
  {
    id: "demo-q4",
    order: 4,
    text: "Apa rumus kimia dari air?",
    options: [
      { id: "demo-q4-a", key: "A", text: "CO\u2082", isCorrect: false },
      { id: "demo-q4-b", key: "B", text: "NaCl", isCorrect: false },
      { id: "demo-q4-c", key: "C", text: "H\u2082O", isCorrect: true },
      { id: "demo-q4-d", key: "D", text: "O\u2082", isCorrect: false },
    ],
  },
  {
    id: "demo-q5",
    order: 5,
    text: "Kapan Proklamasi Kemerdekaan Indonesia terjadi?",
    options: [
      { id: "demo-q5-a", key: "A", text: "17 Agustus 1945", isCorrect: true },
      { id: "demo-q5-b", key: "B", text: "28 Oktober 1928", isCorrect: false },
      { id: "demo-q5-c", key: "C", text: "10 November 1945", isCorrect: false },
      { id: "demo-q5-d", key: "D", text: "20 Mei 1908", isCorrect: false },
    ],
  },
];

export const DEMO_PROF_BUBU = {
  id: "prof-bubu",
  name: "Prof. Bubu",
  character: "Prof Bubu",
  image: "/match/prof-bubu.webp",
};

export const DEMO_BOTS: DemoBot[] = [
  {
    id: "bot-budi",
    name: "Budi_Gamer",
    character: "Mecha Blaze",
    image: "/legend/Mecha%20Blaze.webp",
    accuracy: 0.7,
    speedRangeMs: [2000, 5000],
  },
  {
    id: "bot-yanto",
    name: "Yanto_Keren",
    character: "Api Baskara",
    image: "/epic/Api%20Baskara.webp",
    accuracy: 0.5,
    speedRangeMs: [3000, 7000],
  },
  {
    id: "bot-rina",
    name: "Rina_Pintar",
    character: "Griffin",
    image: "/default/Griffin.webp",
    accuracy: 0.3,
    speedRangeMs: [4000, 8000],
  },
];

export const DEMO_USER = {
  id: "demo-user",
  name: "Kamu",
  character: "Slime",
  image: "/default/Slime.webp",
};

export const DEMO_ROUND_SCRIPTS: DemoRoundScript[] = [
  {
    round: 1,
    title: "Ronde 1 - Latihan Solo",
    isProfBubu: true,
    botScripts: [],
    tutorialMessage:
      "Ronde 1 adalah latihan solo melawan Prof. Bubu.\n\nTidak ada damage di ronde ini. Kamu hanya perlu fokus memahami mekanisme menjawab soal:\n\n• Baca pertanyaan dengan teliti\n• Klik opsi A, B, C, atau D dalam batas waktu 30 detik\n• Timer berjalan dari 30 ke 0 - jangan sampai habis!\n\nProf. Bubu hanya sparring partner. Dia tidak akan menjawab.",
  },
  {
    round: 2,
    title: "Ronde 2 - Battle Dimulai!",
    botScripts: [
      { botId: "bot-budi", isCorrect: false, delayMs: 2800 },
      { botId: "bot-yanto", isCorrect: true, delayMs: 4100 },
      { botId: "bot-rina", isCorrect: false, delayMs: 5500 },
    ],
    tutorialMessage:
      "\u26a1 Sekarang battle sungguhan dimulai!\n\nPemain BERPASANGAN 1 vs 1 setiap ronde. Kamu dipasangkan dengan Budi_Gamer. Siapa yang menjawab benar dan tercepat = pemenang di pasangan ini.\n\nAturan damage:\n\n• Kamu benar + tercepat \u2192 kamu tidak kena damage\n• Kamu benar tapi lawan lebih cepat \u2192 kamu kena damage\n• Kamu salah \u2192 kamu kena damage\n\nDamage bertambah seiring ronde. Di ronde ini damage = 20.",
  },
  {
    round: 3,
    title: "Ronde 3 - Lawan Berganti!",
    botScripts: [
      { botId: "bot-budi", isCorrect: false, delayMs: 3500 },
      { botId: "bot-yanto", isCorrect: false, delayMs: 5200 },
      { botId: "bot-rina", isCorrect: false, delayMs: 6300 },
    ],
    tutorialMessage:
      "Pasanganmu berganti! Sekarang kamu 1 vs 1 melawan Yanto_Keren - pemain yang cukup jago!\n\nDi game sungguhan, kamu dipasangkan dengan pemain BERBEDA setiap ronde. Pasangan dipilih dari pemain lain yang masih hidup.\n\nSemua pemain lain salah di ronde ini (damage = 25). Pastikan kamu menjawab benar agar HP-mu tetap 100%.",
  },
  {
    round: 4,
    title: "Ronde 4 - Menjelang StarBox",
    botScripts: [
      { botId: "bot-budi", isCorrect: false, delayMs: 3800 },
      { botId: "bot-yanto", isCorrect: false, delayMs: 5100 },
      { botId: "bot-rina", isCorrect: false, delayMs: 6700 },
    ],
    tutorialMessage:
      "Pasanganmu sekarang Rina_Pintar - 1 vs 1!\n\nSetelah ronde ini, STARBOX akan muncul. StarBox adalah mekanisme comeback: pemain dengan HP TERENDAH mendapat giliran memilih power-up terlebih dahulu.\n\nDamage ronde ini = 30. HP pemain lain makin kritis...\n\nJawab dengan benar dan bersiaplah untuk StarBox!",
  },
  {
    round: 5,
    title: "Ronde 5 - Final!",
    botScripts: [
      { botId: "bot-budi", isCorrect: false, delayMs: 3200 },
      { botId: "bot-yanto", isCorrect: false, delayMs: 4900 },
      { botId: "bot-rina", isCorrect: false, delayMs: 5800 },
    ],
    tutorialMessage:
      "RONDE TERAKHIR!\n\nItem dari StarBox sudah tersedia di panel \"Materi & Kekuatan\" di kiri atas arena. KLIK item tersebut untuk menggunakannya - item tidak otomatis aktif!\n\n• Heal: klik untuk pulihkan 20 HP\n• Attack: klik untuk +10 damage di ronde ini\n• Shield: klik untuk blok 50% damage di ronde ini\n• Material: klik untuk melihat contekan\n\nDamage ronde final = 35. Semua pemain lain menjawab SALAH - HP mereka hanya tersisa 25. Jika kamu menjawab benar, mereka semua GUGUR!\n\nBuktikan kamu pemenangnya! \ud83c\udfc6",
    gameOverMessage: "Semua pemain lain gugur! Kamu pemenangnya! \ud83c\udfc6",
  },
];

export const TUTORIAL_MESSAGES = {
  intro: {
    title: "Selamat Datang di Mode Tutorial!",
    subtitle: "Pelajari cara bermain Neuroclash dalam 5 ronde",
    items: [
      "Lobby - Tempat menunggu pemain lain bergabung (4-40 orang)",
      "Quiz Battle - Jawab soal dengan cepat dan akurat. Lawan berganti setiap ronde",
      "StarBox - Mekanisme comeback: HP terendah pilih power-up duluan",
      "Hanya Host yang bisa memulai pertandingan",
    ],
    buttonLabel: "Mulai Tutorial",
  },
  lobby:
    "Ini adalah Lobby - ruang tunggu sebelum pertandingan dimulai.\n\n• Game bisa dimainkan 4-40 orang\n• Semua pemain berkumpul di sini sebelum mulai\n• Hanya Host (kamu) yang bisa menekan tombol \"Mulai Pertandingan\"\n• Di mode tutorial ini, ada 3 pemain lain yang akan menjadi lawanmu\n\nKlik \"Mulai Pertandingan\" untuk masuk ke arena!",
  starbox:
      "\ud83c\udf1f STARBOX - Mekanisme Comeback!\n\nSetiap beberapa ronde, StarBox muncul. Player dengan HP TERENDAH memilih power-up terlebih dahulu - memberi kesempatan bagi yang tertinggal untuk comeback.\n\nPower-up yang tersedia:\n\n\ud83d\udcd6 KITAB PENGETAHUAN - Mendapat contekan materi untuk soal berikutnya\n\u2694\ufe0f SERANGAN TAJAM - +10 damage di ronde berikutnya\n\ud83e\uddea RAMUAN PENYEMBUH - Pulihkan 20 HP secara instan\n\ud83d\udee1\ufe0f PERISAI KOKOH - Blokir 50% damage di ronde berikutnya\n\ud83c\udfc6 PIALA KEJAYAAN - +5% trophy di akhir permainan\n\ud83d\udcb0 KANTONG HARTA - +5% koin di akhir permainan\n\nItem yang kamu pilih akan muncul di panel \"Materi & Kekuatan\" di kiri atas arena pada ronde 5. Kamu harus KLIK item tersebut untuk menggunakannya!\n\nPilih salah satu dengan bijak! Pemain lain juga akan memilih.",
  finished: {
    title: "Tutorial Selesai!",
    message: "Kamu telah mengalahkan semua pemain lain dan menjadi juara!",
    rankLabel: "Peringkat",
    statsLabel: "HP Tersisa",
    stat1: "Ronde Dimenangkan",
    stat2: "Item StarBox",
    stat3: "Trophy Diperoleh",
    stat4: "Koin Diperoleh",
    button1: "Main Game Sungguhan",
    button2: "Kembali ke Dashboard",
  },
};

export const DEMO_ABILITIES = [
  {
    id: "1",
    name: "KITAB PENGETAHUAN",
    description: "Mendapatkan contekan materi untuk soal berikutnya",
    stock: 2,
    image: "/ability-card/material-card.webp",
    emptyImage: "/ability-card/material-card-empty.webp",
  },
  {
    id: "2",
    name: "SERANGAN TAJAM",
    description: "Damage +10 di ronde berikutnya",
    stock: 1,
    image: "/ability-card/attack-card.webp",
    emptyImage: "/ability-card/attack-card-empty.webp",
  },
  {
    id: "3",
    name: "RAMUAN PENYEMBUH",
    description: "Pulihkan 20 HP secara instan",
    stock: 2,
    image: "/ability-card/heal-card.webp",
    emptyImage: "/ability-card/heal-card-empty.webp",
  },
  {
    id: "4",
    name: "PERISAI KOKOH",
    description: "Blokir 50% damage di ronde berikutnya",
    stock: 2,
    image: "/ability-card/shield-card.webp",
    emptyImage: "/ability-card/shield-card-empty.webp",
  },
  {
    id: "5",
    name: "PIALA KEJAYAAN",
    description: "+5% trophy di akhir permainan",
    stock: 2,
    image: "/ability-card/trophy-buff-card.webp",
    emptyImage: "/ability-card/trophy-buff-card-empty.webp",
  },
  {
    id: "6",
    name: "KANTONG HARTA",
    description: "+5% koin di akhir permainan",
    stock: 2,
    image: "/ability-card/coin-buff-card.webp",
    emptyImage: "/ability-card/coin-buff-card-empty.webp",
  },
];

export const DEMO_TOTAL_ROUNDS = 5;
export const DEMO_SECONDS_PER_ROUND = 30;
export const DEMO_STARBOX_TRIGGER_ROUND = 4;

export function calculateDemoDamage(round: number): number {
  return Math.floor(10 + (round / DEMO_TOTAL_ROUNDS) * 25);
}
