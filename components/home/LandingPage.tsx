"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/common/MainButton";
import { getCharacterBgColor } from "@/lib/constants/characters";

const CHAR_IMAGES = [
  { name: "Slime", image: "/default/Slime.webp" },
  { name: "Api Baskara", image: "/epic/Api%20Baskara.webp" },
  { name: "Mecha Blaze", image: "/legend/Mecha%20Blaze.webp" },
  { name: "Griffin Garuda", image: "/epic/Griffin%20Garuda.webp" },
  { name: "Raden Drakula", image: "/epic/Raden%20Drakula.webp" },
  { name: "Srikandi", image: "/epic/Srikandi.webp" },
  { name: "Agen Hantu", image: "/legend/Agen%20Hantu.webp" },
  { name: "Raden Jamur", image: "/epic/Raden%20Jamur.webp" },
  { name: "Cyber Batik", image: "/epic/Cyber%20Batik.webp" },
  { name: "Naga Pusaka", image: "/epic/Naga%20Pusaka.webp" },
  { name: "Yeti Petapa", image: "/epic/Yeti%20Petapa.webp" },
  { name: "Roger Malam", image: "/epic/Roger%20Malam.webp" },
  { name: "Akuatron", image: "/legend/Akuatron.webp" },
  { name: "Kuda Kencana", image: "/epic/Kuda%20Kencana.webp" },
];

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-14">
      {subtitle && <p className="text-purple-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">{subtitle}</p>}
      <h2 className="text-white text-3xl md:text-5xl font-extrabold leading-tight whitespace-pre-line">{title}</h2>
    </div>
  );
}

function CharCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = 1;
    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth) setDir(-1);
      if (el.scrollLeft <= 0) setDir(1);
      el.scrollLeft += step * dir;
    }, 40);
    return () => clearInterval(interval);
  }, [dir]);

  const doubled = [...CHAR_IMAGES, ...CHAR_IMAGES, ...CHAR_IMAGES];

  return (
    <div ref={scrollRef} className="overflow-x-auto scrollbar-hide max-w-full">
      <div className="flex gap-5 w-max px-4 py-2">
        {doubled.map((c, i) => (
          <div
            key={i}
            className="bg-[#0f1124] border border-[#7c3aed]/20 rounded-2xl p-6 w-[140px] shrink-0 flex flex-col items-center gap-3 text-center hover:border-[#7c3aed]/50 transition-colors"
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/30 flex items-center justify-center overflow-hidden shrink-0 mx-auto"
              style={{ backgroundColor: getCharacterBgColor(c.name) }}
            >
              <Image src={c.image} alt={c.name} width={56} height={56} className="object-contain mt-1" />
            </div>
            <span className="font-extrabold text-[13px] leading-tight">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#0B0D14] text-white overflow-x-hidden font-[family-name:var(--font-baloo-2)]">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-14 py-3 border-b border-white/10 bg-[#0B0D14]/90 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white no-underline">
          <Image src="/common/logo_browser.svg" alt="Neuroclash" width={28} height={28} />
          Neuroclash
        </Link>
        <div className="hidden md:flex gap-8">
          {["Fitur", "Cara Main", "Karakter", "Peringkat"].map((label) => (
            <a key={label} href={`#${label.toLowerCase().replace(/\s/g, "-")}`} className="text-white/50 text-sm font-medium no-underline hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>
        <Link href="/signin">
          <MainButton variant="green" size="sm">Pilih Arena</MainButton>
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.18)_0%,transparent_68%)] pointer-events-none" />
        <div className="w-[200px] sm:w-[280px] md:w-[350px] mb-6 relative z-10">
          <Image src="/common/Logo_Neuroclash.svg" alt="Neuroclash" width={400} height={160} className="w-full h-auto" priority />
        </div>
        <p className="text-white/50 text-base md:text-lg max-w-md mb-10 leading-relaxed relative z-10">
          Arena pertempuran pengetahuan. Jawab soal, gunakan kekuatan, kalahkan lawan, dan jadilah juara!
        </p>
        <div className="flex gap-3 flex-wrap justify-center relative z-10">
          <Link href="/demo">
            <MainButton variant="green" hasShadow className="px-7 py-3.5 text-base font-extrabold rounded-xl">
              Coba Demo
            </MainButton>
          </Link>
          <Link href="/signin" className="px-7 py-3.5 rounded-xl font-extrabold text-base bg-transparent text-white border border-white/15 hover:border-purple-500/50 hover:bg-purple-500/8 transition-colors no-underline">
            Gabung Arena
          </Link>
        </div>
      </section>

      {/* PENGETAHUAN ADALAH SENJATA */}
      <section className="px-6 py-20 max-w-[900px] mx-auto relative">
        <h2 className="text-white text-3xl md:text-5xl font-extrabold text-center mb-14">
          Pengetahuan adalah Senjata!
        </h2>

        <div className="relative">
          <div className="absolute -inset-12 bg-[radial-gradient(ellipse,rgba(124,58,237,0.18)_0%,rgba(217,70,239,0.08)_45%,transparent_72%)] rounded-3xl pointer-events-none" />
          <div className="relative z-10 border border-purple-500/40 rounded-2xl overflow-hidden shadow-[0_36px_88px_rgba(0,0,0,0.65)]">
            <div className="bg-[#141628] px-4 py-2.5 flex items-center gap-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/5 rounded-md h-6 max-w-[300px] flex-1 flex items-center justify-center">
                  <span className="text-white/50 text-[11px]">neuroclash.app/arena</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <Image
                src="/landing-page/landingpage_image1.png"
                alt="Gameplay Neuroclash"
                width={1280}
                height={720}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            <span className="flex items-center gap-2 bg-[#0f1124] border border-purple-500/20 rounded-xl px-4 py-2 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_7px_rgba(168,85,247,0.5)]" /> Battle Real-Time
            </span>
            <span className="flex items-center gap-2 bg-[#0f1124] border border-purple-500/20 rounded-xl px-4 py-2 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_7px_rgba(236,72,153,0.5)]" /> 6 Kekuatan Spesial
            </span>
            <span className="flex items-center gap-2 bg-[#0f1124] border border-purple-500/20 rounded-xl px-4 py-2 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_7px_rgba(6,182,212,0.5)]" /> Arena Publik & Privat
            </span>
            <span className="flex items-center gap-2 bg-[#0f1124] border border-purple-500/20 rounded-xl px-4 py-2 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_7px_rgba(245,158,11,0.5)]" /> Statistik Mendalam
            </span>
          </div>
        </div>
      </section>

      {/* BELAJAR TERASA SEPERTI MAIN GAME */}
      <section id="fitur" className="px-6 py-20 bg-gradient-to-b from-transparent via-purple-500/3 to-transparent">
        <SectionTitle title={"Belajar Terasa\nSeperti Main Game"} subtitle="Kenapa Neuroclash?" />

        <div className="max-w-[920px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-[#0f1124] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl mb-4">{String.fromCodePoint(0x2694)}{String.fromCodePoint(0xFE0F)}</div>
            <h3 className="font-extrabold text-base mb-2">Battle Real-Time</h3>
            <p className="text-white/50 text-sm leading-relaxed">Duel langsung dengan pemain lain dalam mode soal cepat dan tegang, siapa yang lebih pintar yang menang.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-[#0f1124] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center text-xl mb-4">{String.fromCodePoint(0x2728)}</div>
            <h3 className="font-extrabold text-base mb-2">6 Kekuatan Spesial</h3>
            <p className="text-white/50 text-sm leading-relaxed">Gunakan Kitab Pengetahuan, Serangan Tajam, Ramuan Penyembuh, Perisai Kokoh, Piala Kejayaan, dan Kantong Harta.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-[#0f1124] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center text-xl mb-4">{String.fromCodePoint(0x1F4E4)}</div>
            <h3 className="font-extrabold text-base mb-2">Upload Materi Sendiri</h3>
            <p className="text-white/50 text-sm leading-relaxed">Buat soal dari PDF atau template. AI kami akan otomatis mengubahnya jadi pertanyaan, siap untuk dimainkan.</p>
          </div>
          {/* Card 4 */}
          <div className="bg-[#0f1124] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl mb-4">{String.fromCodePoint(0x1F3DF)}{String.fromCodePoint(0xFE0F)}</div>
            <h3 className="font-extrabold text-base mb-2">Arena Publik & Privat</h3>
            <p className="text-white/50 text-sm leading-relaxed">Masuk arena terbuka untuk bertemu siapapun, atau buat arena privat khusus teman dan kelasmu.</p>
          </div>
          {/* Card 5 */}
          <div className="bg-[#0f1124] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-pink-500/15 flex items-center justify-center text-xl mb-4">{String.fromCodePoint(0x1F9EC)}</div>
            <h3 className="font-extrabold text-base mb-2">Koleksi Karakter</h3>
            <p className="text-white/50 text-sm leading-relaxed">Pilih jagoanmu, masing-masing punya skin unik dan skill pasif yang mengubah strategi pertandingan.</p>
          </div>
          {/* Card 6 */}
          <div className="bg-[#0f1124] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center text-xl mb-4">{String.fromCodePoint(0x1F4CA)}</div>
            <h3 className="font-extrabold text-base mb-2">Statistik Mendalam</h3>
            <p className="text-white/50 text-sm leading-relaxed">Pantau akurasi, win-rate, history pertandingan, dan mata pelajaran terkuatmu.</p>
          </div>
        </div>
      </section>

      {/* SISTEM LOOP PERTANDINGAN */}
      <section id="cara-main" className="px-6 py-20 max-w-[1040px] mx-auto relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(90,50,180,0.13)_0%,transparent_68%)] pointer-events-none" />
        <p className="text-center text-white/50 text-[11px] font-bold uppercase tracking-[0.25em] mb-5">Cara Main</p>
        <h2 className="text-white text-3xl md:text-6xl font-extrabold text-center leading-tight mb-6">
          Sistem Loop Pertandingan
        </h2>
        <p className="text-white/50 text-base text-center max-w-[560px] mx-auto mb-14 leading-relaxed">
          Setiap pertandingan berjalan dalam siklus — Prof Bubu kasih bocoran, kamu battle, StarBox kasih reward, terus berulang sampai soal habis.
        </p>

        {/* Loop pill */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-2 bg-purple-500/18 border border-purple-500/45 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b59f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Loop Sampai Soal Habis
          </span>
        </div>

        {/* Node row: Arena → Prof Bubu → Battle → StarBox */}
        <div className="flex items-center justify-center relative z-10">
          {/* Arena */}
          <div className="flex flex-col items-center gap-3.5 shrink-0">
            <div className="w-24 h-24 rounded-full bg-[radial-gradient(circle,#2d1b6b_40%,#1a0f45)] border-2 border-purple-500/60 flex items-center justify-center text-[40px] relative">
              <div className="absolute -inset-1.5 rounded-full border border-white/5" />
              <Image src="/icons/neuroclash.svg" alt="Arena" width={44} height={44} className="object-contain brightness-125" />
            </div>
            <div className="text-center leading-tight">
              <span className="text-purple-300 text-xs font-bold uppercase tracking-[0.12em] block">Arena</span>
              <span className="text-white/40 text-[10px] uppercase tracking-[0.1em] block mt-0.5">Phase</span>
            </div>
          </div>

          {/* Connector */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-purple-500/20 mx-0 relative" />

          {/* Prof Bubu */}
          <div className="flex flex-col items-center gap-3.5 shrink-0">
            <div className="w-24 h-24 rounded-full bg-[radial-gradient(circle,#1a3a1a_40%,#0d1f0d)] border-2 border-green-500/60 flex items-center justify-center text-[40px] relative">
              <div className="absolute -inset-1.5 rounded-full border border-white/5" />
              <Image src="/match/prof-bubu.webp" alt="Prof Bubu" width={52} height={52} className="object-contain rounded-full" />
            </div>
            <div className="text-center leading-tight">
              <span className="text-green-400 text-xs font-bold uppercase tracking-[0.12em] block">Prof Bubu</span>
              <span className="text-white/40 text-[10px] uppercase tracking-[0.1em] block mt-0.5">Phase</span>
            </div>
          </div>

          {/* Connector dashed red + "5x Battle" badge */}
          <div className="flex-1 mx-0 relative flex items-center justify-center">
            <div className="w-full h-0 border-t-2 border-dashed border-red-500/55" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#0d0e28]/90 border border-pink-500 font-bold text-[10px] uppercase tracking-[0.12em] text-pink-300 shadow-[0_0_12px_rgba(233,30,140,0.35)]">
                5x Battle
              </span>
            </div>
          </div>

          {/* Battle */}
          <div className="flex flex-col items-center gap-3.5 shrink-0">
            <div className="w-24 h-24 rounded-full bg-[radial-gradient(circle,#3a1515_40%,#1f0d0d)] border-2 border-red-500/60 flex items-center justify-center text-[40px] relative">
              <div className="absolute -inset-1.5 rounded-full border border-white/5" />
              <Image src="/icons/battle.svg" alt="Battle" width={40} height={40} className="object-contain brightness-125 invert" />
            </div>
            <div className="text-center leading-tight">
              <span className="text-red-400 text-xs font-bold uppercase tracking-[0.12em] block">Battle</span>
              <span className="text-white/40 text-[10px] uppercase tracking-[0.1em] block mt-0.5">Phase</span>
            </div>
          </div>

          {/* Connector gold + "5x Battle" badge */}
          <div className="flex-1 mx-0 relative flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-amber-400/30 to-amber-400/60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#0d0e28]/90 border border-amber-500 font-bold text-[10px] uppercase tracking-[0.12em] text-amber-300 shadow-[0_0_12px_rgba(255,193,7,0.35)]">
                5x Battle
              </span>
            </div>
          </div>

          {/* StarBox */}
          <div className="flex flex-col items-center gap-3.5 shrink-0">
            <div className="w-24 h-24 rounded-full bg-[radial-gradient(circle,#3a2e00_40%,#1f1900)] border-2 border-amber-500/60 flex items-center justify-center text-[40px] relative">
              <div className="absolute -inset-1.5 rounded-full border border-white/5" />
              <Image src="/icons/treasure.svg" alt="StarBox" width={36} height={36} className="object-contain brightness-125 invert" />
            </div>
            <div className="text-center leading-tight">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.12em] block">StarBox</span>
              <span className="text-white/40 text-[10px] uppercase tracking-[0.1em] block mt-0.5">Phase</span>
            </div>
          </div>
        </div>

        {/* Desc cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-14">
          <div className="bg-[#0d1028] border border-white/5 rounded-xl p-5">
            <p className="text-sm text-white/60 leading-relaxed">
              Minimal <strong className="text-white font-bold">4 pemain</strong> join room publik/privat. Semua masuk dengan modal <strong className="text-white font-bold">100 Base HP</strong>. Host pilih materi sebelum mulai.
            </p>
          </div>
          <div className="bg-[#0d1028] border border-white/5 rounded-xl p-5">
            <p className="text-sm text-white/60 leading-relaxed">
              Dalam <strong className="text-white font-bold">15 detik</strong>, pemain yang menjawab soal Prof Bubu dapat <strong className="text-white font-bold">Drop Item Materi</strong> (bocoran/hint) untuk ronde berikutnya. Salah? Tidak ada penalti HP.
            </p>
          </div>
          <div className="bg-[#0d1028] border border-white/5 rounded-xl p-5">
            <p className="text-sm text-white/60 leading-relaxed">
              <strong className="text-white font-bold">20 detik per soal.</strong> Siapa lambat & salah, HP terkuras! Damage dinamis berdasar progres ronde. <strong className="text-white font-bold">10 detik cooldown</strong> antar ronde untuk bernapas dan atur strategi.
            </p>
          </div>
          <div className="bg-[#0d1028] border border-white/5 rounded-xl p-5">
            <p className="text-sm text-white/60 leading-relaxed">
              Muncul tiap kelipatan 10 ronde. Sistem <strong className="text-white font-bold">Algorithmic Fairness</strong>: pemain HP terendah pilih item duluan — mencegah satu pemain mendominasi terus-menerus.
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center text-sm text-white/60 leading-relaxed">
          Permainan berakhir saat <strong className="text-white font-bold">tersisa 1 orang</strong> (Last Man Standing) atau <strong className="text-white font-bold">soal habis</strong> — peringkat ditentukan dari sisa HP tertinggi. Peringkat dikalkulasi ke dalam <strong className="text-white font-bold">sistem Trophy</strong> (Tier Bronze – Stellar) layaknya game E-Sports.
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link href="/demo">
            <MainButton variant="green" hasShadow className="px-8 py-4 text-base font-extrabold rounded-xl">
              Coba Langsung di Sini — Tutorial & Simulasi Pertandingan
            </MainButton>
          </Link>
        </div>
      </section>

      {/* STRATEGI MENENTUKAN */}
      <section id="strategi" className="px-6 md:px-16 py-20 max-w-[1100px] mx-auto relative">
        <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(80,40,200,0.10)_0%,transparent_70%)] pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">

          {/* LEFT: 3x2 card grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0e1130] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-white/15 hover:-translate-y-0.5 transition-all">
              <div className="w-[85%] aspect-[412/212] relative mx-auto">
                <Image src="/ability-card/attack-card.webp" alt="Serangan Tajam" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-[0.13em] text-white">Serangan Tajam</span>
              <span className="text-xs text-white/50 leading-relaxed">Tingkatkan serangan dasar +10 poin</span>
            </div>

            <div className="bg-[#0e1130] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-white/15 hover:-translate-y-0.5 transition-all">
              <div className="w-[85%] aspect-[412/212] relative mx-auto">
                <Image src="/ability-card/shield-card.webp" alt="Perisai Kokoh" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-[0.13em] text-white">Perisai Kokoh</span>
              <span className="text-xs text-white/50 leading-relaxed">Dapatkan pertahanan 20 poin</span>
            </div>

            <div className="bg-[#0e1130] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-white/15 hover:-translate-y-0.5 transition-all">
              <div className="w-[85%] aspect-[412/212] relative mx-auto">
                <Image src="/ability-card/heal-card.webp" alt="Ramuan Penyembuh" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-[0.13em] text-white">Ramuan Penyembuh</span>
              <span className="text-xs text-white/50 leading-relaxed">Pulihkan 20 poin HP seketika</span>
            </div>

            <div className="bg-[#0e1130] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-white/15 hover:-translate-y-0.5 transition-all">
              <div className="w-[85%] aspect-[412/212] relative mx-auto">
                <Image src="/ability-card/material-card.webp" alt="Kitab Pengetahuan" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-[0.13em] text-white">Kitab Pengetahuan</span>
              <span className="text-xs text-white/50 leading-relaxed">Dapatkan materi untuk soal berikutnya</span>
            </div>

            <div className="bg-[#0e1130] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-white/15 hover:-translate-y-0.5 transition-all">
              <div className="w-[85%] aspect-[412/212] relative mx-auto">
                <Image src="/ability-card/trophy-buff-card.webp" alt="Piala Kejayaan" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-[0.13em] text-white">Piala Kejayaan</span>
              <span className="text-xs text-white/50 leading-relaxed">Tambah jumlah trophy +5%</span>
            </div>

            <div className="bg-[#0e1130] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-white/15 hover:-translate-y-0.5 transition-all">
              <div className="w-[85%] aspect-[412/212] relative mx-auto">
                <Image src="/ability-card/coin-buff-card.webp" alt="Kantong Harta" fill className="object-contain drop-shadow-lg" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-[0.13em] text-white">Kantong Harta</span>
              <span className="text-xs text-white/50 leading-relaxed">Tambah koin yang diperoleh +5%</span>
            </div>
          </div>

          {/* RIGHT: text */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3.5 mb-5">
              <span className="font-bold text-[10px] uppercase tracking-[0.22em] text-cyan-400 whitespace-nowrap">Sistem Kekuatan</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-400/10 rounded" />
            </div>

            <h2 className="text-white text-3xl md:text-5xl font-extrabold leading-tight mb-5">
              Strategi<br />Menentukan<br />Siapa yang Menang
            </h2>

            <p className="text-white/50 text-base leading-relaxed mb-7">
              Neuroclash bukan cuma soal siapa yang paling pintar tapi siapa yang paling cerdas dalam memanfaatkan kekuatannya.
            </p>

            <ul className="flex flex-col gap-3.5">
              <li className="flex items-start gap-3 text-sm text-white/50 leading-relaxed">
                <span className="text-amber-500 text-xs mt-0.5 shrink-0">{String.fromCodePoint(0x2726)}</span>
                Prof Bubu Phase: Jawab benar di awal untuk dapat hint sebagai modal tempur.
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50 leading-relaxed">
                <span className="text-amber-500 text-xs mt-0.5 shrink-0">{String.fromCodePoint(0x2726)}</span>
                StarBox Phase: Muncul tiap ronde, beri hak pilih item prioritas bagi pemain dengan HP kritis untuk comeback taktis.
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50 leading-relaxed">
                <span className="text-amber-500 text-xs mt-0.5 shrink-0">{String.fromCodePoint(0x2726)}</span>
                Manajemen HP: Setiap kesalahan dalam Battle Phase akan menguras HP-mu. Kelola item dengan bijak.
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* PILIH JAGOANMU */}
      <section id="karakter" className="px-6 py-20 bg-gradient-to-b from-transparent via-purple-500/4 to-transparent overflow-hidden">
        <SectionTitle title={"Pilih Jagoanmu,\nTunjukkan Identitasmu"} subtitle="Koleksi Karakter" />
        <CharCarousel />
      </section>

      {/* SIAPA RAJA GALAKSI INI */}
      <section id="peringkat" className="px-6 py-20 max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <p className="text-purple-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Papan Peringkat</p>
            <h2 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mb-6">
              Siapa Raja<br />Galaksi Ini?
            </h2>
            <p className="text-white/50 text-base leading-relaxed">
              Puncak trophy menanti, naik dari Bronze hingga Stellar, dan buktikan kamu yang terbaik di antara semua pemain.
            </p>
          </div>
          <div className="flex-1 rounded-lg overflow-visible">
            <Image
              src="/landing-page/landingpage_image2.png"
              alt="Leaderboard Neuroclash"
              width={960}
              height={720}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.14)_0%,transparent_68%)] pointer-events-none" />
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 relative z-10">
          Takdir Ada di <span className="text-amber-500">Tanganmu!</span>
        </h2>
        <p className="text-white/50 text-base max-w-md mx-auto mb-10 leading-relaxed relative z-10">
          Ribuan arena menunggumu. Pilih pengetahuan, kuasai musuhmu, dan jadilah legenda di Neuroclash.
        </p>
        <Link href="/signin" className="relative z-10 inline-block">
          <MainButton variant="green" hasShadow className="px-9 py-4 text-lg font-extrabold rounded-xl">
            Mulai Sekarang &mdash; Gratis
          </MainButton>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 md:px-14 py-6 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-base text-white no-underline">
          <Image src="/common/logo_browser.svg" alt="Neuroclash" width={20} height={20} />
          Neuroclash
        </Link>
        <span className="text-white/30 text-xs">&copy; {new Date().getFullYear()} Neuroclash.gg</span>
        <div className="flex gap-6">
          <a href="#" className="text-white/30 text-xs no-underline hover:text-white/60 transition-colors">Tentang</a>
          <a href="#" className="text-white/30 text-xs no-underline hover:text-white/60 transition-colors">Kebijakan Privasi</a>
          <a href="#" className="text-white/30 text-xs no-underline hover:text-white/60 transition-colors">Kontak</a>
        </div>
      </footer>
    </div>
  );
}
