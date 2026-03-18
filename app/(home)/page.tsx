"use client";

import { CategorySection } from "@/components/dashboard/CategorySection";
import { TextFieldWithButton } from "@/components/common/TextFieldWithButton";
import Image from "next/image";

export default function HomePage() {
  //   // Group game rooms by category
  //   const categories = Array.from(
  //     new Set(GAME_ROOMS.map((room) => room.category)),
  //   );
  const sampleCourses = [
    {
      title: "Pemrograman Dasar",
      usersRegistered: 17,
      usersTotal: 25,
      questionsCount: 20,
      iconPath: "/quiz-category/pemrograman.webp",
      players: [
        { id: 1, name: "Alya", character: "Phoenix", image: "/default/Phoenix.webp" },
        { id: 2, name: "Bima", character: "Robot", image: "/default/Robot.webp" },
        { id: 3, name: "Citra", character: "Naga", image: "/default/Naga.webp" },
      ],
    },
    {
      title: "Javascript",
      usersRegistered: 10,
      usersTotal: 25,
      questionsCount: 20,
      iconPath: "/quiz-category/pemrograman.webp",
      players: [
        { id: 4, name: "Dito", character: "Golem", image: "/default/Golem.webp" },
        { id: 5, name: "Eka", character: "Slime", image: "/default/Slime.webp" },
        { id: 6, name: "Fira", character: "Unicorn", image: "/default/Unicorn.webp" },
      ],
    },
    {
      title: "Struktur Data",
      usersRegistered: 5,
      usersTotal: 25,
      questionsCount: 20,
      iconPath: "/quiz-category/pemrograman.webp",
      players: [
        { id: 7, name: "Gus", character: "Jamur", image: "/default/Jamur.webp" },
        { id: 8, name: "Hana", character: "Peri", image: "/default/Peri.webp" },
      ],
    },
    {
      title: "Pemrograman Lanjut",
      usersRegistered: 3,
      usersTotal: 25,
      questionsCount: 20,
      iconPath: "/quiz-category/pemrograman.webp",
      players: [
        { id: 9, name: "Irfan", character: "Naga", image: "/default/Naga.webp" },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 px-6 py-10 pb-20 md:px-12 lg:px-16">
      {/* Hero Section */}
      <div className="min-h-[55vh] md:min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-10 md:gap-14 w-full"> {/* Tambah w-full di sini */}

          {/* Logo */}
          <div className="w-[65vw] sm:w-[50vw] md:w-[400px] lg:w-[500px] h-auto flex items-center justify-center">
            <Image
              src="/common/Logo_Neuroclash.svg"
              alt="Neuroclash"
              width={600}
              height={240}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* TextField */}
          <TextFieldWithButton
            placeholder="Masukkan Kode Arena"
            buttonContent="Gabung"
            wrapperClassName="w-[90%] sm:w-[80%] md:w-full md:max-w-xl"
            className="text-lg md:text-xl"
          />

        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-8">
        <CategorySection
          title="Daftar Arena"
          courses={sampleCourses.map((room, index) => ({
            id: index,
            title: room.title,
            progress: (room.usersRegistered / room.usersTotal) * 100,
            usersRegistered: room.usersRegistered,
            usersTotal: room.usersTotal,
            questionsCount: room.questionsCount,
            iconPath: room.iconPath,
            players: room.players,
          }))}
        />
      </div>
    </main>
  );
}
