"use client";

import React from "react";
import Image from "next/image";
import { MainButton } from "./MainButton";

interface ToastFailedProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ToastFailed = ({ code, isOpen, onClose }: ToastFailedProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
      {/* Modal Container */}
      <div className="relative w-full max-w-[380px] md:max-w-[420px] rounded-2xl bg-[#040619] border-2 border-[#383347] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-6 md:p-8 flex flex-col items-center text-center gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Title */}
        <h2 className="text-[#FF0000] text-xl md:text-3xl font-black tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(255,0,0,0.3)]">
          Gagal Bergabung
        </h2>

        {/* Mascot */}
        <div className="relative w-[110px] h-[110px] md:w-[160px] md:h-[160px] drop-shadow-2xl">
          <Image
            src="/mascot/mascot-failed.webp"
            alt="Mascot Failed"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Message */}
        <div className="text-white text-sm md:text-lg font-medium leading-relaxed">
          <p>
            Room dengan kode <span className="text-[#FFC300] font-bold">{code}</span> tidak ditemukan!
          </p>
          <p className="block">
            Pastikan kode arena benar dan masih aktif.
          </p>
        </div>

        {/* Action Button */}
        <MainButton
          onClick={onClose}
          variant="blue"
          size="lg"
          hasShadow
          className="w-full mt-2 rounded-xl h-12 md:h-14 text-lg md:text-xl font-bold"
        >
          OK
        </MainButton>
      </div>
    </div>
  );
};

