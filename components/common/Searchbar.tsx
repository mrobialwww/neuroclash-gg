import React from "react";
import Image from "next/image";

export function SearchBar() {
  return (
    <div className="w-full max-w-[360px]">
      <div className="flex items-center justify-between px-5 py-2 rounded-full border border-[#A1A1A1] bg-white focus-within:border-[#256AF4] transition-all group">
        <input
          type="text"
          placeholder="Temukan Arena"
          className="flex-1 text-md outline-none placeholder:text-[#BABABA] bg-transparent"
        />

        <div className="flex shrink-0 ml-2">
          <Image
            src="/icons/search.svg"
            alt="Search"
            width={24}
            height={24}
          />
        </div>

      </div>
    </div>
  );
}