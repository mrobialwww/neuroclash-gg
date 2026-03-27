"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PickedAbility } from "@/store/useStarboxStore";

interface BuffItemProps {
  buff: PickedAbility;
  // {
  //   name: string;
  //   image: string;
  //   label: string;
  // };
  onClick?: () => void;
}

export const BuffItem = ({ buff, onClick }: BuffItemProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group flex cursor-pointer flex-col items-center justify-center gap-1"
    >
      {/* Icon Container */}
      <div className="relative h-12 w-12 md:h-14 md:w-14">
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-full bg-white/0 blur-xl transition-all duration-300 group-hover:bg-white/10" />

        <Image
          src={buff.image?.replace("-card", "") || "/default-ability.webp"}
          alt={buff.name}
          fill
          sizes="(max-width: 768px) 48px, 56px"
          className="relative z-10 object-contain drop-shadow-md"
        />
      </div>

      {/* Label Text */}
      <span className="text-center text-xs font-semibold text-white md:text-sm">{buff.name}</span>
    </motion.div>
  );
};
