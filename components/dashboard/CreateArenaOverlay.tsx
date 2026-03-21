"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────
type Materi = {
  id: string;
  title: string;
  icon_url?: string; // path ke image (opsional, fallback ke placeholder)
};

type CreateArenaModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    materiId: string | null;
    file: File | null;
    maxPlayers: number;
    jumlahSoal: number;
  }) => void;
  materiList?: Materi[];
};

// ── Dummy materi list (10 item agar scroll terlihat) ───────────────────────
const DEFAULT_MATERI: Materi[] = [
  { id: "1",  title: "Pemrograman Dasar" },
  { id: "2",  title: "Struktur Data" },
  { id: "3",  title: "Algoritma Sorting" },
  { id: "4",  title: "Basis Data" },
  { id: "5",  title: "Jaringan Komputer" },
  { id: "6",  title: "Sistem Operasi" },
  { id: "7",  title: "Kecerdasan Buatan" },
  { id: "8",  title: "Pemrograman Web" },
  { id: "9",  title: "Keamanan Siber" },
  { id: "10", title: "Machine Learning" },
];

const PLAYER_OPTIONS = [15, 20, 25, 30, 35, 40];
const SOAL_OPTIONS   = [15, 20, 25, 30, 35, 40];

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:      "#040619",
  stroke:  "#383347",
  surface: "#0d0f2b",
  card:    "#0d1033",
  accent:  "#2563eb",
  accentD: "#1d4ed8",
};

// ── Icons ──────────────────────────────────────────────────────────────────
function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-gray-500" stroke="currentColor" strokeWidth={1.5}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Materi Icon: lingkaran dengan Image (atau placeholder) ─────────────────
function MateriIcon({ icon_url, title }: { icon_url?: string; title: string }) {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2 border-white/20"
      style={{ width: 36, height: 36, backgroundColor: C.accentD }}
    >
      {icon_url ? (
        <Image
          src={icon_url}
          alt={title}
          fill
          sizes="36px"
          className="object-contain"
        />
      ) : (
        // Placeholder — ganti dengan <Image> saat icon_url tersedia
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CreateArenaModal({
  open,
  onClose,
  onSubmit,
  materiList = DEFAULT_MATERI,
}: CreateArenaModalProps) {
  const [selectedMateri, setSelectedMateri] = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [uploadedFile, setUploadedFile]     = useState<File | null>(null);
  const [isDragging, setIsDragging]         = useState(false);
  const [maxPlayers, setMaxPlayers]         = useState(15);
  const [jumlahSoal, setJumlahSoal]         = useState(40);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = materiList.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") { setUploadedFile(file); setSelectedMateri(null); }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setUploadedFile(file); setSelectedMateri(null); }
  }, []);

  const handleMateriClick = (id: string) => {
    setSelectedMateri((prev) => (prev === id ? null : id));
    setUploadedFile(null);
  };

  const handleSubmit = () => {
    onSubmit?.({ materiId: selectedMateri, file: uploadedFile, maxPlayers, jumlahSoal });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Card ── */}
      <div
        className="relative w-full max-w-md flex flex-col"
        style={{
          backgroundColor: C.bg,
          border: `1px solid ${C.stroke}`,
          borderRadius: 12,
          maxHeight: "92vh",
          overflow: "hidden",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white transition"
        >
          <XIcon />
        </button>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 pt-6 pb-3">

          {/* Title */}
          <div className="text-center mb-5 pr-6">
            <h2 className="text-white text-xl font-bold">Buat Arena Baru</h2>
            <p className="text-gray-500 text-sm mt-1">Buat room pertandingan kuis pengetahuan</p>
          </div>

          {/* Label */}
          <p className="text-white text-sm font-semibold mb-2">Pilih atau Upload Materi</p>

          {/* ── Search bar (terpisah, di luar section materi) ── */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 mb-2"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.stroke}`,
              borderRadius: 8,
            }}
          >
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi..."
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1"
            />
          </div>

          {/* ── Section materi (bordered, scrollable sendiri) ── */}
          <div
            style={{
              border: `1px solid ${C.stroke}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              className="grid grid-cols-3 gap-2 overflow-y-auto p-2"
              style={{ maxHeight: 210, backgroundColor: C.surface }}
            >
              {filtered.length === 0 ? (
                <div className="col-span-3 text-center text-gray-600 text-xs py-6">
                  Tidak ada materi ditemukan
                </div>
              ) : (
                filtered.map((m) => {
                  const isActive = selectedMateri === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleMateriClick(m.id)}
                      className="flex items-center gap-2 px-2 py-2.5 text-left transition-all"
                      style={{
                        backgroundColor: isActive ? C.accent : C.card,
                        border: `1px solid ${isActive ? C.accent : C.stroke}`,
                        borderRadius: 8,
                      }}
                    >
                      {/* ── Circular icon slot ── */}
                      <MateriIcon icon_url={m.icon_url} title={m.title} />

                      <span className="text-white text-xs font-medium leading-tight line-clamp-2">
                        {m.title}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Upload area ── */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
            style={{
              border: `2px dashed ${isDragging ? C.accent : uploadedFile ? "#22c55e" : C.stroke}`,
              backgroundColor: isDragging ? "rgba(37,99,235,0.07)" : "transparent",
              borderRadius: 8,
              padding: "20px 16px",
            }}
          >
            <UploadCloudIcon />
            <p className="text-gray-500 text-xs text-center">
              {uploadedFile
                ? <span className="text-green-400 font-medium">{uploadedFile.name}</span>
                : "Drag and drop file Anda di sini (PDF) atau klik untuk pilih"}
            </p>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </div>

          {/* ── Jumlah Pemain ── */}
          <div className="mt-5">
            <p className="text-white text-sm font-semibold mb-2">Jumlah Pemain Maksimal</p>
            <div className="grid grid-cols-6 gap-2">
              {PLAYER_OPTIONS.map((n) => {
                const isActive = maxPlayers === n;
                return (
                  <button
                    key={n}
                    onClick={() => setMaxPlayers(n)}
                    className="text-sm font-semibold transition-all"
                    style={{
                      aspectRatio: "2.5 / 1",
                      backgroundColor: isActive ? C.accent : "transparent",
                      border: `1px solid ${isActive ? C.accent : C.stroke}`,
                      borderRadius: 6,
                      color: isActive ? "white" : "#9ca3af",
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Jumlah Soal ── */}
          <div className="mt-4 mb-1">
            <p className="text-white text-sm font-semibold mb-2">Jumlah Soal</p>
            <div className="grid grid-cols-6 gap-2">
              {SOAL_OPTIONS.map((n) => {
                const isActive = jumlahSoal === n;
                return (
                  <button
                    key={n}
                    onClick={() => setJumlahSoal(n)}
                    className="text-sm font-semibold transition-all"
                    style={{
                      aspectRatio: "2.5 / 1",
                      backgroundColor: isActive ? C.accent : "transparent",
                      border: `1px solid ${isActive ? C.accent : C.stroke}`,
                      borderRadius: 6,
                      color: isActive ? "white" : "#9ca3af",
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="px-5 py-4" style={{ borderTop: `1px solid ${C.stroke}` }}>
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 text-white font-bold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-75"
            style={{ backgroundColor: C.accent, borderRadius: 8 }}
          >
            <span>🚀</span>
            Buat Arena Baru
          </button>
        </div>
      </div>
    </div>
  );
}