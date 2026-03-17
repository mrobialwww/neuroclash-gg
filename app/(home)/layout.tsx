"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbar = pathname.startsWith("/quiz-lobby");

  return (
    <div className="min-h-screen bg-[#EEF2F9] font-(family-name:--font-baloo-2)">
      {!hideNavbar && <Navbar />}
      {children}
    </div>
  );
}