"use client";

import React from "react";

export type Level = "default" | "epic" | "legend";

export type CardProps = {
  id: string;
  image_url?: string;
  name?: string;
  skin_name?: string;
  cost?: number;
  skin_level?: Level;
  owned?: boolean;
  /**
   * Warna background karakter (hex).
   * Untuk level "epic" → override ke ungu, "legend" → override ke kuning.
   * Jika owned → override ke abu-abu.
   * Jika tidak ada, fallback ke hijau default.
   */
  character_bg?: string;
};

/** Warna background berdasarkan level / status */
const LEVEL_BG: Record<Level, string> = {
  default: "#4AA213", // akan di-override oleh character_bg jika ada
  epic: "#7C13A2",
  legend: "#C89B00",
};

const OWNED_BG = "#9CA3AF";

export default function Card({
  image_url,
  name,
  skin_name,
  cost,
  skin_level = "default",
  owned = false,
  character_bg,
}: CardProps) {
  /* ── Tentukan warna background ── */
  let bg: string;
  if (owned) {
    bg = OWNED_BG;
  } else if (skin_level === "epic") {
    bg = LEVEL_BG.epic;
  } else if (skin_level === "legend") {
    bg = LEVEL_BG.legend;
  } else {
    // default level → pakai warna karakter dari characters.ts (atau fallback hijau)
    bg = character_bg ?? LEVEL_BG.default;
  }

  const displayName = skin_name ?? name ?? "Item";

  return (
    <div
      className="relative flex flex-col items-center rounded-2xl overflow-hidden shadow-md select-none"
      style={{
        aspectRatio: "2/3",
        width: "100%",
        background: bg,
      }}
    >
      {/* ── Radial highlight / glow di tengah-atas ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* ── Badge EPIC / LEGEND ── */}
      {!owned && skin_level === "epic" && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-purple-700 px-2 py-0.5">
          {/* SLOT: ganti <span> di bawah dengan <Image> icon epic kamu */}
          <span
            className="inline-flex items-center justify-center rounded-full bg-white/30"
            style={{ width: 14, height: 14, fontSize: 8, color: "white" }}
          >
            {/* icon epic placeholder */}◆
          </span>
          <span className="text-[10px] font-bold leading-none text-white tracking-wide">
            EPIC
          </span>
        </div>
      )}
      {!owned && skin_level === "legend" && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-0.5">
          {/* SLOT: ganti <span> di bawah dengan <Image> icon legend kamu */}
          <span
            className="inline-flex items-center justify-center rounded-full bg-white/30"
            style={{ width: 14, height: 14, fontSize: 8, color: "white" }}
          >
            {/* icon legend placeholder */}★
          </span>
          <span className="text-[10px] font-bold leading-none text-white tracking-wide">
            LEGEND
          </span>
        </div>
      )}

      {/* ── Gambar karakter ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center w-full px-4 pt-4">
        <div
          className="flex items-center justify-center rounded-full bg-white/90"
          style={{ width: "62%", aspectRatio: "1/1" }}
        >
          {image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image_url}
              alt={displayName}
              className="w-4/5 h-4/5 object-contain"
            />
          ) : (
            /* SLOT: tempat untuk gambar karakter */
            <div className="text-gray-400 text-xs text-center px-1">gambar</div>
          )}
        </div>
      </div>

      {/* ── Nama + bar harga ── */}
      <div className="relative z-10 flex w-full flex-col items-center gap-5 px-3 pb-5 pt-2">
        {/* Nama */}
        <span
          className="w-full truncate text-center font-bold text-white"
          style={{
            fontFamily: "var(--font-baloo-2, 'Baloo 2', cursive)",
            fontSize: "clamp(16px, 5cqi, 24px)",
            textShadow: "0 1px 6px rgba(0,0,0,0.35)",
            letterSpacing: "0.01em",
          }}
        >
          {displayName}
        </span>

        {/* Bar harga / dimiliki */}
        {owned ? (
          <div
            className="w-full rounded-xl bg-white/30 text-center font-semibold text-white/80"
            style={{ padding: "13px 0", fontSize: "clamp(13px, 3.5cqi, 16px)" }}
          >
            Dimiliki
          </div>
        ) : (
          <div
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white"
            style={{ padding: "13px 0" }}
          >
            {/*
              SLOT COIN ICON:
              Ganti elemen <span> di bawah ini dengan:
              <Image src="/icons/coin.png" width={18} height={18} alt="coin" />
            */}
            <span
              className="inline-block rounded-full bg-yellow-400 border-2 border-yellow-600 shrink-0"
              style={{ width: 18, height: 18 }}
            />
            <span
              className="font-bold text-gray-800"
              style={{
                fontFamily: "var(--font-baloo-2, 'Baloo 2', cursive)",
                fontSize: "clamp(13px, 3.5cqi, 16px)",
              }}
            >
              {cost != null ? cost.toLocaleString("id-ID") : "—"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
