"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AbilityCard } from "./AbilityCard";
import { MainButton } from "../common/MainButton";
import { CloseButton } from "./CloseButton";

interface Ability {
  id: string;
  name: string;
  image: string;
  emptyImage: string;
  description: string;
  stock: number;
}

interface OverlayAbilityCardProps {
  ability: Ability | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (abilityId: string) => void;
  className?: string;
}

export const OverlayAbilityCard = ({
  ability,
  isOpen,
  onClose,
  onUse,
  className,
}: OverlayAbilityCardProps) => {
  return (
    <AnimatePresence>
      {isOpen && ability && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Content Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-[400px] flex flex-col items-center gap-6 z-10",
              className
            )}
          >
            {/* Ability Card (Large) */}
            <div className="w-full">
              <AbilityCard
                name={ability.name}
                image={ability.image}
                emptyImage={ability.emptyImage}
                description={ability.description}
                stock={ability.stock}
                isLarge
                disableHover
                className="select-none"
              />
            </div>

            {/* Helper Text */}
            <p className="text-white text-sm md:text-md font-medium text-center drop-shadow-md px-4">
              Kekuatan akan otomatis digunakan pada babak berikutnya
            </p>

            {/* Use Button */}
            <MainButton
              variant="blue"
              size="default"
              hasShadow
              className="w-full max-w-xs rounded-full h-10 md:h-12 text-lg md:text-xl"
              onClick={() => {
                onUse(ability.id);
                onClose();
              }}
            >
              Gunakan
            </MainButton>

            {/* Close Button below */}
            <CloseButton onClick={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
