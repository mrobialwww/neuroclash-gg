"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Share2, X, Users, RotateCcw } from "lucide-react";

interface CourseCardProps {
  title: string;
  usersRegistered: number;
  usersTotal: number;
  questionsCount: number;
  iconPath: string;
  difficulty?: "Mudah" | "Sedang" | "Sulit";
  bgColor?: string;
  onClose?: () => void;
}

function OverlayCardContent({
  title,
  usersRegistered,
  usersTotal,
  questionsCount,
  iconPath,
  difficulty = "Sedang",
  bgColor = "#4A90D9",
  onClose,
}: CourseCardProps) {
  const difficultyColor =
    difficulty === "Mudah"
      ? "#D4F5E2"
      : difficulty === "Sulit"
      ? "#FFD6D6"
      : "#FFF3CD";
  const difficultyTextColor =
    difficulty === "Mudah"
      ? "#1A7A45"
      : difficulty === "Sulit"
      ? "#C0392B"
      : "#856404";

  return (
    <div
      style={{
        width: "min(700px, 92vw)", // responsive: max 700px, min 92% viewport
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.28)",
        background: "#fff",
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        position: "relative",
        // NO fixed height — card wraps content naturally
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          background: bgColor,
          height: "clamp(140px, 25vw, 220px)", // responsive banner height
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Share Button */}
        <button
          style={{
            position: "absolute",
            top: 12,
            right: 44,
            background: "rgba(255,255,255,0.92)",
            border: "none",
            borderRadius: 20,
            padding: "5px 12px",
            display: "flex",
            alignItems: "center",
            gap: 5,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: "#333",
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
          }}
        >
          <Share2 size={13} /> Bagikan
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 8,
            background: "rgba(255,255,255,0.92)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
          }}
        >
          <X size={14} color="#333" />
        </button>

        {/* Icon */}
        <div
          style={{
            background: "rgba(255,255,255,0.18)",
            borderRadius: 16,
            width: 72,
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.35)",
          }}
        >
          <img
            src={iconPath}
            alt={title}
            style={{ width: 44, height: 44, objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Content — padding bawah tipis agar rapat ke tombol */}
      <div style={{ padding: "20px 24px 20px" }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "clamp(16px, 3vw, 22px)",
            color: "#1a1a2e",
            marginBottom: 10,
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 12,
            color: "#555",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Users size={15} color="#777" />
            {usersRegistered}/{usersTotal} Pemain
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <RotateCcw size={14} color="#777" />
            {questionsCount} Ronde
          </span>
        </div>

        {/* Difficulty Badge */}
        <span
          style={{
            display: "inline-block",
            background: difficultyColor,
            color: difficultyTextColor,
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Tingkat Kesulitan {difficulty}
        </span>

        {/* Join Button — margin bottom 0, padding bawah dari container sudah cukup */}
        <button
          style={{
            display: "block",
            width: "100%",
            background: "linear-gradient(90deg, #5BC470 0%, #3DAE56 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "13px 0",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            letterSpacing: "0.2px",
            boxShadow: "0 4px 12px rgba(61,174,86,0.25)",
          }}
        >
          Bergabung
        </button>
      </div>
    </div>
  );
}

export interface OverlayJoinCardProps {
  title: string;
  usersRegistered: number;
  usersTotal: number;
  questionsCount: number;
  iconPath: string;
  difficulty?: "Mudah" | "Sedang" | "Sulit";
  bgColor?: string;
  onClose?: () => void;
}

export function OverlayJoinCard({
  title,
  usersRegistered,
  usersTotal,
  questionsCount,
  iconPath,
  difficulty,
  bgColor,
  onClose,
}: OverlayJoinCardProps) {
  const overlay = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Card */}
      <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <OverlayCardContent
          title={title}
          usersRegistered={usersRegistered}
          usersTotal={usersTotal}
          questionsCount={questionsCount}
          iconPath={iconPath}
          difficulty={difficulty}
          bgColor={bgColor}
          onClose={onClose}
        />
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}
