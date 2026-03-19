"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { getCharacterBgColor } from "@/lib/constants/characters";

export interface LobbyPlayer {
  id: string | number;
  name: string;
  character: string;
  image: string;
  isHost?: boolean;
}

export interface LobbyRoomProps {
  roomCode: string;
  roomTitle: string;
  totalSlots: number;
  currentUser: LobbyPlayer;
  host: LobbyPlayer;
  players: LobbyPlayer[];
  onLeave?: () => void;
}

type OrderedPlayer = {
  player: LobbyPlayer;
  highlight?: "self" | "host";
};

/* ── PlayerSlot ── */
function PlayerSlot({
  player,
  highlight,
}: OrderedPlayer) {
  const borderColor =
    highlight === "self"
      ? "#5B9BF5"
      : highlight === "host"
      ? "#E55A5A"
      : "rgba(255,255,255,0.15)";

  const bgColor =
    highlight === "self"
      ? "rgba(91,155,245,0.18)"
      : highlight === "host"
      ? "rgba(229,90,90,0.18)"
      : "rgba(255,255,255,0.06)";

  return (
    <div className="flex flex-col items-center gap-[6px] shrink-0 w-[80px]">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative"
        style={{
          border: `2.5px solid ${borderColor}`,
          background: bgColor,
          backgroundColor: getCharacterBgColor(player.character),
          boxShadow:
            highlight === "self"
              ? "0 0 12px rgba(91,155,245,0.45)"
              : highlight === "host"
              ? "0 0 12px rgba(229,90,90,0.45)"
              : "none",
        }}
      >
        <div className="relative w-[80%] h-[80%]">
          <Image
            src={player.image}
            alt={player.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      <span
        className="text-[11px] font-bold text-center max-w-[76px] overflow-hidden text-ellipsis whitespace-nowrap tracking-[0.01em]"
        style={{
          color:
            highlight === "self"
              ? "#7BB8FF"
              : highlight === "host"
              ? "#FF8A8A"
              : "rgba(255,255,255,0.75)",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {player.name}
      </span>

      {(highlight === "self" || highlight === "host") && (
        <span
          className="mt-[-4px] text-[9px] font-extrabold rounded-full px-[7px] py-[1px] tracking-[0.05em] uppercase"
          style={{
            color: highlight === "self" ? "#5B9BF5" : "#E55A5A",
            background:
              highlight === "self"
                ? "rgba(91,155,245,0.15)"
                : "rgba(229,90,90,0.15)",
            border: `1px solid ${
              highlight === "self"
                ? "rgba(91,155,245,0.4)"
                : "rgba(229,90,90,0.4)"
            }`,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {highlight === "self" ? "Kamu" : "Host"}
        </span>
      )}
    </div>
  );
}

/* ── LobbyRoom ── */
export function LobbyRoom({
  roomCode,
  roomTitle,
  totalSlots,
  currentUser,
  host,
  players,
  onLeave,
}: LobbyRoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSelfHost = currentUser.id === host.id;

  /* ⭐ SUPER SAFE TYPE BUILD */
  const basePlayers: OrderedPlayer[] = [
    { player: currentUser, highlight: "self" },
  ];

  const hostPlayers: OrderedPlayer[] = !isSelfHost
    ? [{ player: host, highlight: "host" }]
    : [];

  const otherPlayers: OrderedPlayer[] = players
    .filter((p) => p.id !== currentUser.id && p.id !== host.id)
    .map((p) => ({ player: p }));

  const orderedPlayers: OrderedPlayer[] = [
    ...basePlayers,
    ...hostPlayers,
    ...otherPlayers,
  ];

  const participantCount = orderedPlayers.length;

  return (
    <div className="w-full flex flex-col items-center text-white relative px-4 box-border font-[Nunito,Segoe_UI,sans-serif]">
      {/* Top */}
      <div className="w-full max-w-[860px] flex items-center justify-between mb-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[10px] px-[18px] py-2 font-extrabold text-[15px] tracking-[0.12em]">
          {roomCode}
        </div>

        <button
          onClick={onLeave}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[10px] px-5 py-2 font-extrabold text-sm tracking-[0.03em]"
        >
          Keluar
        </button>
      </div>

      {/* Center Avatar */}
      <div
        className="w-[120px] h-[120px] rounded-full border-[3px] border-white/25 flex items-center justify-center overflow-hidden relative mb-7"
        style={{
          backgroundColor: getCharacterBgColor(currentUser.character),
          boxShadow:
            "0 0 40px rgba(91,155,245,0.3), 0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <div className="relative w-[82%] h-[82%]">
          <Image
            src={currentUser.image}
            alt={currentUser.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      <h1 className="text-[clamp(18px,4vw,28px)] font-black text-center mb-4 tracking-[-0.02em] drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
        Menunggu Host Memulai Pertandingan...
      </h1>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[10px] px-[22px] py-[9px] text-sm font-bold text-white/90 mb-10 tracking-[0.02em]">
        Materi: {roomTitle}
      </div>

      {/* Player List */}
      <div className="w-full max-w-[860px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-5 py-[18px]">
        <div className="flex justify-between items-center mb-4">
          <span className="font-extrabold text-[15px] text-white/90">
            Daftar Pemain
          </span>

          <span className="font-extrabold text-[15px] text-white/70">
            {participantCount}
            <span className="text-white/40">/{totalSlots}</span>
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-[6px] scrollbar-none"
        >
          {orderedPlayers.map((item) => (
            <PlayerSlot
              key={item.player.id}
              player={item.player}
              highlight={item.highlight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}