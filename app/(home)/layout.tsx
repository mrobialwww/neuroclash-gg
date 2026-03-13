import React from "react";
import { Navbar } from "@/components/layout/Navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#EEF2F9] font-(family-name:--font-baloo-2)">
      <Navbar />
      {children}
    </div>
  );
}
