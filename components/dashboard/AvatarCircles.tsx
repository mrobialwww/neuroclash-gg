"use client";

import React, { useState, useRef } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import Image from "next/image";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { cn } from "@/lib/utils";
import { User } from "@/types/MockUser";

interface AvatarCirclesProps {
  items: User[];
  className?: string;
  avatarSize?: number;
  maxItems?: number;
}

export const AvatarCircles = ({ items, className, avatarSize = 40, maxItems = 4 }: AvatarCirclesProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<string | number | null>(null);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const target = event.currentTarget;
    const offsetX = event.nativeEvent.offsetX;
    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = target.offsetWidth / 2;
      x.set(offsetX - halfWidth);
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("flex flex-row items-center", className)}>
      {items.slice(0, maxItems).map((item, idx) => (
        <div
          className="group relative -mr-2 last:mr-0 transition-all duration-300 hover:z-30"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                style={{ translateX: translateX, rotate: rotate, whiteSpace: "nowrap" }}
                className="absolute -top-12 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-lg bg-black/90 backdrop-blur-sm px-3 py-1.5 text-[10px] md:text-xs shadow-xl pointer-events-none"
              >
                <div className="relative z-30 font-bold text-white">{item.name}</div>
                <div className="text-[10px] text-gray-300">{item.character}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="relative rounded-full border-[2.5px] border-white shadow-sm overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: getCharacterBgColor(item.character),
              width: avatarSize,
              height: avatarSize,
            }}
            onMouseMove={handleMouseMove}
          >
            <div className="relative w-[85%] h-[85%] flex items-center justify-center mt-0.5">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes={`${avatarSize}px`}
                className="object-contain"
                priority={idx < 2} // Optimasi LCP untuk 2 avatar pertama
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};