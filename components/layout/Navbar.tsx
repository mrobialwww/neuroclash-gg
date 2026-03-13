"use client";

import React from "react";
import { Home, Search, History, Store, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Riwayat", href: "/history", icon: History },
    { name: "Toko", href: "/shop", icon: Store },
  ];

  return (
    <header className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-3 bg-white shadow-sm font-medium z-10 relative">
      <div className="flex items-center gap-6 w-[400px]">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center bg-blue-600 text-white rounded-lg w-10 h-10 font-bold shrink-0">
          NC
        </Link>
        {/* SearchBar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Temukan Arena"
            className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Center Nav */}
      <nav className="hidden md:flex items-center gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-6 py-4 transition-all duration-200",
                isActive 
                  ? "text-blue-600 border-b-[3px] border-blue-600 font-bold" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="w-5 h-5" /> {link.name}
            </Link>
          );
        })}
        
        <Link
          href="/leaderboard"
          className={cn(
            "flex items-center gap-2 px-6 py-4 transition-all duration-200",
            pathname === "/leaderboard"
              ? "text-blue-600 border-b-[3px] border-blue-600 font-bold"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <div className="flex items-end gap-[2px] w-5 h-5">
            <div className={cn("w-1.5 h-3 rounded-sm", pathname === "/leaderboard" ? "bg-blue-600" : "bg-gray-400")}></div>
            <div className={cn("w-1.5 h-5 rounded-sm", pathname === "/leaderboard" ? "bg-blue-600" : "bg-gray-400")}></div>
            <div className={cn("w-1.5 h-4 rounded-sm", pathname === "/leaderboard" ? "bg-blue-600" : "bg-gray-400")}></div>
          </div>
          Papan Peringkat
        </Link>
      </nav>

      {/* Right Nav */}
      <div className="flex items-center justify-end gap-4 w-[400px]">
        {/* Avatar Placeholder */}
        <div className="w-10 h-10 bg-green-500 rounded-full border-2 border-green-600 overflow-hidden shrink-0 flex items-center justify-center text-white text-xs">
          A
        </div>
        {/* Coins */}
        <div className="flex items-center bg-[#FCECB9] text-[#A67E2A] px-4 py-1.5 rounded-full font-bold shadow-sm border border-[#EAC973]">
          <div className="bg-linear-to-r from-yellow-400 to-yellow-600 w-5 h-5 rounded-full mr-2 shadow-inner text-white text-[10px] flex items-center justify-center">
            ★
          </div>
          1928
        </div>
        {/* Hamburger Menu */}
        <button className="text-gray-600">
          <Menu className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
}
