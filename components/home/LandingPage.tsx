"use client";

import Link from "next/link";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";

const FEATURES = [
  {
    emoji: "\uD83E\uDDE0",
    title: "AI-Powered Quiz",
    desc: "Generate soal otomatis dari PDF atau template dengan Gemini AI",
  },
  {
    emoji: "\u26A1",
    title: "Real-time Battle",
    desc: "Duel 1v1 real-time melawan pemain lain dengan sistem damage dan HP",
  },
  {
    emoji: "\u2B50",
    title: "StarBox Comeback",
    desc: "Mekanisme comeback setiap 5 ronde — HP terendah pilih power-up duluan",
  },
  {
    emoji: "\uD83C\uDFC6",
    title: "Ranking & Trophy",
    desc: "Naik peringkat dari Bronze ke Diamond dan kumpulkan skin eksklusif",
  },
];

const STEPS = [
  { num: "1", title: "Buat Room", desc: "Pilih kategori atau upload PDF untuk generate soal otomatis" },
  { num: "2", title: "Undang Teman", desc: "Bagikan kode room 6 digit — bisa 4 sampai 40 pemain" },
  { num: "3", title: "Battle!", desc: "Jawab cepat & akurat. Damage ditentukan oleh kecepatan dan kebenaran jawaban" },
  { num: "4", title: "Menang & Naik Rank", desc: "Kumpulkan trophy, koin, dan skin untuk mendominasi leaderboard" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#0B0D14] text-white overflow-x-hidden">
      {/* HERO */}
      <header className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3D79F3]/10 via-transparent to-[#0B0D14] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl text-center">
          <div className="w-[220px] sm:w-[300px] md:w-[400px]">
            <Image
              src="/common/Logo_Neuroclash.svg"
              alt="Neuroclash"
              width={500}
              height={200}
              className="w-full h-auto"
              priority
            />
          </div>

          <h1 className="text-white/80 text-lg md:text-2xl font-medium leading-relaxed max-w-xl">
            Platform Quiz Battle interaktif — gabungkan kecepatan, akurasi, dan strategi untuk jadi yang teratas
          </h1>

          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/demo">
              <MainButton variant="green" hasShadow className="px-8 py-4 text-lg font-bold rounded-xl">
                Coba Demo
              </MainButton>
            </Link>
            <Link href="/signin">
              <MainButton variant="white" className="px-8 py-4 text-lg font-bold rounded-xl">
                Masuk
              </MainButton>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 z-10 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/40">
            <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </header>

      {/* FEATURES */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-white text-2xl md:text-3xl font-extrabold text-center mb-12">
          Kenapa Neuroclash?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#1A1B23]/80 border border-white/10 rounded-2xl p-6 text-center space-y-3 hover:border-[#3D79F3]/40 transition-colors"
            >
              <p className="text-4xl">{f.emoji}</p>
              <h3 className="text-white font-extrabold text-base">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO PLAY */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <h2 className="text-white text-2xl md:text-3xl font-extrabold text-center mb-12">
          Cara Bermain
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#3D79F3] flex items-center justify-center font-extrabold text-lg shrink-0">
                {s.num}
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+30px)] w-[calc(100%-60px)] h-0.5 bg-gradient-to-r from-[#3D79F3]/60 to-transparent" />
              )}
              <h3 className="text-white font-extrabold text-base">{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-[#3D79F3]/20 to-[#22C55E]/20 border border-[#3D79F3]/30 rounded-3xl p-10 text-center space-y-6">
          <h2 className="text-white text-2xl md:text-3xl font-extrabold">
            Siap Bertarung?
          </h2>
          <p className="text-white/60 text-base max-w-md mx-auto">
            Bergabung dengan ribuan pemain dan buktikan siapa yang paling jago di arena quiz
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/demo">
              <MainButton variant="green" hasShadow className="px-8 py-3 text-base font-bold rounded-xl">
                Coba Demo Gratis
              </MainButton>
            </Link>
            <Link href="/signup">
              <MainButton variant="white" className="px-8 py-3 text-base font-bold rounded-xl">
                Daftar Sekarang
              </MainButton>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 py-8 border-t border-white/10 text-center">
        <p className="text-white/30 text-sm">
          &copy; {new Date().getFullYear()} Neuroclash.gg — All rights reserved.
        </p>
      </footer>
    </div>
  );
}
