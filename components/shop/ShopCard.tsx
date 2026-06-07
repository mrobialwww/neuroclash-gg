"use client";

import React from "react";

type ShopCardProps = {
  id: string;
  name: string;
  type: "karakter" | "skin";
  owned?: boolean;
};

export function ShopCard({ name, type, owned }: ShopCardProps) {
  return (
    <div className="w-56 p-4 rounded-lg shadow-sm bg-white border">
      <div className="w-full h-28 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400">
        gambar
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-gray-500">{type}</div>
        </div>
        <div className="text-xs font-medium text-gray-700">{owned ? "Owned" : "Buy"}</div>
      </div>
    </div>
  );
}

export default ShopCard;
