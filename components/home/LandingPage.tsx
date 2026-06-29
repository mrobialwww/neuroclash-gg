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

function SectionTitle({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="mx-auto mb-14 max-w-2xl text-center">
            {subtitle && (
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
                    {subtitle}
                </p>
            )}
            <h2 className="whitespace-pre-line text-3xl font-extrabold leading-tight text-white md:text-5xl">
                {title}
            </h2>
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
        <div
            ref={scrollRef}
            className="scrollbar-hide max-w-full overflow-x-auto"
        >
            <div className="flex w-max gap-5 px-4 py-2">
                {doubled.map((c, i) => (
                    <div
                        key={i}
                        className="flex w-[140px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-[#7c3aed]/20 bg-[#0f1124] p-6 text-center transition-colors hover:border-[#7c3aed]/50"
                    >
                        <div
                            className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 md:h-20 md:w-20"
                            style={{
                                backgroundColor: getCharacterBgColor(c.name),
                            }}
                        >
                            <Image
                                src={c.image}
                                alt={c.name}
                                width={56}
                                height={56}
                                className="mt-1 object-contain"
                            />
                        </div>
                        <span className="text-[13px] font-extrabold leading-tight">
                            {c.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LandingPage() {
    return (
        <div className="scrollbar-hide font-(family-name:--font-baloo-2) h-screen w-full overflow-y-auto overflow-x-hidden bg-[#0B0D14] text-white">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0B0D14]/90 px-6 py-3 backdrop-blur-xl md:px-14">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-extrabold text-white no-underline"
                >
                    <Image
                        src="/common/logo_browser.svg"
                        alt="Neuroclash"
                        width={28}
                        height={28}
                    />
                    Neuroclash
                </Link>
                <div className="hidden gap-8 md:flex">
                    {["Fitur", "Cara Main", "Karakter", "Peringkat"].map(
                        (label) => (
                            <a
                                key={label}
                                href={`#${label
                                    .toLowerCase()
                                    .replace(/\s/g, "-")}`}
                                className="text-sm font-medium text-white/50 no-underline transition-colors hover:text-white"
                            >
                                {label}
                            </a>
                        ),
                    )}
                </div>
                <Link href="/signin">
                    <MainButton variant="green" size="sm">
                        Pilih Arena
                    </MainButton>
                </Link>
            </nav>

            {/* HERO */}
            <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center md:py-32">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(124,58,237,0.18)_0%,transparent_68%)]" />
                <div className="relative z-10 mb-6 w-[200px] sm:w-[280px] md:w-[350px]">
                    <Image
                        src="/common/Logo_Neuroclash.svg"
                        alt="Neuroclash"
                        width={400}
                        height={160}
                        className="h-auto w-full"
                        priority
                    />
                </div>
                <p className="relative z-10 mb-10 max-w-md text-base leading-relaxed text-white/50 md:text-lg">
                    Arena pertempuran pengetahuan. Jawab soal, gunakan kekuatan,
                    kalahkan lawan, dan jadilah juara!
                </p>
                <div className="relative z-10 flex flex-wrap justify-center gap-3">
                    <Link href="/demo">
                        <MainButton
                            variant="green"
                            hasShadow
                            className="rounded-xl px-7 py-3.5 text-base font-extrabold"
                        >
                            Coba Demo
                        </MainButton>
                    </Link>
                    <Link
                        href="/signin"
                        className="border-white/15 hover:bg-purple-500/8 rounded-xl border bg-transparent px-7 py-3.5 text-base font-extrabold text-white no-underline transition-colors hover:border-purple-500/50"
                    >
                        Gabung Arena
                    </Link>
                </div>
            </section>

            {/* PENGETAHUAN ADALAH SENJATA */}
            <section className="relative mx-auto max-w-[900px] px-6 py-20">
                <h2 className="mb-14 text-center text-3xl font-extrabold text-white md:text-5xl">
                    Pengetahuan adalah Senjata!
                </h2>

                <div className="relative">
                    <div className="pointer-events-none absolute -inset-12 rounded-3xl bg-[radial-gradient(ellipse,rgba(124,58,237,0.18)_0%,rgba(217,70,239,0.08)_45%,transparent_72%)]" />
                    <div className="relative z-10 overflow-hidden rounded-2xl border border-purple-500/40 shadow-[0_36px_88px_rgba(0,0,0,0.65)]">
                        <div className="flex items-center gap-3 border-b border-white/10 bg-[#141628] px-4 py-2.5">
                            <div className="flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                            </div>
                            <div className="flex flex-1 justify-center">
                                <div className="flex h-6 max-w-[300px] flex-1 items-center justify-center rounded-md bg-white/5">
                                    <span className="text-[11px] text-white/50">
                                        neuroclash.app/arena
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-2xl">
                            <Image
                                src="/landing-page/landingpage_image1.png"
                                alt="Gameplay Neuroclash"
                                width={1280}
                                height={720}
                                className="h-auto w-full"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <span className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#0f1124] px-4 py-2 text-sm font-semibold">
                            <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_7px_rgba(168,85,247,0.5)]" />{" "}
                            Battle Real-Time
                        </span>
                        <span className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#0f1124] px-4 py-2 text-sm font-semibold">
                            <span className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_7px_rgba(236,72,153,0.5)]" />{" "}
                            6 Kekuatan Spesial
                        </span>
                        <span className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#0f1124] px-4 py-2 text-sm font-semibold">
                            <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_7px_rgba(6,182,212,0.5)]" />{" "}
                            Arena Publik & Privat
                        </span>
                        <span className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-[#0f1124] px-4 py-2 text-sm font-semibold">
                            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_7px_rgba(245,158,11,0.5)]" />{" "}
                            Statistik Mendalam
                        </span>
                    </div>
                </div>
            </section>

            {/* BELAJAR TERASA SEPERTI MAIN GAME */}
            <section
                id="fitur"
                className="via-purple-500/3 bg-linear-to-b from-transparent to-transparent px-6 py-20"
            >
                <SectionTitle
                    title={"Belajar Terasa\nSeperti Main Game"}
                    subtitle="Kenapa Neuroclash?"
                />

                <div className="mx-auto grid max-w-[920px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1 */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0f1124] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                        <div className="bg-purple-500/15 mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                            {String.fromCodePoint(0x2694)}
                            {String.fromCodePoint(0xfe0f)}
                        </div>
                        <h3 className="mb-2 text-base font-extrabold">
                            Battle Real-Time
                        </h3>
                        <p className="text-sm leading-relaxed text-white/50">
                            Duel langsung dengan pemain lain dalam mode soal
                            cepat dan tegang, siapa yang lebih pintar yang
                            menang.
                        </p>
                    </div>
                    {/* Card 2 */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0f1124] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                        <div className="bg-green-500/15 mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                            {String.fromCodePoint(0x2728)}
                        </div>
                        <h3 className="mb-2 text-base font-extrabold">
                            6 Kekuatan Spesial
                        </h3>
                        <p className="text-sm leading-relaxed text-white/50">
                            Gunakan Kitab Pengetahuan, Serangan Tajam, Ramuan
                            Penyembuh, Perisai Kokoh, Piala Kejayaan, dan
                            Kantong Harta.
                        </p>
                    </div>
                    {/* Card 3 */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0f1124] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                        <div className="bg-cyan-500/15 mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                            {String.fromCodePoint(0x1f4e4)}
                        </div>
                        <h3 className="mb-2 text-base font-extrabold">
                            Upload Materi Sendiri
                        </h3>
                        <p className="text-sm leading-relaxed text-white/50">
                            Buat soal dari PDF atau template. AI kami akan
                            otomatis mengubahnya jadi pertanyaan, siap untuk
                            dimainkan.
                        </p>
                    </div>
                    {/* Card 4 */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0f1124] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                        <div className="bg-amber-500/15 mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                            {String.fromCodePoint(0x1f3df)}
                            {String.fromCodePoint(0xfe0f)}
                        </div>
                        <h3 className="mb-2 text-base font-extrabold">
                            Arena Publik & Privat
                        </h3>
                        <p className="text-sm leading-relaxed text-white/50">
                            Masuk arena terbuka untuk bertemu siapapun, atau
                            buat arena privat khusus teman dan kelasmu.
                        </p>
                    </div>
                    {/* Card 5 */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0f1124] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                        <div className="bg-pink-500/15 mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                            {String.fromCodePoint(0x1f9ec)}
                        </div>
                        <h3 className="mb-2 text-base font-extrabold">
                            Koleksi Karakter
                        </h3>
                        <p className="text-sm leading-relaxed text-white/50">
                            Pilih jagoanmu, masing-masing punya skin unik dan
                            skill pasif yang mengubah strategi pertandingan.
                        </p>
                    </div>
                    {/* Card 6 */}
                    <div className="rounded-2xl border border-purple-500/20 bg-[#0f1124] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                        <div className="bg-red-500/15 mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                            {String.fromCodePoint(0x1f4ca)}
                        </div>
                        <h3 className="mb-2 text-base font-extrabold">
                            Statistik Mendalam
                        </h3>
                        <p className="text-sm leading-relaxed text-white/50">
                            Pantau akurasi, win-rate, history pertandingan, dan
                            mata pelajaran terkuatmu.
                        </p>
                    </div>
                </div>
            </section>

            {/* SISTEM LOOP PERTANDINGAN */}
            <section
                id="cara-main"
                className="relative mx-auto max-w-[1040px] px-6 py-20"
            >
                <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(90,50,180,0.13)_0%,transparent_68%)]" />
                <p className="mb-5 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">
                    Cara Main
                </p>
                <h2 className="mb-6 text-center text-3xl font-extrabold leading-tight text-white md:text-6xl">
                    Sistem Loop Pertandingan
                </h2>
                <p className="mx-auto mb-14 max-w-[560px] text-center text-base leading-relaxed text-white/50">
                    Setiap pertandingan berjalan dalam siklus — Prof Bubu kasih
                    bocoran, kamu battle, StarBox kasih reward, terus berulang
                    sampai soal habis.
                </p>

                {/* Loop pill */}
                <div className="mb-5 flex justify-center">
                    <span className="bg-purple-500/18 border-purple-500/45 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9b59f5"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Loop Sampai Soal Habis
                    </span>
                </div>

                {/* Node row: Arena → Prof Bubu → Battle → StarBox */}
                <div className="relative z-10 flex items-center justify-center">
                    {/* Arena */}
                    <div className="flex shrink-0 flex-col items-center gap-3.5">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-purple-500/60 bg-[radial-gradient(circle,#2d1b6b_40%,#1a0f45)] text-[40px]">
                            <div className="absolute -inset-1.5 rounded-full border border-white/5" />
                            <Image
                                src="/icons/neuroclash.svg"
                                alt="Arena"
                                width={44}
                                height={44}
                                className="object-contain brightness-125"
                            />
                        </div>
                        <div className="text-center leading-tight">
                            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-purple-300">
                                Arena
                            </span>
                            <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/40">
                                Phase
                            </span>
                        </div>
                    </div>

                    {/* Connector */}
                    <div className="bg-linear-to-r relative mx-0 h-0.5 flex-1 from-purple-500/50 to-purple-500/20" />

                    {/* Prof Bubu */}
                    <div className="flex shrink-0 flex-col items-center gap-3.5">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-green-500/60 bg-[radial-gradient(circle,#1a3a1a_40%,#0d1f0d)] text-[40px]">
                            <div className="absolute -inset-1.5 rounded-full border border-white/5" />
                            <Image
                                src="/match/prof-bubu.webp"
                                alt="Prof Bubu"
                                width={52}
                                height={52}
                                className="rounded-full object-contain"
                            />
                        </div>
                        <div className="text-center leading-tight">
                            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-green-400">
                                Prof Bubu
                            </span>
                            <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/40">
                                Phase
                            </span>
                        </div>
                    </div>

                    {/* Connector dashed red + "5x Battle" badge */}
                    <div className="relative mx-0 flex flex-1 items-center justify-center">
                        <div className="border-red-500/55 h-0 w-full border-t-2 border-dashed" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="inline-flex items-center rounded-full border border-pink-500 bg-[#0d0e28]/90 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-pink-300 shadow-[0_0_12px_rgba(233,30,140,0.35)]">
                                5x Battle
                            </span>
                        </div>
                    </div>

                    {/* Battle */}
                    <div className="flex shrink-0 flex-col items-center gap-3.5">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-500/60 bg-[radial-gradient(circle,#3a1515_40%,#1f0d0d)] text-[40px]">
                            <div className="absolute -inset-1.5 rounded-full border border-white/5" />
                            <Image
                                src="/icons/battle.svg"
                                alt="Battle"
                                width={40}
                                height={40}
                                className="object-contain brightness-125 invert"
                            />
                        </div>
                        <div className="text-center leading-tight">
                            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-red-400">
                                Battle
                            </span>
                            <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/40">
                                Phase
                            </span>
                        </div>
                    </div>

                    {/* Connector gold + "5x Battle" badge */}
                    <div className="relative mx-0 flex flex-1 items-center justify-center">
                        <div className="bg-linear-to-r h-0.5 w-full from-amber-400/30 to-amber-400/60" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="inline-flex items-center rounded-full border border-amber-500 bg-[#0d0e28]/90 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300 shadow-[0_0_12px_rgba(255,193,7,0.35)]">
                                5x Battle
                            </span>
                        </div>
                    </div>

                    {/* StarBox */}
                    <div className="flex shrink-0 flex-col items-center gap-3.5">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500/60 bg-[radial-gradient(circle,#3a2e00_40%,#1f1900)] text-[40px]">
                            <div className="absolute -inset-1.5 rounded-full border border-white/5" />
                            <Image
                                src="/icons/treasure.svg"
                                alt="StarBox"
                                width={36}
                                height={36}
                                className="object-contain brightness-125 invert"
                            />
                        </div>
                        <div className="text-center leading-tight">
                            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-amber-400">
                                StarBox
                            </span>
                            <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/40">
                                Phase
                            </span>
                        </div>
                    </div>
                </div>

                {/* Desc cards */}
                <div className="mt-14 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-white/5 bg-[#0d1028] p-5">
                        <p className="text-sm leading-relaxed text-white/60">
                            Minimal{" "}
                            <strong className="font-bold text-white">
                                4 pemain
                            </strong>{" "}
                            join room publik/privat. Semua masuk dengan modal{" "}
                            <strong className="font-bold text-white">
                                100 Base HP
                            </strong>
                            . Host pilih materi sebelum mulai.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#0d1028] p-5">
                        <p className="text-sm leading-relaxed text-white/60">
                            Dalam{" "}
                            <strong className="font-bold text-white">
                                15 detik
                            </strong>
                            , pemain yang menjawab soal Prof Bubu dapat{" "}
                            <strong className="font-bold text-white">
                                Drop Item Materi
                            </strong>{" "}
                            (bocoran/hint) untuk ronde berikutnya. Salah? Tidak
                            ada penalti HP.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#0d1028] p-5">
                        <p className="text-sm leading-relaxed text-white/60">
                            <strong className="font-bold text-white">
                                20 detik per soal.
                            </strong>{" "}
                            Siapa lambat & salah, HP terkuras! Damage dinamis
                            berdasar progres ronde.{" "}
                            <strong className="font-bold text-white">
                                10 detik cooldown
                            </strong>{" "}
                            antar ronde untuk bernapas dan atur strategi.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#0d1028] p-5">
                        <p className="text-sm leading-relaxed text-white/60">
                            Muncul tiap kelipatan 10 ronde. Sistem{" "}
                            <strong className="font-bold text-white">
                                Algorithmic Fairness
                            </strong>
                            : pemain HP terendah pilih item duluan — mencegah
                            satu pemain mendominasi terus-menerus.
                        </p>
                    </div>
                </div>

                {/* Bottom note */}
                <div className="bg-white/3 mt-4 rounded-xl border border-white/5 p-4 text-center text-sm leading-relaxed text-white/60">
                    Permainan berakhir saat{" "}
                    <strong className="font-bold text-white">
                        tersisa 1 orang
                    </strong>{" "}
                    (Last Man Standing) atau{" "}
                    <strong className="font-bold text-white">soal habis</strong>{" "}
                    — peringkat ditentukan dari sisa HP tertinggi. Peringkat
                    dikalkulasi ke dalam{" "}
                    <strong className="font-bold text-white">
                        sistem Trophy
                    </strong>{" "}
                    (Tier Bronze – Stellar) layaknya game E-Sports.
                </div>

                {/* CTA */}
                <div className="mt-10 text-center">
                    <Link href="/demo">
                        <MainButton
                            variant="green"
                            hasShadow
                            className="rounded-xl px-8 py-4 text-base font-extrabold"
                        >
                            Coba Langsung di Sini — Tutorial & Simulasi
                            Pertandingan
                        </MainButton>
                    </Link>
                </div>
            </section>

            {/* STRATEGI MENENTUKAN */}
            <section
                id="strategi"
                className="relative mx-auto max-w-[1100px] px-6 py-20 md:px-16"
            >
                <div className="pointer-events-none absolute left-[55%] top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(80,40,200,0.10)_0%,transparent_70%)]" />
                <div className="relative z-10 grid grid-cols-1 items-center gap-16 md:grid-cols-2">
                    {/* LEFT: 3x2 card grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="hover:border-white/15 flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0e1130] p-4 transition-all hover:-translate-y-0.5">
                            <div className="aspect-412/212 relative mx-auto w-[85%]">
                                <Image
                                    src="/ability-card/attack-card.webp"
                                    alt="Serangan Tajam"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-white">
                                Serangan Tajam
                            </span>
                            <span className="text-xs leading-relaxed text-white/50">
                                Tingkatkan serangan dasar +10 poin
                            </span>
                        </div>

                        <div className="hover:border-white/15 flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0e1130] p-4 transition-all hover:-translate-y-0.5">
                            <div className="aspect-412/212 relative mx-auto w-[85%]">
                                <Image
                                    src="/ability-card/shield-card.webp"
                                    alt="Perisai Kokoh"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-white">
                                Perisai Kokoh
                            </span>
                            <span className="text-xs leading-relaxed text-white/50">
                                Dapatkan pertahanan 20 poin
                            </span>
                        </div>

                        <div className="hover:border-white/15 flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0e1130] p-4 transition-all hover:-translate-y-0.5">
                            <div className="aspect-412/212 relative mx-auto w-[85%]">
                                <Image
                                    src="/ability-card/heal-card.webp"
                                    alt="Ramuan Penyembuh"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-white">
                                Ramuan Penyembuh
                            </span>
                            <span className="text-xs leading-relaxed text-white/50">
                                Pulihkan 20 poin HP seketika
                            </span>
                        </div>

                        <div className="hover:border-white/15 flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0e1130] p-4 transition-all hover:-translate-y-0.5">
                            <div className="aspect-412/212 relative mx-auto w-[85%]">
                                <Image
                                    src="/ability-card/material-card.webp"
                                    alt="Kitab Pengetahuan"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-white">
                                Kitab Pengetahuan
                            </span>
                            <span className="text-xs leading-relaxed text-white/50">
                                Dapatkan materi untuk soal berikutnya
                            </span>
                        </div>

                        <div className="hover:border-white/15 flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0e1130] p-4 transition-all hover:-translate-y-0.5">
                            <div className="aspect-412/212 relative mx-auto w-[85%]">
                                <Image
                                    src="/ability-card/trophy-buff-card.webp"
                                    alt="Piala Kejayaan"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-white">
                                Piala Kejayaan
                            </span>
                            <span className="text-xs leading-relaxed text-white/50">
                                Tambah jumlah trophy +5%
                            </span>
                        </div>

                        <div className="hover:border-white/15 flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0e1130] p-4 transition-all hover:-translate-y-0.5">
                            <div className="aspect-412/212 relative mx-auto w-[85%]">
                                <Image
                                    src="/ability-card/coin-buff-card.webp"
                                    alt="Kantong Harta"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-white">
                                Kantong Harta
                            </span>
                            <span className="text-xs leading-relaxed text-white/50">
                                Tambah koin yang diperoleh +5%
                            </span>
                        </div>
                    </div>

                    {/* RIGHT: text */}
                    <div className="flex flex-col">
                        <div className="mb-5 flex items-center gap-3.5">
                            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                                Sistem Kekuatan
                            </span>
                            <div className="bg-linear-to-r h-0.5 flex-1 rounded from-cyan-400 to-cyan-400/10" />
                        </div>

                        <h2 className="mb-5 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                            Strategi
                            <br />
                            Menentukan
                            <br />
                            Siapa yang Menang
                        </h2>

                        <p className="mb-7 text-base leading-relaxed text-white/50">
                            Neuroclash bukan cuma soal siapa yang paling pintar
                            tapi siapa yang paling cerdas dalam memanfaatkan
                            kekuatannya.
                        </p>

                        <ul className="flex flex-col gap-3.5">
                            <li className="flex items-start gap-3 text-sm leading-relaxed text-white/50">
                                <span className="mt-0.5 shrink-0 text-xs text-amber-500">
                                    {String.fromCodePoint(0x2726)}
                                </span>
                                Prof Bubu Phase: Jawab benar di awal untuk dapat
                                hint sebagai modal tempur.
                            </li>
                            <li className="flex items-start gap-3 text-sm leading-relaxed text-white/50">
                                <span className="mt-0.5 shrink-0 text-xs text-amber-500">
                                    {String.fromCodePoint(0x2726)}
                                </span>
                                StarBox Phase: Muncul tiap ronde, beri hak pilih
                                item prioritas bagi pemain dengan HP kritis
                                untuk comeback taktis.
                            </li>
                            <li className="flex items-start gap-3 text-sm leading-relaxed text-white/50">
                                <span className="mt-0.5 shrink-0 text-xs text-amber-500">
                                    {String.fromCodePoint(0x2726)}
                                </span>
                                Manajemen HP: Setiap kesalahan dalam Battle
                                Phase akan menguras HP-mu. Kelola item dengan
                                bijak.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* PILIH JAGOANMU */}
            <section
                id="karakter"
                className="via-purple-500/4 bg-linear-to-b overflow-hidden from-transparent to-transparent px-6 py-20"
            >
                <SectionTitle
                    title={"Pilih Jagoanmu,\nTunjukkan Identitasmu"}
                    subtitle="Koleksi Karakter"
                />
                <CharCarousel />
            </section>

            {/* SIAPA RAJA GALAKSI INI */}
            <section
                id="peringkat"
                className="mx-auto max-w-[1100px] px-6 py-20"
            >
                <div className="flex flex-col items-center gap-16 md:flex-row">
                    <div className="flex-1">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
                            Papan Peringkat
                        </p>
                        <h2 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-4xl">
                            Siapa Raja
                            <br />
                            Galaksi Ini?
                        </h2>
                        <p className="text-base leading-relaxed text-white/50">
                            Puncak trophy menanti, naik dari Bronze hingga
                            Stellar, dan buktikan kamu yang terbaik di antara
                            semua pemain.
                        </p>
                    </div>
                    <div className="flex-1 overflow-visible rounded-lg">
                        <Image
                            src="/landing-page/landingpage_image2.png"
                            alt="Leaderboard Neuroclash"
                            width={960}
                            height={720}
                            className="h-auto w-full rounded-lg"
                        />
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="relative overflow-hidden px-6 py-24 text-center">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(124,58,237,0.14)_0%,transparent_68%)]" />
                <h2 className="relative z-10 mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
                    Takdir Ada di{" "}
                    <span className="text-amber-500">Tanganmu!</span>
                </h2>
                <p className="relative z-10 mx-auto mb-10 max-w-md text-base leading-relaxed text-white/50">
                    Ribuan arena menunggumu. Pilih pengetahuan, kuasai musuhmu,
                    dan jadilah legenda di Neuroclash.
                </p>
                <Link href="/signin" className="relative z-10 inline-block">
                    <MainButton
                        variant="green"
                        hasShadow
                        className="rounded-xl px-9 py-4 text-lg font-extrabold"
                    >
                        Mulai Sekarang &mdash; Gratis
                    </MainButton>
                </Link>
            </section>

            {/* FOOTER */}
            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-6 md:px-14">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-base font-extrabold text-white no-underline"
                >
                    <Image
                        src="/common/logo_browser.svg"
                        alt="Neuroclash"
                        width={20}
                        height={20}
                    />
                    Neuroclash
                </Link>
                <span className="text-xs text-white/30">
                    &copy; {new Date().getFullYear()} Neuroclash.gg
                </span>
                <div className="flex gap-6">
                    <a
                        href="#"
                        className="text-xs text-white/30 no-underline transition-colors hover:text-white/60"
                    >
                        Tentang
                    </a>
                    <a
                        href="#"
                        className="text-xs text-white/30 no-underline transition-colors hover:text-white/60"
                    >
                        Kebijakan Privasi
                    </a>
                    <a
                        href="#"
                        className="text-xs text-white/30 no-underline transition-colors hover:text-white/60"
                    >
                        Kontak
                    </a>
                </div>
            </footer>
        </div>
    );
}
