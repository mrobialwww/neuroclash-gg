import React from "react";
import {
  Search,
  Home,
  History,
  Store,
  BarChart2,
  Coins,
  Menu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      {/* Left section: Logo & Search */}
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            {/* Placeholder logo */}
            <span className="font-bold text-xl">N</span>
          </div>
        </div>

        <div className="relative hidden md:flex items-center w-full max-w-sm">
          <div className="absolute left-3 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Temukan Arena"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
          />
        </div>
      </div>

      {/* Middle section: Nav Links */}
      <div className="hidden lg:flex items-center justify-center gap-8 flex-1 h-full">
        <Link
          href="#"
          className="flex items-center gap-2 text-blue-600 font-semibold py-4 border-b-2 border-blue-600"
        >
          <Home size={20} />
          <span>Beranda</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 text-gray-400 font-medium py-4 border-b-2 border-transparent hover:text-gray-600"
        >
          <History size={20} />
          <span>Riwayat</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 text-gray-400 font-medium py-4 border-b-2 border-transparent hover:text-gray-600"
        >
          <Store size={20} />
          <span>Toko</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 text-gray-400 font-medium py-4 border-b-2 border-transparent hover:text-gray-600"
        >
          <BarChart2 size={20} />
          <span>Papan Peringkat</span>
        </Link>
      </div>

      {/* Right section: Profile & Menu */}
      <div className="flex items-center justify-end gap-4 flex-1">
        <div className="hidden md:block w-10 h-10 bg-green-500 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
          {/* Avatar Placeholder */}G
        </div>

        <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-200">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-100">
            <Coins size={14} className="text-white" />
          </div>
          <span className="font-bold text-yellow-700">1928</span>
        </div>

        <button className="p-2 text-gray-500 hover:text-gray-700">
          <Menu size={28} />
        </button>
      </div>
    </nav>
  );
}
