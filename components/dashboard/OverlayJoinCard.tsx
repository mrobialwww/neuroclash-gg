"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Users, Flag } from "lucide-react";
import { MainButton } from "@/components/common/MainButton";
import { Difficulty } from "@/types";
import { GameRoomWithPlayerCount } from "@/types/GameRoom";
import { DIFFICULTY_THEME_MAP, getBannerColor } from "@/lib/constants/overlay-theme";
import { quizService } from "@/services/quizService";
import { ToastFailed } from "@/components/common/ToastFailed";

interface OverlayJoinCardProps {
  room: GameRoomWithPlayerCount;
  onClose?: () => void;
}

const FALLBACK_IMAGE = "/quiz-category/biologi.webp";

function resolveImage(src: string | null | undefined, error: boolean): string {
  return error || !src ? FALLBACK_IMAGE : src;
}

function OverlayCardContent({ room, onClose }: OverlayJoinCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"join" | "multi" | "solo" | null>(null);
  const [errorConfig, setErrorConfig] = useState({ isOpen: false, title: "", message: "" });

  const displayTitle = room.title || room.topic_material;
  const bannerColor = getBannerColor(room.topic_material);
  const difficultyTheme =
    DIFFICULTY_THEME_MAP[room.difficulty as Difficulty] ||
    DIFFICULTY_THEME_MAP["sedang"];

  const handleJoin = () => {
    setLoadingAction("join");
    router.push(`/quiz-lobby/${room.game_room_id}`);
  };

  const handleCreateMulti = async () => {
    setLoadingAction("multi");
    try {
      const newRoom = await quizService.duplicateRoom(room.game_room_id, 40);
      router.push(`/quiz-lobby/${newRoom.game_room_id}`);
    } catch {
      setErrorConfig({
        isOpen: true,
        title: "Gagal Membuat Room",
        message: "Terjadi kesalahan saat memproses data multiplayer. Silakan coba lagi.",
      });
    } finally {
      if (loadingAction === "multi") setLoadingAction(null);
    }
  };

  const handleSolo = async () => {
    setLoadingAction("solo");
    try {
      const newRoom = await quizService.duplicateRoom(room.game_room_id, 1);
      router.push(`/quiz-lobby/${newRoom.game_room_id}`);
    } catch {
      setErrorConfig({
        isOpen: true,
        title: "Gagal Mode Solo",
        message: "Terjadi kesalahan saat membuat sesi latihan mandiri.",
      });
    } finally {
      if (loadingAction === "solo") setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="font-(family-name:--font-baloo-2) relative w-full max-w-[400px] md:max-w-[500px] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300">

        {/* Top Banner Section */}
        <div className={`relative flex h-[200px] md:h-[240px] items-center justify-center transition-all ${bannerColor}`}>
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4 flex items-center gap-2 z-20">
            <button className="flex items-center gap-2 rounded-md bg-black/50 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-black/70">
              <Image src="/icons/share.svg" alt="Share" width={14} height={14} className="sm:w-4 sm:h-4" />
              Bagikan
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-black/70"
            >
              <Image src="/icons/cancel.svg" alt="Close" width={12} height={12} className="md:w-[14px] md:h-[14px]" />
            </button>
          </div>

          {/* Icon Besar */}
          <div className="relative flex h-40 w-40 md:h-48 md:w-48 items-center justify-center">
            <Image
              src={resolveImage(room.image_url, imgError)}
              alt={displayTitle}
              width={200}
              height={200}
              className="w-[140px] md:w-[170px] object-contain"
              priority
              onError={() => setImgError(true)}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#555555] leading-tight">
            {displayTitle}
          </h2>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-6 pb-4 border-b border-[#D9D9D9]">
            <div className="flex items-center gap-2 text-[#555555]">
              <Users size={22} className="text-[#256AF4]" />
              <span className="text-base font-bold">
                {room.player_count}/{room.max_player} Pemain
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#555555]">
              <Flag size={20} className="text-[#256AF4]" />
              <span className="text-base font-bold">
                {room.total_question} Ronde
              </span>
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className={`inline-block px-4 py-1.5 rounded-lg font-bold text-sm capitalize ${difficultyTheme.badgeBg} ${difficultyTheme.badgeText}`}>
            Tingkat Kesulitan {room.difficulty}
          </div>

          {/* Action Button Section with Flat Layout */}
          <div className="mt-2 w-full pb-2">
            <div className="flex flex-col gap-3">
              {/* Tombol 1: Bergabung ke Room */}
              <MainButton
                variant="green"
                hasShadow
                className="w-full text-sm md:text-lg font-bold py-2 sm:py-4 rounded-xl"
                onClick={handleJoin}
                disabled={loadingAction !== null}
              >
                {loadingAction === "join" ? "Memuat..." : "Bergabung ke Room"}
              </MainButton>

              {/* Tombol 2: Buat Room Baru */}
              <MainButton
                variant="blue"
                hasShadow
                className="w-full text-sm md:text-lg font-bold py-2 sm:py-4 rounded-xl"
                onClick={handleCreateMulti}
                disabled={loadingAction !== null}
              >
                {loadingAction === "multi" ? "Memuat..." : "Buat Room Baru"}
              </MainButton>

              {/* Tombol 3: Latihan Mandiri */}
              <MainButton
                variant="white"
                className="w-full text-sm md:text-lg font-bold py-2 sm:py-4 rounded-xl border-2 border-[#3D79F3] cursor-pointer"
                onClick={handleSolo}
                disabled={loadingAction !== null}
              >
                {loadingAction === "solo" ? "Memuat..." : "Latihan Mandiri"}
              </MainButton>
            </div>
          </div>
        </div>
      </div>

      <ToastFailed
        isOpen={errorConfig.isOpen}
        onClose={() => setErrorConfig((prev) => ({ ...prev, isOpen: false }))}
        title={errorConfig.title}
        message={errorConfig.message}
      />
    </>
  );
}

export function OverlayJoinCard(props: OverlayJoinCardProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-5 sm:p-8">
      {/* Overlay Background */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={props.onClose}
      />

      {/* Card Wrapper */}
      <div className="z-10 w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
        <OverlayCardContent {...props} />
      </div>
    </div>,
    document.body
  );
}