"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { MainButton } from "@/components/common/MainButton";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { QuestionCard } from "@/components/match/QuestionCard";
import { PlayerList } from "@/components/match/PlayerList";
import { PlayerCard } from "@/components/match/PlayerCard";
import { PlayerGridCard } from "@/components/match/PlayerGridCard";
import { AbilityCard } from "@/components/match/AbilityCard";
import { cn } from "@/lib/utils/utils";

import { useDemoStore, DemoPlayerState, ActiveBuff } from "@/store/useDemoStore";
import {
  TUTORIAL_MESSAGES,
  DEMO_PROF_BUBU,
  DEMO_TOTAL_ROUNDS,
  DEMO_SECONDS_PER_ROUND,
} from "@/lib/constants/demo-data";

function TIcon() {
  return <>{String.fromCodePoint(0x1F3C6)}</>;
}
function CIcon() {
  return <>{String.fromCodePoint(0x1F4B0)}</>;
}
function StarIcon() {
  return <>{String.fromCodePoint(0x1F31F)}</>;
}
function BookIcon() {
  return <>{String.fromCodePoint(0x1F4D6)}</>;
}
function GameIcon() {
  return <>{String.fromCodePoint(0x1F3AE)}</>;
}
function Check() {
  return <>{String.fromCodePoint(0x2705)}</>;
}
function Cross() {
  return <>{String.fromCodePoint(0x274C)}</>;
}

function TutorialOverlay({
  message,
  onDismiss,
  title,
}: {
  message: string;
  onDismiss: () => void;
  title?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1B23] border border-white/20 rounded-2xl p-6 md:p-8 max-w-md w-full text-center space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        {title && (
          <h2 className="text-white text-xl font-extrabold">{title}</h2>
        )}
        <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm md:text-base">
          {message}
        </p>
        <MainButton
          variant="green"
          hasShadow
          className="px-8 py-3 text-base font-bold rounded-xl"
          onClick={onDismiss}
        >
          Mengerti!
        </MainButton>
      </div>
    </div>
  );
}

function KitabOverlay({ hint, onDismiss }: { hint: string; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1B23] border border-[#FFCC00]/40 rounded-2xl p-6 md:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
        <p className="text-5xl"><BookIcon /></p>
        <h2 className="text-white text-xl font-extrabold">Kitab Pengetahuan</h2>
        <div className="bg-[#0B0D14] border border-[#FFCC00]/20 rounded-xl p-4">
          <p className="text-white/80 leading-relaxed text-sm">{hint}</p>
        </div>
        <p className="text-white/50 text-xs">Gunakan petunjuk ini untuk menjawab soal!</p>
        <MainButton variant="green" hasShadow className="px-8 py-3 text-base font-bold rounded-xl" onClick={onDismiss}>
          Tutup Kitab
        </MainButton>
      </div>
    </div>
  );
}

function PlayerResultLine({
  playerName,
  isCorrect,
  delayMs,
  revealed,
}: {
  playerName: string;
  isCorrect: boolean;
  delayMs: number;
  revealed: boolean;
}) {
  if (!revealed) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-xs md:text-sm animate-pulse">
        <span className="w-3 h-3 rounded-full border border-white/30" />
        <span>{playerName}: berpikir...</span>
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-2 text-xs md:text-sm transition-all duration-300", isCorrect ? "text-green-400" : "text-red-400")}>
      <span className="text-base">{isCorrect ? <Check /> : <Cross />}</span>
      <span>{playerName}: {isCorrect ? "Benar" : "Salah"} ({(delayMs / 1000).toFixed(1)}s)</span>
    </div>
  );
}

function DemoBuffItem({ buff, onClick }: { buff: ActiveBuff; onClick: () => void }) {
  return (
    <motion.div
      whileHover={buff.used ? undefined : { scale: 1.05 }}
      whileTap={buff.used ? undefined : { scale: 0.95 }}
      onClick={buff.used ? undefined : onClick}
      className={cn("flex flex-col items-center justify-center gap-1 transition-all", buff.used ? "opacity-40 cursor-default" : "cursor-pointer group")}
    >
      <div className="relative w-12 h-12 md:w-14 md:h-14">
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 blur-xl rounded-full transition-all duration-300" />
        <Image src={buff.image} alt={buff.name} fill sizes="56px" className="object-contain relative z-10 drop-shadow-md" />
      </div>
      <span className="text-white font-semibold text-xs md:text-sm text-center">{buff.label}</span>
      {buff.used ? <span className="text-green-400 text-[10px]">Terpakai</span> : <span className="text-white/50 text-[10px]">Klik untuk pakai</span>}
    </motion.div>
  );
}

