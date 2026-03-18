"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "../common/Searchbar";

interface NavbarProps {
  initialData?: {
    username: string;
    coins: number;
    avatar: string;
  } | null;
}

export function Navbar({ initialData }: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Gunakan data dari server, fallback jika data tidak tersedia
  const user = initialData || {
    username: "Guest",
    coins: 0,
    avatar: "/default/Slime.webp",
  };

  const navLinks = [
    { name: "Beranda", href: "/dashboard", icon: "/icons/home.svg" },
    { name: "Riwayat", href: "/history", icon: "/icons/history.svg" },
    { name: "Toko", href: "/shop", icon: "/icons/shop.svg" },
    { name: "Papan Peringkat", href: "/leaderboard", icon: "/icons/chart.svg" },
  ];

  return (
    <header className="sticky top-0 w-full bg-white border-b border-gray-100 z-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex items-stretch justify-between lg:gap-4 h-[72px]">

        {/* Left: Logo & Search */}
        <div className="flex items-center gap-8 flex-1 lg:flex-none">
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="/icons/neuroclash.svg"
              alt="Neuroclash Logo"
              width={50}
              height={50}
              priority
              className="w-[50px] h-auto"
              style={{ height: 'auto' }}
            />
          </Link>
          <div className="hidden xl:block w-[300px] xl:w-[360px]">
            <SearchBar />
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 h-full transition-all duration-200 group",
                  isActive ? "text-[#256AF4]" : "text-[#A1A1A1] hover:text-[#555555]"
                )}
              >
                <div className="w-6 h-6">
                  <div
                    className="w-full h-full bg-current"
                    style={{
                      maskImage: `url(${link.icon})`,
                      WebkitMaskImage: `url(${link.icon})`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                </div>
                <span className="text-md font-semibold whitespace-nowrap">
                  {link.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#256AF4]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Stats */}
        <div className="flex items-center gap-4 md:gap-6 flex-1 justify-end lg:flex-none">
          <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
            <Image
              src={user.avatar}
              alt={`${user.username}'s Avatar`}
              fill
              sizes="(max-width: 768px) 40px, 48px"
              className="object-contain"
            />
          </div>

          <div className="flex items-center bg-[#F9DA61]/50 border border-[#DFB200] rounded-full pl-1 pr-4 py-1 gap-2 shadow-sm">
            <div className="relative w-7 h-7 md:w-8 md:h-8">
              <Image
                src="/icons/coin-color.svg"
                alt="Coin"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <span className="text-[#AD8A00] font-bold text-sm md:text-base tracking-tight">
              {user.coins}
            </span>
          </div>

          <button className="md:hidden p-2 text-[#555555]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b p-4 space-y-2 md:hidden shadow-lg transition-all">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all",
                  isActive ? "bg-blue-50 text-[#256AF4]" : "text-[#A1A1A1]"
                )}
              >
                <div className="w-6 h-6">
                  <div
                    className="w-full h-full bg-current"
                    style={{
                      maskImage: `url(${link.icon})`,
                      WebkitMaskImage: `url(${link.icon})`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                </div>
                <span className="font-semibold">{link.name}</span>
              </Link>
            )
          })}
        </div>
      )}
    </header>
  );
}