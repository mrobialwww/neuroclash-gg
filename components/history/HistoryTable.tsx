"use client";

import React from "react";
import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";
import { MOCK_HISTORY } from "@/lib/constants/history";

export function HistoryTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="bg-[#4D70E8] text-white">
              <th className="px-4 py-3 text-sm font-bold md:px-6 md:py-4 md:text-base"></th>
              <th className="px-4 py-3 text-sm font-bold md:px-6 md:py-4 md:text-base">Waktu</th>
              <th className="px-4 py-3 text-sm font-bold md:px-6 md:py-4 md:text-base">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-bold md:px-6 md:py-4 md:text-base">Materi</th>
              <th className="px-4 py-3 text-sm font-bold md:px-6 md:py-4 md:text-base">Peringkat</th>
              <th className="px-4 py-3 text-sm font-bold md:px-6 md:py-4 md:text-base">Tropi</th>
              <th className="px-4 py-3 text-sm font-bold md:px-6 md:py-4 md:text-base">Coin</th>
              <th className="px-4 py-3 text-sm font-bold md:px-6 md:py-4 md:text-base">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {MOCK_HISTORY.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-gray-50/50">
                {/* Avatar */}
                <td className="px-4 py-3 md:px-6 md:py-5">
                  <div className="flex justify-center">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#8DE26E] shadow-sm md:h-12 md:w-12">
                      <Image
                        src={item.avatar}
                        alt="Avatar"
                        fill
                        sizes="(max-width: 768px) 40px, 48px"
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                </td>

                {/* Waktu */}
                <td className="px-4 py-3 md:px-6 md:py-5">
                  <span className="whitespace-nowrap text-sm font-medium text-[#555555] md:text-base">
                    {item.time}
                  </span>
                </td>

                {/* Tanggal */}
                <td className="px-4 py-3 md:px-6 md:py-5">
                  <span className="whitespace-nowrap text-sm font-medium text-[#555555] md:text-base">
                    {item.date}
                  </span>
                </td>

                {/* Materi */}
                <td className="px-4 py-3 text-left md:px-6 md:py-5">
                  <span className="text-sm font-semibold text-[#555555] md:text-base">
                    {item.material}
                  </span>
                </td>

                {/* Peringkat */}
                <td className="px-4 py-3 md:px-6 md:py-5">
                  <span className="text-base font-bold text-[#555555] md:text-lg">
                    {item.rank}
                  </span>
                </td>

                {/* Tropi */}
                <td className="px-4 py-3 md:px-6 md:py-5">
                  <div className="flex items-center justify-center gap-1.5 md:gap-2">
                    <div className="relative h-5 w-5 md:h-6 md:w-6">
                      <Image src="/icons/trophy-color.svg" alt="Trophy" fill sizes="(max-width: 768px) 20px, 24px" className="object-contain" />
                    </div>
                    <span className="text-sm font-medium text-[#555555] md:text-base">+{item.trophy}</span>
                  </div>
                </td>

                {/* Coin */}
                <td className="px-4 py-3 md:px-6 md:py-5">
                  <div className="flex items-center justify-center gap-1.5 md:gap-2">
                    <div className="relative h-5 w-5 md:h-6 md:w-6">
                      <Image src="/icons/coin-color.svg" alt="Coin" fill sizes="(max-width: 768px) 20px, 24px" className="object-contain" />
                    </div>
                    <span className="text-sm font-medium text-[#555555] md:text-base">+{item.coin}</span>
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-4 py-3 md:px-6 md:py-5">
                  <MainButton
                    variant="blue"
                    className="h-auto cursor-pointer rounded-lg border-none bg-[#658BFF] px-4 py-1.5 text-xs font-bold shadow-none hover:bg-[#3D79F3] md:px-5 md:text-sm"
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