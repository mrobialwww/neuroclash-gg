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

export interface AvatarItem {
  id: string | number;
  name: string;
  character: string;
  image: string;
}

interface AvatarCirclesProps {
  items: AvatarItem[];
  className?: string;
}

export const AvatarCircles = ({ items, className }: AvatarCirclesProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<string | number | null>(
    null,
  );
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event: any) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.target.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("flex flex-row items-center", className)}>
      {items.slice(0, 4).map((item) => (
        <div
          className="group relative -mr-3 last:mr-0 transition-transform duration-300 hover:z-30 hover:-translate-y-1"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-12 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-lg bg-black/90 backdrop-blur-sm px-3 py-1.5 text-xs shadow-xl"
              >
                <div className="relative z-30 text-sm font-bold text-white">
                  {item.name}
                </div>
                <div className="text-[10px] text-gray-300">
                  {item.character}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border-[3px] border-white shadow-sm overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: getCharacterBgColor(item.character) }}
            onMouseMove={handleMouseMove}
          >
            <div className="relative w-full h-full flex items-center justify-center top-1">
              <Image
                src={item.image}
                alt={item.name}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
