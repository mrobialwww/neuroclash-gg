"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CloseButton } from "./CloseButton";

interface OverlayMaterialCardProps {
  title: string;
  materialName: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const OverlayMaterialCard = ({
  title,
  materialName,
  content,
  isOpen,
  onClose,
  className,
}: OverlayMaterialCardProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-2xl flex flex-col items-center gap-6 z-10",
              className
            )}
          >
            {/* The Main Card */}
            <div className="relative w-full bg-black/50 backdrop-blur-xl border border-[#FDA928] rounded-[32px] p-6 pt-10 shadow-2xl overflow-visible">

              {/* Badge Title */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-full max-w-[320px] flex items-center justify-center z-20 px-4">
                <div className="relative w-full h-auto flex items-center justify-center">
                  <Image
                    src="/dashboard/trophy-badge.webp"
                    alt="Rank Badge Background"
                    width={320}
                    height={60}
                    className="object-contain -z-10 drop-shadow-sm block w-full h-full"
                    sizes="(max-width: 320px) 100vw, 320px"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center px-3 sm:px-6">
                    <span className="uppercase text-md md:text-lg text-white drop-shadow-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      {title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Content Container */}
              <div className="flex flex-col gap-4 mt-2">
                {/* Material Name Box */}
                <div className="w-full bg-[#D9D9D9]/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-bold text-base md:text-lg">
                    {materialName}
                  </h3>
                </div>

                {/* Content Box */}
                <div className="w-full bg-[#D9D9D9]/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                  <div className="text-white/90 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-wrap">
                    {content}
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button below the card */}
            <CloseButton onClick={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
