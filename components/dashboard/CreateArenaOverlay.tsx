import React, { useState, useRef, useCallback } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { CategoryType, Difficulty } from "@/types/enums";

// ── Types ──────────────────────────────────────────────────────────────────
type CreateArenaModalProps = {
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
  loadingText?: string;
  errorMsg?: string | null;
  onSubmit?: (data: {
    materiId: string | null;
    file: File | null;
    maxPlayers: number;
    jumlahSoal: number;
    difficulty: Difficulty;
    room_visibility: "public" | "private";
    title: string;
  }) => void;
};

// ── Constants ─────────────────────────────────────────────────────────────
const CATEGORIES: { id: CategoryType; title: string }[] = [
  { id: "bahasaindonesia", title: "Bahasa Indonesia" },
  { id: "bahasainggris", title: "Bahasa Inggris" },
  { id: "biologi", title: "Biologi" },
  { id: "pancasila", title: "Pancasila" },
  { id: "pemrograman", title: "Pemrograman" },
  { id: "sejarah", title: "Sejarah" },
];

const PLAYER_OPTIONS = [15, 20, 25, 30, 35, 40];
const SOAL_OPTIONS = [15, 20, 25, 30, 35, 40];
const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: "Mudah", value: "mudah" },
  { label: "Sedang", value: "sedang" },
  { label: "Sulit", value: "sulit" },
];

const VISIBILITY_OPTIONS: { label: string; value: "public" | "private" }[] = [
  { label: "Publik", value: "public" },
  { label: "Privat", value: "private" },
];

