"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MainButton } from "@/components/common/MainButton";
import CreateArenaModal from "@/components/dashboard/CreateArenaOverlay";
import { ToastOverlay } from "@/components/common/ToastOverlay";
import { createClient } from "@/lib/supabase/client";
import { Difficulty } from "@/types/enums";

// ── Mapping category → kategori gambar room ──────────────────────────────
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  bahasaindonesia:
    "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/bahasaindonesia.webp",
  bahasainggris:
    "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/bahasainggris.webp",
  biologi:
    "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/biologi.webp",
  pancasila:
    "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/pancasila.webp",
  pemrograman:
    "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/pemrograman.webp",
  sejarah:
    "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/sejarah.webp",
};

const DEFAULT_IMAGE_URL =
  "https://cmgkgwzhiloxdttftmwf.supabase.co/storage/v1/object/public/room-categories/pemrograman.webp";

export function CreateArenaCard() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Memproses...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastData, setToastData] = useState<{
    isOpen: boolean;
    title?: string;
    message?: React.ReactNode;
    isFailed?: boolean;
    primaryButtonText?: string;
    onPrimaryClick?: () => void;
    secondaryButtonText?: string;
    onSecondaryClick?: () => void;
  }>({ isOpen: false });

  const handleCreateArena = () => {
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isLoading) setModalOpen(false);
  };

  /**
   * handleSubmitArena
   *
   * Alur:
   *  1. Dapatkan user_id dari Supabase Auth
   *  2. Bangun FormData (upload PDF) atau JSON (materi default)
   *  3. POST ke /api/quiz → Gemini generate + simpan langsung ke DB
   *  4. Redirect ke lobby room dengan game_room_id yang dikembalikan
   */
  const handleSubmitArena = async (data: {
    materiId: string | null;
    file: File | null;
    maxPlayers: number;
    jumlahSoal: number;
    difficulty: Difficulty;
    room_visibility: "public" | "private";
    title: string;
  }) => {
    setIsLoading(true);
    setLoadingText("Memvalidasi sesi user...");
    setErrorMsg(null);

    const AI_MESSAGES = [
      "AI sedang membaca materi...",
      "Merumuskan butir pertanyaan...",
      "Menyusun opsi jawaban kuis...",
      "Menganalisis tingkat kesulitan...",
      "Menyiapkan tantangan kuis untukmu...",
    ];

    let aiStatusInterval: any = null;

    try {
      // ── Step 1: Ambil user yang sedang login ──────────────────────────
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg("Kamu harus login sebelum membuat arena.");
        setIsLoading(false);
        return;
      }

      setLoadingText("Menghubungkan ke Gemini AI...");

      let messageIndex = 0;
      aiStatusInterval = setInterval(() => {
        setLoadingText(AI_MESSAGES[messageIndex]);
        messageIndex = (messageIndex + 1) % AI_MESSAGES.length;
      }, 2500);

      // ── Step 2: Request ke Gemini (/api/quiz) ────────────────────────
      let response: Response;

      if (data.file) {
        // Upload PDF fisik → multipart/form-data
        const formData = new FormData();
        formData.append("pdf", data.file);
        formData.append("round", String(data.jumlahSoal));
        formData.append("maxPlayer", String(data.maxPlayers));
        formData.append("difficulty", data.difficulty);
        formData.append("user_id", user.id);
        formData.append("room_visibility", data.room_visibility);

        response = await fetch("/api/quiz", {
          method: "POST",
          body: formData,
        });
      } else if (data.materiId) {
        // Materi default → application/json
        response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: data.materiId,
            difficulty: data.difficulty,
            round: data.jumlahSoal,
            maxPlayer: data.maxPlayers,
            user_id: user.id,
            room_visibility: data.room_visibility,
          }),
        });
      } else {
        setErrorMsg("Pilih salah satu materi atau upload file PDF terlebih dahulu.");
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (aiStatusInterval) clearInterval(aiStatusInterval);

      if (!response.ok) {
        throw new Error(result.message ?? "Gagal meng-generate soal menggunakan AI.");
      }

      // ── Step 3: Simpan ke DB (/api/game-rooms) ───────────────────────
      setLoadingText("Menyimpan Arena ke database...");
      const createRoomRes = await fetch("/api/game-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          category: data.materiId || "",
          title: data.title,
          max_player: data.maxPlayers,
          total_round: data.jumlahSoal,
          difficulty: data.difficulty,
          room_visibility: data.room_visibility,
          questions: result.geminiFile ? result.geminiFile : result,
        }),
      });

      const createRoomResult = await createRoomRes.json();
      if (!createRoomRes.ok) {
        throw new Error(createRoomResult.error ?? "Gagal menyimpan Game Room ke database.");
      }

      const gameRoom = createRoomResult.data[0];

      // ── Step 4: Tampilkan Toast Sukses ───────────────────────────────────
      setModalOpen(false);
      setToastData({
        isOpen: true,
        title: "Arena Siap!",
        message: (
          <div className="flex flex-col gap-3 text-left w-full mt-2">
            <p className="text-white/80 text-sm md:text-base leading-snug">
              Quiz <span className="text-blue-400 font-bold">"{gameRoom.title}"</span> berhasil diracik oleh AI.
            </p>
            <div className="bg-[#0b0d1e] border border-blue-500/20 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-white/50">Materi</span>
                <span className="text-white font-semibold capitalize font-mono text-xs md:text-sm truncate ml-2">
                  {gameRoom.category === "bahasaindonesia"
                    ? "Bahasa Indonesia"
                    : gameRoom.category === "bahasainggris"
                      ? "Bahasa Inggris"
                      : gameRoom.category}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-white/50">Total Soal</span>
                <span className="text-white font-semibold">{gameRoom.total_round} Soal</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-white/50">Pemain Max</span>
                <span className="text-white font-semibold">{gameRoom.max_player} Player</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-white/50">Kesulitan</span>
                <span className="font-bold capitalize bg-blue-600/30 px-2 py-0.5 rounded text-[10px] md:text-xs text-blue-300">
                  {gameRoom.difficulty}
                </span>
              </div>
            </div>
          </div>
        ),
        isFailed: false,
        primaryButtonText: "Masuk ke Lobby",
        onPrimaryClick: () => {
          setToastData((prev) => ({ ...prev, isOpen: false }));
          router.push(`/quiz-lobby/${gameRoom.game_room_id}`);
        },
      });
    } catch (err: unknown) {
      console.error("[CreateArenaCard] handleSubmitArena error:", err);
      setModalOpen(false);
      setToastData({
        isOpen: true,
        title: "Pembuatan Gagal",
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
        isFailed: true,
        primaryButtonText: "Tutup",
        onPrimaryClick: () => setToastData((prev) => ({ ...prev, isOpen: false })),
        secondaryButtonText: "Coba Lagi",
        onSecondaryClick: () => {
          setToastData((prev) => ({ ...prev, isOpen: false }));
          setModalOpen(true);
        }
      });
    } finally {
      setIsLoading(false);
      setLoadingText("Memproses...");
      if (aiStatusInterval) clearInterval(aiStatusInterval);
    }
  };

  return (
    <>
      <div className="relative w-full h-full bg-[#4D70E8] text-white rounded-3xl p-6 lg:p-8 flex flex-col justify-center overflow-hidden shadow-sm min-h-[220px] md:min-h-[240px]">

        {/* Background Decorative Images */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-[-10%] w-[70%] h-full">
            <Image
              src="/dashboard/create-arena-bg-2.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 70vw, 40vw"
              className="object-contain object-top-right"
            />
          </div>

          <div className="absolute bottom-0 right-0 w-full h-[80%]">
            <Image
              src="/dashboard/create-arena-bg-1.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-contain object-bottom-right"
            />
          </div>
        </div>

        {/* Illustration (Karakter orang) */}
        <div className="absolute right-0 md:right-[2%] lg:right-[5%] top-1/2 -translate-y-1/2 w-[50%] md:w-[40%] lg:w-[35%] h-[70%] md:h-[80%] pointer-events-none z-20 flex items-center justify-end pr-2">
          <div className="relative w-full h-full">
            <Image
              src="/dashboard/create-arena-illust.webp"
              alt="Create Arena Illustration"
              fill
              sizes="(max-width: 768px) 50vw, 35vw"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-30 w-[60%] sm:w-[55%] md:w-[60%] lg:w-[50%] flex flex-col items-start pl-1 md:pl-2">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-4 tracking-wide leading-tight drop-shadow-sm">
            Buat Arena
          </h2>
          <p className="text-white/95 text-xs md:text-base leading-relaxed mb-4 md:mb-8 font-medium max-w-[220px] md:max-w-[280px]">
            Buat arena kuis dan tantang pemain lain dalam duel pengetahuan
          </p>
          <MainButton
            variant="white"
            size="sm"
            hasShadow
            className="text-[#4D70E8] px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-base w-max font-extrabold"
            onClick={handleCreateArena}
          >
            Buat Arena Baru
          </MainButton>
        </div>
      </div>

      {/* Modal Overlay */}
      <CreateArenaModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitArena}
        isLoading={isLoading}
        loadingText={loadingText}
        errorMsg={errorMsg}
      />

      {/* Toast Overlay */}
      <ToastOverlay
        isOpen={toastData.isOpen}
        onClose={() => setToastData((prev) => ({ ...prev, isOpen: false }))}
        title={toastData.title}
        message={toastData.message}
        isFailed={toastData.isFailed}
        primaryButtonText={toastData.primaryButtonText}
        onPrimaryClick={toastData.onPrimaryClick}
        secondaryButtonText={toastData.secondaryButtonText}
        onSecondaryClick={toastData.onSecondaryClick}
      />
    </>
  );
}