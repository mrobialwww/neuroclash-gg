"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
        <div className="scrollbar-hide scroll-smooth font-(family-name:--font-baloo-2) h-screen w-full overflow-y-auto overflow-x-hidden bg-[#0B0D14] text-white">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0B0D14]/90 px-6 py-6 backdrop-blur-xl md:px-14">
                <Link
                    href="/"
                    className="flex items-center gap-4 text-xl font-extrabold text-white no-underline"
                >
                    <Image
                        src="/common/logo_browser.svg"
                        alt="Neuroclash"
                        width={36}
                        height={36}
                    />
                    Neuroclash
                </Link>
                <div className="hidden gap-12 md:flex">
                    {["Fitur", "Cara Main", "Karakter", "Peringkat"].map(
                        (label) => (
                            <a
                                key={label}
                                href={`#${label
                                    .toLowerCase()
                                    .replace(/\s/g, "-")}`}
                                className="text-base font-medium text-white no-underline transition-colors hover:text-white"
                            >
                                {label}
                            </a>
                        ),
                    )}
                </div>
                <Link href="/dashboard">
                    <MainButton variant="green" size="sm">
                        Mulai Bermain
                    </MainButton>
                </Link>
            </nav>

            {/* HERO */}
            <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center -mt-10">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_68%)]" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative z-10 mb-4"
                >
                    <Image
                        src="/match/prof-bubu.webp"
                        alt="Prof. Bubu"
                        width={100}
                        height={100}
                        className="mx-auto h-auto w-[80px] rounded-full object-contain sm:w-[100px]"
                        priority
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                    className="relative z-10 mb-8 w-[280px] sm:w-[380px] md:w-[500px]"
                >
                    <Image
                        src="/common/Logo_Neuroclash.svg"
                        alt="Neuroclash"
                        width={600}
                        height={240}
                        className="h-auto w-full"
                        priority
                    />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                    className="relative z-10 mb-12 max-w-2xl text-lg leading-relaxed text-white/70 md:text-2xl"
                >
                    Arena pertempuran pengetahuan. Jawab soal, gunakan kekuatan,
                    kalahkan lawan, dan jadilah juara!
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                    className="relative z-10 flex flex-wrap justify-center gap-4"
                >
                    <Link href="/demo">
                        <MainButton
                            variant="green"
                            hasShadow
                            className="rounded-xl px-9 py-4 text-lg font-extrabold"
                        >
                            Coba Demo
                        </MainButton>
                    </Link>
                    <Link
                        href="/signin"
                        className="border-white/15 hover:bg-purple-500/8 flex h-12 items-center rounded-xl border bg-transparent px-9 py-4 text-lg font-extrabold text-white no-underline transition-colors hover:border-purple-500/50"
                    >
                        Gabung Arena
                    </Link>
                </motion.div>
            </section>

            {/* PENGETAHUAN ADALAH SENJATA */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative mx-auto max-w-[900px] px-6 py-20"
            >
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-14 text-center text-3xl font-extrabold text-white md:text-5xl"
                >
                    Pengetahuan adalah Senjata!
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                >
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
                                    <span className="text-xs text-white/70">
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        className="mt-6 flex flex-wrap justify-center gap-3"
                    >
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
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* BELAJAR TERASA SEPERTI MAIN GAME */}
            <section
                id="fitur"
                className="via-purple-500/3 scroll-mt-16 bg-linear-to-b from-transparent to-transparent px-6 py-20"
            >
                <SectionTitle
                    title={"Belajar Terasa\nSeperti Main Game"}
                    subtitle="Kenapa Neuroclash?"
                />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mx-auto grid max-w-[920px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {[
                        { icon: String.fromCodePoint(0x2694) + String.fromCodePoint(0xfe0f), bg: "bg-purple-500/15", title: "Battle Real-Time", desc: "Duel langsung dengan pemain lain dalam mode soal cepat dan tegang, siapa yang lebih pintar yang menang." },
                        { icon: String.fromCodePoint(0x2728), bg: "bg-green-500/15", title: "6 Kekuatan Spesial", desc: "Gunakan Kitab Pengetahuan, Serangan Tajam, Ramuan Penyembuh, Perisai Kokoh, Piala Kejayaan, dan Kantong Harta." },
                        { icon: String.fromCodePoint(0x1f4e4), bg: "bg-cyan-500/15", title: "Upload Materi Sendiri", desc: "Buat soal dari PDF atau template. AI kami akan otomatis mengubahnya jadi pertanyaan, siap untuk dimainkan." },
                        { icon: String.fromCodePoint(0x1f3df) + String.fromCodePoint(0xfe0f), bg: "bg-amber-500/15", title: "Arena Publik & Privat", desc: "Masuk arena terbuka untuk bertemu siapapun, atau buat arena privat khusus teman dan kelasmu." },
                        { icon: String.fromCodePoint(0x1f9ec), bg: "bg-pink-500/15", title: "Koleksi Karakter", desc: "Pilih jagoanmu, masing-masing punya skin unik dan skill pasif yang mengubah strategi pertandingan." },
                        { icon: String.fromCodePoint(0x1f4ca), bg: "bg-red-500/15", title: "Statistik Mendalam", desc: "Pantau akurasi, win-rate, history pertandingan, dan mata pelajaran terkuatmu." },
                    ].map((card, idx) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
                            className="rounded-2xl border border-purple-500/20 bg-[#0f1124] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50"
                        >
                            <div className={`${card.bg} mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl`}>
                                {card.icon}
                            </div>
                            <h3 className="mb-2 text-base font-extrabold">
                                {card.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-white/70">
                                {card.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* SISTEM LOOP PERTANDINGAN */}
            <motion.section
                id="cara-main"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="scroll-mt-16 relative mx-auto max-w-[1040px] px-6 py-20"
            >
                <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(90,50,180,0.13)_0%,transparent_68%)]" />
                <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                    Cara Main
                </p>
                <h2 className="mb-6 text-center text-3xl font-extrabold leading-tight text-white md:text-6xl">
                    Sistem Loop Pertandingan
                </h2>
                <p className="mx-auto mb-14 max-w-[560px] text-center text-base leading-relaxed text-white/70">
                    Setiap pertandingan berjalan dalam siklus — Prof Bubu kasih
                    bocoran, kamu battle, StarBox kasih reward, terus berulang
                    sampai soal habis.
                </p>

                {/* Loop pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="mb-5 flex justify-center"
                >
                    <span className="bg-purple-500/18 border-purple-500/45 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
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
                </motion.div>

                {/* Node row: Arena → Prof Bubu → Battle → StarBox */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative z-10 flex items-center justify-center"
                >
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
                            <span className="mt-0.5 block text-xs uppercase tracking-widest text-white/40">
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
                            <span className="mt-0.5 block text-xs uppercase tracking-widest text-white/40">
                                Phase
                            </span>
                        </div>
                    </div>

                    {/* Connector dashed red + "5x Battle" badge */}
                    <div className="relative mx-0 flex flex-1 items-center justify-center">
                        <div className="border-red-500/55 h-0 w-full border-t-2 border-dashed" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="inline-flex items-center rounded-full border border-pink-500 bg-[#0d0e28]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-pink-300 shadow-[0_0_12px_rgba(233,30,140,0.35)]">
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
                            <span className="mt-0.5 block text-xs uppercase tracking-widest text-white/40">
                                Phase
                            </span>
                        </div>
                    </div>

                    {/* Connector gold + "5x Battle" badge */}
                    <div className="relative mx-0 flex flex-1 items-center justify-center">
                        <div className="bg-linear-to-r h-0.5 w-full from-amber-400/30 to-amber-400/60" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="inline-flex items-center rounded-full border border-amber-500 bg-[#0d0e28]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-300 shadow-[0_0_12px_rgba(255,193,7,0.35)]">
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
                            <span className="mt-0.5 block text-xs uppercase tracking-widest text-white/40">
                                Phase
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Desc cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-14 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div className="rounded-xl border border-white/5 bg-[#0d1028] p-5">
                        <p className="text-sm leading-relaxed text-white/70">
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
                        <p className="text-sm leading-relaxed text-white/70">
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
                        <p className="text-sm leading-relaxed text-white/70">
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
                        <p className="text-sm leading-relaxed text-white/70">
                            Muncul tiap kelipatan 10 ronde. Sistem{" "}
                            <strong className="font-bold text-white">
                                Algorithmic Fairness
                            </strong>
                            : pemain HP terendah pilih item duluan — mencegah
                            satu pemain mendominasi terus-menerus.
                        </p>
                    </div>
                </motion.div>

                {/* Bottom note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="bg-white/3 mt-4 rounded-xl border border-white/5 p-4 text-center text-sm leading-relaxed text-white/70"
                >
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
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-10 text-center"
                >
                    <Link href="/demo">
                        <MainButton
                            variant="green"
                            hasShadow
                            className="rounded-xl px-6 py-3 text-xs font-extrabold sm:px-8 sm:py-4 sm:text-base"
                        >
                            Coba Langsung di Sini — Tutorial & Simulasi
                            Pertandingan
                        </MainButton>
                    </Link>
                </motion.div>
            </motion.section>

            {/* STRATEGI MENENTUKAN */}
            <motion.section
                id="strategi"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative mx-auto max-w-[1100px] px-6 py-20 md:px-16"
            >
                <div className="pointer-events-none absolute left-[55%] top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(80,40,200,0.10)_0%,transparent_70%)]" />
                <div className="relative z-10 grid grid-cols-1 items-center gap-16 md:grid-cols-2">
                    {/* LEFT: 3x2 card grid */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {[
                            { src: "/ability-card/attack-card.webp", name: "Serangan Tajam", desc: "Tingkatkan serangan dasar +10 poin" },
                            { src: "/ability-card/shield-card.webp", name: "Perisai Kokoh", desc: "Dapatkan pertahanan 20 poin" },
                            { src: "/ability-card/heal-card.webp", name: "Ramuan Penyembuh", desc: "Pulihkan 20 poin HP seketika" },
                            { src: "/ability-card/material-card.webp", name: "Kitab Pengetahuan", desc: "Dapatkan materi untuk soal berikutnya" },
                            { src: "/ability-card/trophy-buff-card.webp", name: "Piala Kejayaan", desc: "Tambah jumlah trophy +5%" },
                            { src: "/ability-card/coin-buff-card.webp", name: "Kantong Harta", desc: "Tambah koin yang diperoleh +5%" },
                        ].map((card, idx) => (
                            <motion.div
                                key={card.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.08 + idx * 0.06 }}
                                className="hover:border-white/15 flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0e1130] p-4 transition-all hover:-translate-y-0.5"
                            >
                                <div className="aspect-412/212 relative mx-auto w-[85%]">
                                    <Image
                                        src={card.src}
                                        alt={card.name}
                                        fill
                                        className="object-contain drop-shadow-lg"
                                    />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.13em] text-white">
                                    {card.name}
                                </span>
                                <span className="text-xs leading-relaxed text-white/70">
                                    {card.desc}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* RIGHT: text */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                        className="flex flex-col"
                    >
                        <div className="mb-5 flex items-center gap-3.5">
                            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">
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

                        <p className="mb-7 text-base leading-relaxed text-white/70">
                            Neuroclash bukan cuma soal siapa yang paling pintar
                            tapi siapa yang paling cerdas dalam memanfaatkan
                            kekuatannya.
                        </p>

                        <ul className="flex flex-col gap-3.5">
                            <li className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                                <span className="mt-0.5 shrink-0 text-xs text-amber-500">
                                    {String.fromCodePoint(0x2726)}
                                </span>
                                Prof Bubu Phase: Jawab benar di awal untuk dapat
                                hint sebagai modal tempur.
                            </li>
                            <li className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                                <span className="mt-0.5 shrink-0 text-xs text-amber-500">
                                    {String.fromCodePoint(0x2726)}
                                </span>
                                StarBox Phase: Muncul tiap ronde, beri hak pilih
                                item prioritas bagi pemain dengan HP kritis
                                untuk comeback taktis.
                            </li>
                            <li className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                                <span className="mt-0.5 shrink-0 text-xs text-amber-500">
                                    {String.fromCodePoint(0x2726)}
                                </span>
                                Manajemen HP: Setiap kesalahan dalam Battle
                                Phase akan menguras HP-mu. Kelola item dengan
                                bijak.
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </motion.section>

            {/* PILIH JAGOANMU */}
            <motion.section
                id="karakter"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="scroll-mt-16 via-purple-500/4 bg-linear-to-b overflow-hidden from-transparent to-transparent px-6 py-20"
            >
                <SectionTitle
                    title={"Pilih Jagoanmu,\nTunjukkan Identitasmu"}
                    subtitle="Koleksi Karakter"
                />
                <CharCarousel />
            </motion.section>

            {/* SIAPA RAJA GALAKSI INI */}
            <motion.section
                id="peringkat"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="scroll-mt-16 mx-auto max-w-[1100px] px-6 py-20"
            >
                <div className="flex flex-col items-center gap-16 md:flex-row">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex-1"
                    >
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
                            Papan Peringkat
                        </p>
                        <h2 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-4xl">
                            Siapa Raja
                            <br />
                            Galaksi Ini?
                        </h2>
                        <p className="text-base leading-relaxed text-white/70">
                            Puncak trophy menanti, naik dari Bronze hingga
                            Stellar, dan buktikan kamu yang terbaik di antara
                            semua pemain.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                        className="flex-1 overflow-visible rounded-lg"
                    >
                        <Image
                            src="/landing-page/landingpage_image2.png"
                            alt="Leaderboard Neuroclash"
                            width={960}
                            height={720}
                            className="h-auto w-full rounded-lg"
                        />
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA FINAL */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative overflow-hidden px-6 py-24 text-center"
            >
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(124,58,237,0.14)_0%,transparent_68%)]" />
                <h2 className="relative z-10 mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
                    Takdir Ada di{" "}
                    <span className="text-amber-500">Tanganmu!</span>
                </h2>
                <p className="relative z-10 mx-auto mb-10 max-w-md text-base leading-relaxed text-white/70">
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
            </motion.section>

            {/* FOOTER */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-6 md:px-14"
            >
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
                        className="text-xs text-white/30 no-underline transition-colors hover:text-white/70"
                    >
                        Tentang
                    </a>
                    <a
                        href="#"
                        className="text-xs text-white/30 no-underline transition-colors hover:text-white/70"
                    >
                        Kebijakan Privasi
                    </a>
                    <a
                        href="#"
                        className="text-xs text-white/30 no-underline transition-colors hover:text-white/70"
                    >
                        Kontak
                    </a>
                </div>
            </motion.footer>
        </div>
    );
}