// ── Icons ──────────────────────────────────────────────────────────────────
function UploadCloudIcon() {
  return (
    <NextImage
      src="/icons/upload.svg"
      alt="Upload Icon"
      width={48}
      height={48}
      className="w-10 h-10 md:w-12 md:h-12 opacity-80"
    />
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Materi Icon Component ─────────────────────────────────────────────────
function MateriIcon({ id, title }: { id: CategoryType; title: string }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = `https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/${id}2.webp`;
  const fallbackUrl = "/quiz-category/default.webp";

  return (
    <div className="relative shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden">
      <NextImage
        src={imgError ? fallbackUrl : imageUrl}
        alt={title}
        fill
        sizes="44px"
        className="object-contain"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CreateArenaModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  loadingText,
  errorMsg = null,
}: CreateArenaModalProps) {
  const [selectedMateri, setSelectedMateri] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [jumlahSoal, setJumlahSoal] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [roomVisibility, setRoomVisibility] = useState<"public" | "private" | null>(null);
  const [title, setTitle] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = CATEGORIES.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setSelectedMateri(null);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedMateri(null);
    }
  }, []);

  const handleMateriClick = (id: string) => {
    setSelectedMateri((prev) => (prev === id ? null : id));
    setUploadedFile(null);
  };

  let warningMessage = "";
  if (!title.trim()) warningMessage = "Isi Judul Kuis";
  else if (!selectedMateri && !uploadedFile) warningMessage = "Pilih Materi atau Upload Dokumen";
  else if (!maxPlayers) warningMessage = "Pilih Jumlah Maksimal Pemain";
  else if (!jumlahSoal) warningMessage = "Pilih Jumlah Soal";
  else if (!difficulty) warningMessage = "Pilih Tingkat Kesulitan";
  else if (!roomVisibility) warningMessage = "Pilih Visibilitas Room";

  const isFormComplete = warningMessage === "";

  const handleSubmit = () => {
    if (!isFormComplete) return;

    onSubmit?.({
      materiId: selectedMateri,
      file: uploadedFile,
      maxPlayers: maxPlayers!,
      jumlahSoal: jumlahSoal!,
      difficulty: difficulty!,
      room_visibility: roomVisibility!,
      title
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Card ── */}
      <div className="relative w-full max-w-xl flex flex-col bg-[#040619] border border-[#383347] rounded-2xl max-h-[92vh] overflow-hidden shadow-2xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <XIcon />
        </button>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-6 md:px-8 pt-8 pb-4 scrollbar-minimal">

          {/* Title Section */}
          <div className="text-center mb-6 md:mb-8 pr-6">
            <h2 className="text-white text-2xl font-bold">Buat Arena Baru</h2>
            <p className="text-white/80 text-sm mt-1.5 leading-relaxed">Buat room kuis seru dengan materi yang menantang</p>
          </div>

          {/* Judul Kuis Input */}
          <div className="mb-5 md:mb-6">
            <p className="text-white text-sm font-semibold mb-3">Judul Kuis</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul quiz..."
              className="w-full bg-[#0d0f2b] border border-[#383347] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-white/40"
            />
          </div>

          {/* Materi Section Label */}
          <p className="text-white text-sm font-semibold mb-3">Pilih atau Upload Materi</p>

          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-[#0d0f2b] border border-[#383347] rounded-lg group focus-within:border-blue-500 transition-colors">
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi sesuai keinginanmu..."
              className="bg-transparent text-white text-sm placeholder-white/60 outline-none flex-1 font-medium"
            />
          </div>

          {/* Materials Grid Box */}
          <div className="border border-[#383347] rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-2 gap-2 overflow-y-auto p-3 max-h-[200px] bg-[#0d0f2b] scrollbar-minimal">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center text-white/60 text-sm py-10 font-medium">
                  Oops! Tidak ada materi ditemukan
                </div>) : (
                filtered.map((m) => {
                  const isActive = selectedMateri === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleMateriClick(m.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 text-left transition-all border rounded-lg group cursor-pointer",
                        isActive
                          ? "bg-blue-600 border-blue-600 shadow-lg scale-[0.98]"
                          : "bg-[#0d1033] border-[#383347] hover:border-gray-500"
                      )}
                    >
                      <MateriIcon id={m.id as CategoryType} title={m.title} />
                      <span className="text-white text-xs md:text-[13px] font-semibold leading-snug line-clamp-2">
                        {m.title}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Upload Dropzone Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-3 cursor-pointer transition-all border-2 border-dashed rounded-lg p-4 md:p-6 group",
              isDragging ? "border-blue-500 bg-blue-500/10" : "border-[#383347] hover:border-gray-500",
              uploadedFile && "bg-green-500/5"
            )}
          >
            <UploadCloudIcon />
            <div className="text-center">
              <p className="text-white/80 text-xs md:text-sm font-medium">
                {uploadedFile
                  ? <span className="text-green-400 font-bold block mb-1">{uploadedFile.name}</span>
                  : "Drag & drop PDF materi kamu di sini"}
              </p>
              {!uploadedFile && <p className="text-white/60 text-[11px] mt-1  tracking-wide">Atau klik untuk memilih file dari perangkat</p>}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Max Players Configuration */}
          <div className="mt-6 md:mt-8">
            <p className="text-white text-sm font-semibold mb-3">Jumlah Pemain Maksimal</p>
            <div className="grid grid-cols-6 gap-2.5">
              {PLAYER_OPTIONS.map((n) => {
                const isActive = maxPlayers === n;
                return (
                  <button
                    key={n}
                    onClick={() => setMaxPlayers(n)}
                    className={cn(
                      "aspect-[2.2/1] text-sm font-bold transition-all border rounded-md cursor-pointer",
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-transparent border-[#383347] text-white/60 hover:text-white hover:border-gray-500"
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions Count Configuration */}
          <div className="mt-5 md:mt-6">
            <p className="text-white text-sm font-semibold mb-3">Jumlah Soal</p>
            <div className="grid grid-cols-6 gap-2.5">
              {SOAL_OPTIONS.map((n) => {
                const isActive = jumlahSoal === n;
                return (
                  <button
                    key={n}
                    onClick={() => setJumlahSoal(n)}
                    className={cn(
                      "aspect-[2.2/1] text-sm font-bold transition-all border rounded-md cursor-pointer",
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-transparent border-[#383347] text-white/60 hover:text-white hover:border-gray-500"
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mt-5 md:mt-6">
            <p className="text-white text-sm font-semibold mb-3">Tingkat Kesulitan</p>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => {
                const isActive = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={cn(
                      "py-1 md:py-1.5 text-sm font-bold transition-all border rounded-lg cursor-pointer",
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : "bg-transparent border-[#383347] text-white/60 hover:text-white hover:border-gray-500"
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Visibility Selection */}
          <div className="mt-5 md:mt-6">
            <p className="text-white text-sm font-semibold mb-3">Visibilitas Room</p>
            <div className="grid grid-cols-2 gap-3">
              {VISIBILITY_OPTIONS.map((v) => {
                const isActive = roomVisibility === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => setRoomVisibility(v.value)}
                    className={cn(
                      "py-1 md:py-1.5 text-sm font-bold transition-all border rounded-lg cursor-pointer",
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : "bg-transparent border-[#383347] text-white/60 hover:text-white hover:border-gray-500"
                    )}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Action Bar (Submit) ── */}
        <div className="px-6 md:px-8 py-5 border-t border-[#383347] bg-[#040619]">
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
              {errorMsg}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isFormComplete}
            className={cn(
              "group w-full py-2 md:py-3 text-white font-bold text-base md:text-md flex items-center justify-center gap-2 rounded-lg shadow-xl transition-all",
              isLoading || !isFormComplete
                ? "bg-gray-600 cursor-not-allowed opacity-60"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/10 active:scale-[0.98] cursor-pointer"
            )}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {loadingText || "Memproses..."}
              </>
            ) : !isFormComplete ? (
              <>
                {warningMessage}
              </>
            ) : (
              <>
                <span className="transition-transform group-hover:scale-110 group-hover:-rotate-12">🚀</span>
                Buat Arena Baru
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
