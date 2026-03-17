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
  currentUser: LobbyPlayer;     // selalu ditampilkan pertama, highlight biru
  host: LobbyPlayer;            // ditampilkan kedua, highlight merah
  players: LobbyPlayer[];       // player lain
  onLeave?: () => void;
}

// ── PlayerSlot ──────────────────────────────────────────────────────────────
function PlayerSlot({
  player,
  highlight,
}: {
  player: LobbyPlayer;
  highlight?: "self" | "host";
}) {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
        width: 80,
      }}
    >
      {/* Avatar circle */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: `2.5px solid ${borderColor}`,
          background: bgColor,
          boxShadow:
            highlight === "self"
              ? "0 0 12px rgba(91,155,245,0.45)"
              : highlight === "host"
              ? "0 0 12px rgba(229,90,90,0.45)"
              : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          backgroundColor: getCharacterBgColor(player.character),
        }}
      >
        <div
          style={{
            position: "relative",
            width: "80%",
            height: "80%",
          }}
        >
          <Image
            src={player.image}
            alt={player.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Name */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color:
            highlight === "self"
              ? "#7BB8FF"
              : highlight === "host"
              ? "#FF8A8A"
              : "rgba(255,255,255,0.75)",
          textAlign: "center",
          maxWidth: 76,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: "0.01em",
        }}
      >
        {player.name}
      </span>

      {/* Badge */}
      {(highlight === "self" || highlight === "host") && (
        <span
          style={{
            marginTop: -4,
            fontSize: 9,
            fontWeight: 800,
            color:
              highlight === "self"
                ? "#5B9BF5"
                : "#E55A5A",
            background:
              highlight === "self"
                ? "rgba(91,155,245,0.15)"
                : "rgba(229,90,90,0.15)",
            border: `1px solid ${highlight === "self" ? "rgba(91,155,245,0.4)" : "rgba(229,90,90,0.4)"}`,
            borderRadius: 20,
            padding: "1px 7px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {highlight === "self" ? "Kamu" : "Host"}
        </span>
      )}
    </div>
  );
}

// ── LobbyRoom ────────────────────────────────────────────────────────────────
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

  // Build ordered list: self first, host second (if different), rest after
  const isSelfHost = currentUser.id === host.id;
  const orderedPlayers: Array<{ player: LobbyPlayer; highlight?: "self" | "host" }> = [
    { player: currentUser, highlight: "self" },
    ...(!isSelfHost ? [{ player: host, highlight: "host" as const }] : []),
    ...players
      .filter((p) => p.id !== currentUser.id && p.id !== host.id)
      .map((p) => ({ player: p })),
  ];

  const participantCount = orderedPlayers.length;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        color: "#fff",
        position: "relative",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        {/* Room code pill */}
        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 10,
            padding: "8px 18px",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.12em",
            color: "#fff",
          }}
        >
          {roomCode}
        </div>

        {/* Leave button */}
        <button
          onClick={onLeave}
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 10,
            padding: "8px 20px",
            fontWeight: 800,
            fontSize: 14,
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "0.03em",
          }}
        >
          Keluar
        </button>
      </div>

      {/* ── Center character ── */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: getCharacterBgColor(currentUser.character),
          border: "3px solid rgba(255,255,255,0.25)",
          boxShadow: "0 0 40px rgba(91,155,245,0.3), 0 8px 32px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          marginBottom: 28,
        }}
      >
        <div style={{ position: "relative", width: "82%", height: "82%" }}>
          <Image
            src={currentUser.image}
            alt={currentUser.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* ── Waiting text ── */}
      <h1
        style={{
          fontSize: "clamp(18px, 4vw, 28px)",
          fontWeight: 900,
          color: "#fff",
          margin: 0,
          marginBottom: 16,
          textAlign: "center",
          letterSpacing: "-0.02em",
          textShadow: "0 2px 16px rgba(0,0,0,0.4)",
        }}
      >
        Menunggu Host Memulai Pertandingan...
      </h1>

      {/* ── Room title tag ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(6px)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          borderRadius: 10,
          padding: "9px 22px",
          fontSize: 14,
          fontWeight: 700,
          color: "rgba(255,255,255,0.9)",
          marginBottom: 40,
          letterSpacing: "0.02em",
        }}
      >
        Materi: {roomTitle}
      </div>

      {/* ── Player list bar ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: "18px 20px",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.01em",
            }}
          >
            Daftar Pemain
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {participantCount}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>/{totalSlots}</span>
          </span>
        </div>

        {/* Scrollable player row */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 6,
            scrollbarWidth: "none", // Firefox
          }}
          className="hide-scrollbar"
        >
          {orderedPlayers.map(({ player, highlight }) => (
            <PlayerSlot key={player.id} player={player} highlight={highlight} />
          ))}
        </div>
      </div>

      {/* Hide scrollbar for webkit */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
