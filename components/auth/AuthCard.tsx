"use client";

import React from "react";
import Image from "next/image";

type Props = {
  title?: React.ReactNode;
  children?: React.ReactNode;
  background?: string;
};

export default function AuthCard({ title, children, background = "/background/Daftar.png" }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a1a] bg-center bg-no-repeat bg-cover font-baloo-2"
      style={{ backgroundImage: `url('${background}')` }}
    >
      <div className="w-full max-w-[440px] bg-white/5 backdrop-blur-[32px] border border-white/10 rounded-[24px] px-10 pt-11 pb-9 shadow-2xl flex flex-col items-center">

        {/* Logo Section */}
        <div className="mb-5 flex items-center justify-center">
          <div className="relative w-16 h-16">
            <Image
              src="/icons/neuroclash-white.svg"
              alt="Neuroclash Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title */}
        {title && (
          <h1 className="text-[22px] font-bold text-white mb-7 tracking-tight text-center">
            {title}
          </h1>
        )}

        {/* Form Container */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}