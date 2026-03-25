"use client";

import React from "react";
import Image from "next/image";
import { MainButton } from "./MainButton";

interface ToastOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
  isFailed?: boolean;
  customImage?: string;
  code?: string;
  primaryButtonText?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
}

export const ToastOverlay = ({
  isOpen,
  onClose,
  title,
  message,
  isFailed = true,
  customImage,
  code,
  primaryButtonText = "OK",
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
}: ToastOverlayProps) => {
  if (!isOpen) return null;

  const defaultMascot = isFailed ? "/mascot/mascot-failed.webp" : "/mascot/mascot-match.webp";
  const finalImage = customImage || defaultMascot;
  const titleColor = isFailed ? "text-[#FF0000] drop-shadow-[0_2px_4px_rgba(255,0,0,0.3)]" : "text-white";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] md:max-w-[440px] rounded-2xl bg-[#040619] border-2 border-[#383347] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-6 md:p-8 flex flex-col items-center text-center gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Title */}
        <h2 className={`text-xl md:text-3xl font-black uppercase ${titleColor}`}>
          {title || (isFailed ? "Gagal Bergabung" : "Konfirmasi")}
        </h2>

        {/* Mascot / Custom Image */}
        <div className="relative w-[110px] h-[110px] md:w-[160px] md:h-[160px] drop-shadow-2xl">
          <Image
            src={finalImage}
            alt="Toast Display"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Message */}
        <div className="text-white text-sm md:text-lg font-medium leading-relaxed">
          {message ? (
            <div>{message}</div>
          ) : code ? (
            <>
              <p>
                Room dengan kode <span className="text-[#FFC300] font-bold">{code}</span> tidak ditemukan!
              </p>
              <p className="block">
                Pastikan kode arena benar dan masih aktif.
              </p>
            </>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-2 flex gap-3">
          {secondaryButtonText && (
            <MainButton
              onClick={onSecondaryClick || onClose}
              variant="white"
              size="lg"
              hasShadow
              className="flex-1 h-10 md:h-12 text-sm md:text-lg font-semibold"
            >
              {secondaryButtonText}
            </MainButton>
          )}

          <MainButton
            onClick={onPrimaryClick || onClose}
            variant="blue"
            size="lg"
            hasShadow
            className="flex-1 h-10 md:h-12 text-sm md:text-lg font-semibold"
          >
            {primaryButtonText}
          </MainButton>
        </div>
      </div>
    </div>
  );
};
