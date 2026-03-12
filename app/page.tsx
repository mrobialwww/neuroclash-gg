import { Home, Search, History, Store, Menu } from "lucide-react";
import { CreateArenaCard } from "@/components/dashboard/CreateArenaCard";
import { JoinArenaCard } from "@/components/dashboard/JoinArenaCard";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { GAME_ROOMS } from "@/lib/constants/game-rooms";

export default function HomePage() {
  // Group game rooms by category
  const categories = Array.from(new Set(GAME_ROOMS.map(room => room.category)));

  return (
    <div className="min-h-screen bg-[#EEF2F9] font-(family-name:--font-baloo-2) pb-20">
      {/* Header / Navbar */}
      <header className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-3 bg-white shadow-sm font-medium z-10 relative">
        <div className="flex items-center gap-6 w-[400px]">
          {/* Logo Placeholder */}
          <div className="flex items-center justify-center bg-blue-600 text-white rounded-lg w-10 h-10 font-bold shrink-0">
            NC
          </div>
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
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-4 text-blue-600 border-b-[3px] border-blue-600 font-bold"
          >
            <Home className="w-5 h-5" /> Beranda
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-gray-600 transition"
          >
            <History className="w-5 h-5" /> Riwayat
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-gray-600 transition"
          >
            <Store className="w-5 h-5" /> Toko
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-gray-600 transition"
          >
            {/* Papan Peringkat icon looks like a bar chart in the design */}
            <div className="flex items-end gap-[2px] w-5 h-5">
              <div className="bg-gray-400 w-1.5 h-3 rounded-sm"></div>
              <div className="bg-gray-400 w-1.5 h-5 rounded-sm"></div>
              <div className="bg-gray-400 w-1.5 h-4 rounded-sm"></div>
            </div>
            Papan Peringkat
          </a>
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

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-10 space-y-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr] gap-6 w-full">
          <JoinArenaCard />
          <CreateArenaCard />
        </div>

        {/* Categories Section */}
        <div className="space-y-8">
          {categories.map((category) => (
            <CategorySection
              key={category}
              title={category}
              courses={GAME_ROOMS.filter(room => room.category === category).map(room => ({
                title: room.topic_material,
                progress: (room.usersRegistered / room.max_player) * 100,
                usersRegistered: room.usersRegistered,
                usersTotal: room.max_player,
                questionsCount: room.total_question,
                iconPath: room.image_url,
                players: room.players,
              }))}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
