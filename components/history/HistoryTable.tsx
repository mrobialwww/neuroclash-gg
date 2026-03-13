import React from "react";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  avatar: string;
  time: string;
  date: string;
  material: string;
  rank: string;
  trophy: number;
  coin: number;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    avatar: "/default/Slime.webp",
    time: "12.30 AM",
    date: "29.03.2023",
    material: "Sistem Pencernaan",
    rank: "2/20",
    trophy: 119,
    coin: 129,
  },
  {
    id: "2",
    avatar: "/default/Slime.webp",
    time: "12.30 AM",
    date: "29.03.2023",
    material: "Sistem Pencernaan",
    rank: "2/20",
    trophy: 119,
    coin: 129,
  },
  {
    id: "3",
    avatar: "/default/Slime.webp",
    time: "12.30 AM",
    date: "29.03.2023",
    material: "Sistem Pencernaan",
    rank: "2/20",
    trophy: 119,
    coin: 129,
  },
  {
    id: "4",
    avatar: "/default/Slime.webp",
    time: "12.30 AM",
    date: "29.03.2023",
    material: "Sistem Pencernaan",
    rank: "2/20",
    trophy: 119,
    coin: 129,
  },
  {
    id: "5",
    avatar: "/default/Slime.webp",
    time: "12.30 AM",
    date: "29.03.2023",
    material: "Sistem Pencernaan",
    rank: "2/20",
    trophy: 119,
    coin: 129,
  },
  {
    id: "6",
    avatar: "/default/Slime.webp",
    time: "12.30 AM",
    date: "29.03.2023",
    material: "Sistem Pencernaan",
    rank: "2/20",
    trophy: 119,
    coin: 129,
  },
];

export function HistoryTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="bg-[#4D70E8] text-white">
              <th className="px-6 py-4 text-sm font-bold md:text-base"></th>
              <th className="px-6 py-4 text-sm font-bold md:text-base">
                Waktu
              </th>
              <th className="px-6 py-4 text-sm font-bold md:text-base">
                Tanggal
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold md:text-base">
                Materi
              </th>
              <th className="px-6 py-4 text-sm font-bold md:text-base">
                Peringkat
              </th>
              <th className="px-6 py-4 text-sm font-bold md:text-base">
                Tropi
              </th>
              <th className="px-6 py-4 text-sm font-bold md:text-base">Coin</th>
              <th className="px-6 py-4 text-sm font-bold md:text-base">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_HISTORY.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-gray-50/50"
              >
                {/* Avatar */}
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#8DE26E] shadow-sm">
                      <Image
                        src={item.avatar}
                        alt="Avatar"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                </td>

                {/* Waktu */}
                <td className="px-6 py-5">
                  <span className="whitespace-nowrap font-medium text-[#555555]">
                    {item.time}
                  </span>
                </td>

                {/* Tanggal */}
                <td className="px-6 py-5">
                  <span className="whitespace-nowrap font-medium text-[#555555]">
                    {item.date}
                  </span>
                </td>

                {/* Materi */}
                <td className="px-6 py-5 text-left">
                  <span className="font-semibold text-[#555555]">
                    {item.material}
                  </span>
                </td>

                {/* Peringkat */}
                <td className="px-6 py-5">
                  <span className="text-lg font-bold text-[#555555]">
                    {item.rank}
                  </span>
                </td>

                {/* Tropi */}
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative h-6 w-6">
                      <Image
                        src="/icons/trophy-color.svg"
                        alt="Trophy"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium text-[#555555]">
                      +{item.trophy}
                    </span>
                  </div>
                </td>

                {/* Coin */}
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative h-6 w-6">
                      <Image
                        src="/icons/coin-color.svg"
                        alt="Coin"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium text-[#555555]">
                      +{item.coin}
                    </span>
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-6 py-5">
                  <MainButton
                    variant="blue"
                    className="h-auto cursor-pointer rounded-lg border-none bg-[#658BFF] px-5 py-1.5 text-sm font-bold shadow-none hover:bg-[#3D79F3]"
                  >
                    Lihat Detail
                  </MainButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