function DemoBuffPanel({ buffs, onUse, className }: { buffs: ActiveBuff[]; onUse: (id: string) => void; className?: string }) {
  return (
    <div className={cn("relative w-full p-2 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10 shadow-2xl flex flex-col items-center", className)}>
      <div className="relative w-full max-w-[180px] h-[35px] md:h-[40px] shrink-0 flex items-center justify-center mb-3">
        <Image src="/match/match-badge.webp" alt="Badge" fill sizes="180px" className="object-contain" priority />
        <h2 className="relative z-10 text-white font-semibold text-[10px] xs:text-xs md:text-base tracking-tight mt-0.5">Materi & Kekuatan</h2>
      </div>
      <div className="w-full flex-1 overflow-y-auto scrollbar-hide pb-2">
        <div className="grid gap-x-2 gap-y-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))" }}>
          {buffs.slice(0, 5).map((buff) => (
            <DemoBuffItem key={buff.id} buff={buff} onClick={() => onUse(buff.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchResultScreen() {
  const router = useRouter();
  const { players, userPlayer, roundsWon, trophyEarned, coinsEarned, userPickedAbilityName, roundHistory } = useDemoStore();
  const sortedPlayers = [...players].sort((a, b) => b.health - a.health);

  return (
    <main className="min-h-screen w-full bg-[#0B0D14] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg flex flex-col items-center space-y-6">
        <p className="text-6xl"><TIcon /></p>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold text-center">{TUTORIAL_MESSAGES.finished.title}</h1>
        <p className="text-white/60 text-base text-center">{TUTORIAL_MESSAGES.finished.message}</p>

        <div className="w-full bg-[#1A1B23]/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold text-base text-center">Klasemen Akhir</h3>
          <div className="space-y-2">
            {sortedPlayers.map((p, i) => (
              <div key={p.id} className={cn("flex items-center justify-between rounded-xl px-4 py-3", p.isMe ? "bg-[#3D79F3]/20 border border-[#3D79F3]/40" : "bg-white/5 border border-white/5", !p.isAlive && "opacity-60")}>
                <div className="flex items-center gap-3">
                  <span className={cn("w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0", i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-amber-700 text-white" : "bg-white/20 text-white/60")}>{i + 1}</span>
                  <span className="text-white font-semibold text-sm">{p.name}{p.isMe ? " (Kamu)" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!p.isAlive && <span className="text-red-400 text-xs font-bold">ELIMINASI</span>}
                  <span className={cn("font-bold text-sm", p.health > 50 ? "text-green-400" : p.health > 0 ? "text-yellow-400" : "text-red-400")}>HP: {p.health}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <h3 className="text-white font-bold text-sm text-center">Hasil Kamu</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-white text-xl font-extrabold">#{sortedPlayers.findIndex(p => p.isMe) + 1}</p><p className="text-white/50 text-xs">Peringkat</p></div>
              <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-green-400 text-xl font-extrabold">{userPlayer.health}</p><p className="text-white/50 text-xs">HP Tersisa</p></div>
              <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-[#3D79F3] text-xl font-extrabold">{roundsWon}/{DEMO_TOTAL_ROUNDS}</p><p className="text-white/50 text-xs">Ronde Menang</p></div>
              <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-[#FFCC00] text-xl font-extrabold truncate">{userPickedAbilityName ?? "-"}</p><p className="text-white/50 text-xs">Item StarBox</p></div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <h3 className="text-white font-bold text-sm text-center">Pendapatan</h3>
            <div className="flex gap-3">
              <div className="flex-1 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center"><p className="text-yellow-400 text-xl font-extrabold">+<TIcon /> {trophyEarned}</p><p className="text-white/50 text-[10px]">Trophy</p></div>
              <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center"><p className="text-amber-400 text-xl font-extrabold">+<CIcon /> {coinsEarned}</p><p className="text-white/50 text-[10px]">Koin</p></div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <h3 className="text-white font-bold text-sm text-center">Penjelasan Sistem</h3>
            <div className="space-y-2 text-left">
              <div className="flex gap-2 items-start"><span className="shrink-0 text-lg"><TIcon /></span><div><p className="text-white text-xs font-semibold">Trophy & Ranking</p><p className="text-white/50 text-[11px]">Trophy menentukan peringkatmu (Bronze {"\u2192"} Silver {"\u2192"} Gold {"\u2192"} Platinum {"\u2192"} Diamond). Semakin tinggi peringkat, semakin bergengsi akunmu.</p></div></div>
              <div className="flex gap-2 items-start"><span className="shrink-0 text-lg"><CIcon /></span><div><p className="text-white text-xs font-semibold">Koin & Skin</p><p className="text-white/50 text-[11px]">Koin digunakan untuk membeli karakter dan skin di toko. Skin memberikan tampilan unik dan skill khusus.</p></div></div>
              <div className="flex gap-2 items-start"><span className="shrink-0 text-lg"><StarIcon /></span><div><p className="text-white text-xs font-semibold">StarBox & Item</p><p className="text-white/50 text-[11px]">Item dari StarBox disimpan di panel kiri atas arena. Klik item untuk menggunakannya saat dibutuhkan.</p></div></div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="text-white/60 text-xs uppercase tracking-wider mb-2">Riwayat Ronde</h4>
            <div className="space-y-1">
              {roundHistory.map((h) => (
                <div key={h.round} className="flex justify-between text-xs text-white/50">
                  <span>Ronde {h.round} vs {h.opponentName}</span>
                  <span className={h.userCorrect ? "text-green-400" : "text-red-400"}>{h.userCorrect ? "Benar" : "Salah"}{h.userTookDamage ? ` (-${h.damage} HP)` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row w-full max-w-sm">
          <MainButton variant="green" hasShadow className="px-6 py-3 text-base font-bold rounded-xl flex-1" onClick={() => { useDemoStore.getState().resetStore(); router.push("/dashboard"); }}>{TUTORIAL_MESSAGES.finished.button1}</MainButton>
          <MainButton variant="white" className="px-6 py-3 text-base font-bold rounded-xl flex-1" onClick={() => { useDemoStore.getState().resetStore(); router.push("/dashboard"); }}>{TUTORIAL_MESSAGES.finished.button2}</MainButton>
        </div>
      </div>
    </main>
  );
}

export default function DemoPage() {
  const router = useRouter();

  const {
    phase, currentRound, currentQuestionText, currentOptions,
    selectedAnswerId, isCorrectAnswer, timeLeft, players, userPlayer, botPlayers,
    currentOpponentId, roundScript, botSimState,
    roundResultMessage, tutorialMessage, showTutorialOverlay,
    abilities, starboxTurnIndex, pickingAbilityId, allStarboxPicked, activeBuffs,
    showKitabHint, kitabHintText,
    resetStore, startGame, selectAnswer,
    selectAbility, nextStarboxTurn, userSelectAbility,
    finishStarboxAndContinue, useBuff, dismissTutorialOverlay, closeKitab, decrementTimer,
  } = useDemoStore();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const h = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);

  useEffect(() => {
    if (phase !== "battle") return;
    if (selectedAnswerId || botSimState !== "idle") return;
    if (showTutorialOverlay || showKitabHint) return;
    const t = setInterval(() => decrementTimer(), 1000);
    return () => clearInterval(t);
  }, [phase, selectedAnswerId, botSimState, showTutorialOverlay, showKitabHint, decrementTimer]);

  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase !== "starbox" || allStarboxPicked) return;
    if (showTutorialOverlay) return;
    const sortedByHp = [...players].sort((a, b) => a.health - b.health);
    const cp = sortedByHp[starboxTurnIndex];
    if (!cp || cp.isMe) return;
    const available = abilities.filter(a => a.stock > 0);
    if (available.length === 0) { nextStarboxTurn(); return; }

    botTimerRef.current = setTimeout(() => {
      const s = useDemoStore.getState();
      if (s.showTutorialOverlay) return;
      const avail = s.abilities.filter(a => a.stock > 0 && a.id !== "1");
      const pick = avail.length > 0 ? avail[Math.floor(Math.random() * avail.length)] : s.abilities.find(a => a.stock > 0)!;
      selectAbility(pick.id);
      setTimeout(() => {
        const s2 = useDemoStore.getState();
        if (s2.showTutorialOverlay) return;
        nextStarboxTurn();
      }, 1000);
    }, 2000);
    return () => { if (botTimerRef.current) clearTimeout(botTimerRef.current); };
  }, [phase, starboxTurnIndex, allStarboxPicked, showTutorialOverlay, players, abilities, selectAbility, nextStarboxTurn]);

  useEffect(() => {
    if (!allStarboxPicked) return;
    const t = setTimeout(() => finishStarboxAndContinue(), 1500);
    return () => clearTimeout(t);
  }, [allStarboxPicked, finishStarboxAndContinue]);

  const getOpponent = (): DemoPlayerState | null => {
    if (!currentOpponentId) return null;
    if (currentOpponentId === DEMO_PROF_BUBU.id) {
      return { id: DEMO_PROF_BUBU.id, name: DEMO_PROF_BUBU.name, character: DEMO_PROF_BUBU.character, image: DEMO_PROF_BUBU.image, health: 100, maxHealth: 100, isMe: false, isBot: false, isAlive: true };
    }
    const found = players.find(p => p.id === currentOpponentId);
    return found ?? botPlayers[0];
  };

  const opponent = getOpponent();
  const isProfBubuRound = roundScript?.isProfBubu ?? false;

  const DEMO_STEPS = [
    { id: "book", icon: "/icons/book.svg" },
    { id: "battle-1", icon: "/icons/battle.svg" },
    { id: "battle-2", icon: "/icons/battle.svg" },
    { id: "battle-3", icon: "/icons/battle.svg" },
    { id: "treasure", icon: "/icons/treasure.svg" },
    { id: "battle-4", icon: "/icons/battle.svg" },
  ];

  const activeStepIndex = phase === "starbox" ? 4 : phase === "battle" && currentRound >= 5 ? 5 : currentRound - 1;

  const handleExit = () => { resetStore(); router.push("/dashboard"); };

  // --- INTRO ---
  if (phase === "intro") {
    return (
      <main className="min-h-screen w-full bg-[#0B0D14] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-6 max-w-lg text-center">
          <p className="text-6xl"><GameIcon /></p>
          <h1 className="text-white text-3xl font-extrabold">{TUTORIAL_MESSAGES.intro.title}</h1>
          <p className="text-white/60 text-lg">{TUTORIAL_MESSAGES.intro.subtitle}</p>
          <div className="bg-[#1A1B23]/80 border border-white/10 rounded-2xl p-5 w-full space-y-2 text-left">
            {TUTORIAL_MESSAGES.intro.items.map((item, i) => (
              <p key={i} className="text-white/70 text-sm flex gap-2"><span className="text-[#3D79F3] shrink-0">{i + 1}.</span>{item}</p>
            ))}
          </div>
          <MainButton variant="green" hasShadow className="px-10 py-4 text-lg font-bold rounded-xl" onClick={startGame}>{TUTORIAL_MESSAGES.intro.buttonLabel}</MainButton>
        </div>
      </main>
    );
  }

  // --- LOBBY ---
  if (phase === "lobby") {
    return (
      <main className="min-h-screen w-full bg-[#0B0D14] flex flex-col items-center justify-center px-4 py-8 relative">
        {showTutorialOverlay && <TutorialOverlay message={TUTORIAL_MESSAGES.lobby} onDismiss={dismissTutorialOverlay} />}
        <div className="flex flex-col items-center space-y-8 max-w-2xl w-full">
          <div className="text-center space-y-2">
            <h1 className="text-white text-2xl font-extrabold">Room Tutorial</h1>
            <p className="text-white/50 text-sm bg-white/10 inline-block px-3 py-1 rounded-full border border-white/10">Kode: NEURO-DEMO</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {players.map(p => (
              <PlayerGridCard key={p.id} player={{ id: p.id, name: p.name, character: p.character, image: p.image, health: p.health, maxHealth: p.maxHealth, isMe: p.isMe }} lobbyMode hideHealthBar />
            ))}
          </div>
          <div className="text-center space-y-1">
            <p className="text-white/60 text-sm">4 pemain siap &bull; Maks. 40 pemain di mode sungguhan</p>
            <p className="text-white/40 text-xs">Hanya Host yang bisa memulai pertandingan</p>
          </div>
          <MainButton variant="green" hasShadow className="px-10 py-4 text-lg font-bold rounded-xl" onClick={() => { dismissTutorialOverlay(); useDemoStore.getState().loadBattleRound(1); }}>Mulai Pertandingan</MainButton>
        </div>
      </main>
    );
  }

  // --- STARBOX ---
  if (phase === "starbox") {
    const sortedHpPlayers = [...players].sort((a, b) => a.health - b.health);
    const cp = sortedHpPlayers[starboxTurnIndex];
    const isUserTurn = cp?.isMe ?? false;
    const remainingItems = abilities.reduce((sum, a) => sum + a.stock, 0);

    return (
      <main className="min-h-screen w-full bg-[#0B0D14] flex flex-col items-center py-6 px-4 md:px-8 relative overflow-x-hidden">
        {showTutorialOverlay && (
          <TutorialOverlay title={<StarIcon /> + " STARBOX"} message={TUTORIAL_MESSAGES.starbox} onDismiss={dismissTutorialOverlay} />
        )}

        <div className="z-10 w-full max-w-[1400px] flex flex-col items-center gap-8 pb-8">
          <header className="w-full flex items-center justify-between mb-2">
            <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-3 py-1.5 rounded-lg font-semibold text-white text-sm">NEURO-DEMO</div>
            <div className="flex-1 flex justify-center gap-2 sm:gap-4 px-4">
              {["book", "battle", "battle", "battle", "battle", "battle", "treasure"].map((name, idx) => (
                <div key={idx} className={cn("relative h-5 w-5 md:h-6 md:w-6 transition-all duration-500 flex items-center justify-center", idx === 6 ? "text-[#FFCC00]" : "text-white/40")}>
                  <div className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] bg-current" style={{ maskImage: `url(/icons/${name}.svg)`, WebkitMaskImage: `url(/icons/${name}.svg)`, maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center", maskSize: "contain", WebkitMaskSize: "contain" }} />
                </div>
              ))}
            </div>
            <MainButton variant="white" className="px-3 h-8 text-sm shrink-0" onClick={handleExit}>Keluar</MainButton>
          </header>

          <div className="flex flex-col items-center text-center">
            <h1 className="text-white text-xl md:text-2xl font-bold">Takdir ada di tanganmu, pilih satu kekuatan!</h1>
            {!allStarboxPicked && cp && (
              <p className="mt-2 text-white/80 font-medium text-lg">
                Giliran: <span className={isUserTurn ? "text-[#22C55E]" : "text-[#FFCB66]"}>{isUserTurn ? "Kamu" : cp.name}</span>
                <span className="text-white/60 text-sm ml-2">(HP terendah memilih lebih awal)</span>
              </p>
            )}
            <p className="mt-2 text-white/60 font-semibold text-sm bg-white/10 px-4 py-1.5 rounded-full border border-white/10">Sisa Item: <span className="text-white">{remainingItems}</span></p>
          </div>

          {isUserTurn && !allStarboxPicked && (
            <p className="text-[#FFCC00] text-sm font-semibold animate-pulse">Ini giliranmu! Pilih <strong>KITAB PENGETAHUAN</strong> — item paling OP untuk ronde final!</p>
          )}

          <div className={cn("flex flex-wrap justify-center items-center gap-3 w-full mx-auto", !isUserTurn && !allStarboxPicked ? "pointer-events-none opacity-90" : "")}>
            {abilities.map(a => (
              <div key={a.id} className="w-[160px] md:w-[180px] shrink-0">
                <AbilityCard name={a.name} description={a.description} image={a.image} emptyImage={a.emptyImage} stock={a.stock}
                  onClick={() => {
                    if (!isUserTurn || pickingAbilityId) return;
                    userSelectAbility(a.id);
                    setTimeout(() => nextStarboxTurn(), 1000);
                  }}
                  className={cn(a.id === "1" ? "ring-2 ring-[#FFCC00] ring-offset-2 ring-offset-transparent rounded-lg" : "", pickingAbilityId === a.id ? "scale-105 saturate-150 ring-2 ring-white rounded-lg" : "")}
                />
              </div>
            ))}
          </div>

          <div className="w-full mt-4 py-6 px-4 rounded-2xl bg-[#D9D9D9]/20 backdrop-blur-md border-2 border-white/10">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-x-4 gap-y-6 justify-items-center">
              {sortedHpPlayers.map((player, idx) => {
                const isActiveTurn = starboxTurnIndex === idx;
                const hasPicked = idx < starboxTurnIndex;
                return (
                  <div key={`${player.id}-${idx}`} className="relative">
                    <PlayerGridCard player={{ id: player.id, name: player.name, character: player.character, image: player.image, health: player.health, maxHealth: player.maxHealth, isMe: player.isMe }} hideHealthBar
                      className={cn("transition-all duration-300", isActiveTurn ? "scale-110 drop-shadow-[0_0_15px_rgba(255,204,0,0.8)]" : "", hasPicked ? "opacity-50 grayscale" : "")} />
                    {isActiveTurn && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFCC00] rotate-45 border-2 border-white shadow-lg animate-bounce" />}
                  </div>
                );
              })}
            </div>
          </div>

          {allStarboxPicked && <p className="text-white/60 animate-pulse">Semua telah memilih! Melanjutkan ke ronde final...</p>}
        </div>
      </main>
    );
  }

  // --- FINISHED ---
  if (phase === "finished") return <MatchResultScreen />;

  // --- BATTLE ---
  const mapToCard = (p: DemoPlayerState) => ({ id: p.id, name: p.name, character: p.character, image: p.image, health: p.health, maxHealth: p.maxHealth });
  const meCard = mapToCard(userPlayer);
  const oppCard = opponent ? mapToCard(opponent) : null;
  const playerListData = players.map(p => ({ id: p.id, name: p.name, character: p.character, image: p.image, health: p.health, maxHealth: p.maxHealth, isMe: p.isMe }));

  return (
    <main className="min-h-screen w-full bg-[#0B0D14] px-4 sm:px-8 md:px-12 py-6 gap-4 flex flex-col items-center overflow-x-hidden">
      {showKitabHint && <KitabOverlay hint={kitabHintText} onDismiss={closeKitab} />}
      {showTutorialOverlay && tutorialMessage && <TutorialOverlay title={roundScript?.title} message={tutorialMessage} onDismiss={dismissTutorialOverlay} />}

      <header className="w-full max-w-[1400px] flex items-center justify-between mb-2">
        <div className="bg-[#A6A6A6]/40 backdrop-blur-xl px-2 md:px-4 lg:px-6 py-1.5 rounded-lg font-semibold text-white text-sm md:text-base">NEURO-DEMO</div>
        <div className="flex-1 block px-2 md:px-4 lg:px-10">
          <MatchProgressBar key={`round-${currentRound}`} duration={DEMO_SECONDS_PER_ROUND} timeLeft={timeLeft} activeStepIndex={activeStepIndex} steps={DEMO_STEPS} />
        </div>
        <MainButton variant="white" className="px-2 md:px-4 lg:px-6 h-8 lg:h-9 text-sm md:text-base shrink-0" onClick={handleExit}>Keluar</MainButton>
      </header>

      <p className="text-white/50 text-sm font-medium">Soal {currentRound} / {DEMO_TOTAL_ROUNDS}</p>

      <div className="flex-1 w-full flex justify-center items-start">
        <div className="w-full max-w-[1400px] grid grid-cols-2 lg:grid-cols-[210px_minmax(600px,1fr)_210px] gap-x-4 gap-y-6 md:gap-6 items-stretch">
          {/* LEFT: User + Buff panel */}
          <div className="order-1 lg:order-1 flex flex-col justify-start lg:justify-between self-stretch">
            <div className="hidden lg:block max-h-[320px] overflow-hidden">
              {activeBuffs.length > 0 ? <DemoBuffPanel buffs={activeBuffs} onUse={useBuff} className="h-full" /> : null}
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              <PlayerCard player={meCard} isMe className="w-full" />
            </div>
          </div>

          {/* RIGHT: Opponent + Player list */}
          <div className="order-2 lg:order-3 flex flex-col justify-start lg:justify-between items-end lg:items-stretch self-stretch">
            <div className="hidden lg:block max-h-[320px] overflow-hidden">
              <PlayerList players={playerListData} className="h-full" />
            </div>
            <div className="w-full max-w-[320px] lg:max-w-none">
              {oppCard && (
                <PlayerCard player={oppCard} isMe={false} hideHealthBar={isProfBubuRound} className="w-full" />
              )}
            </div>

            {roundResultMessage && botSimState === "resolved" && (
              <div className={cn("w-full mt-3 rounded-xl px-3 py-2 text-center font-bold text-xs md:text-sm transition-all",
                isCorrectAnswer ? "bg-green-500/20 border border-green-500/40 text-green-300" :
                selectedAnswerId ? "bg-red-500/20 border border-red-500/40 text-red-300" :
                "bg-yellow-500/20 border border-yellow-500/40 text-yellow-300")}>{roundResultMessage}</div>
            )}
          </div>

          {/* CENTER: Question */}
          <div className="col-span-2 lg:col-span-1 order-3 lg:order-2 flex flex-col mt-2 lg:mt-0 isolate">
            <QuestionCard
              question={currentQuestionText}
              options={currentOptions.map(o => ({ id: o.id, label: o.key, text: o.text }))}
              onSelect={selectAnswer}
              selectedId={selectedAnswerId}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
