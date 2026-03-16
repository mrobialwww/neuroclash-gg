"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface BuffItemProps {
  buff: {
    name: string;
    image: string;
    label: string;
  };
}

export const BuffItem = ({ buff }: BuffItemProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center justify-center gap-1 cursor-pointer group"
    >
      {/* Icon Container */}
      <div className="relative w-12 h-12 md:w-14 md:h-14">
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 blur-xl rounded-full transition-all duration-300" />

        <Image
          src={buff.image}
          alt={buff.name}
          fill
          sizes="(max-width: 768px) 48px, 56px"
          className="object-contain relative z-10 drop-shadow-md"
        />
      </div>

      {/* Label Text */}
      <span className="text-white font-semibold text-xs md:text-sm text-center">
        {buff.label}
      </span>
    </motion.div>
  );
};