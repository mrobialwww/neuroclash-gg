import { create } from "zustand";
import {
  DEMO_QUESTIONS,
  DEMO_BOTS,
  DEMO_PROF_BUBU,
  DEMO_USER,
  DEMO_ROUND_SCRIPTS,
  DEMO_ABILITIES,
  DEMO_TOTAL_ROUNDS,
  DEMO_SECONDS_PER_ROUND,
  DEMO_STARBOX_TRIGGER_ROUND,
  calculateDemoDamage,
  DemoOption,
  DemoRoundScript,
} from "@/lib/constants/demo-data";

export interface DemoPlayerState {
  id: string;
  name: string;
  character: string;
  image: string;
  health: number;
  maxHealth: number;
  isMe: boolean;
  isBot: boolean;
  isAlive: boolean;
}

export interface BotSimResult {
  botId: string;
  name: string;
  isCorrect: boolean;
  delayMs: number;
}

export interface AbilityState {
  id: string;
  name: string;
  description: string;
  stock: number;
  image: string;
  emptyImage: string;
}

export interface ActiveBuff {
  id: string;
  name: string;
  type: "heal" | "attack" | "shield" | "material";
  image: string;
  label: string;
  used: boolean;
  effectApplied: boolean;
}

type DemoPhase = "intro" | "lobby" | "battle" | "starbox" | "finished";

const OPPONENT_MAP: Record<number, string> = {
  2: "bot-budi",
  3: "bot-yanto",
  4: "bot-rina",
  5: "bot-budi",
};

const KITAB_HINTS: Record<number, string> = {
  5: "Petunjuk: Pertanyaan ini tentang sejarah Indonesia. Tanggal penting di bulan Agustus tahun 1945... bukan Sumpah Pemuda, bukan Hari Pahlawan, bukan Hari Kebangkitan Nasional. Cari opsi dengan tanggal 17 Agustus!",
};

interface DemoStore {
  phase: DemoPhase;
  currentRound: number;
  totalRounds: number;

  currentQuestionText: string;
  currentOptions: DemoOption[];
  selectedAnswerId: string | null;
  isCorrectAnswer: boolean | null;

  timeLeft: number;

  players: DemoPlayerState[];
  userPlayer: DemoPlayerState;
  botPlayers: DemoPlayerState[];

  currentOpponentId: string;

  roundScript: DemoRoundScript | null;
  botSimState: "idle" | "revealing" | "resolved";
  revealedBotIndex: number;
  botSimResults: BotSimResult[];
  damageApplied: boolean;
  roundResultMessage: string | null;

  tutorialMessage: string | null;
  showTutorialOverlay: boolean;

  showKitabHint: boolean;
  kitabHintText: string;

  abilities: AbilityState[];
  starboxTurnIndex: number;
  pickingAbilityId: string | null;
  allStarboxPicked: boolean;
  userPickedAbilityName: string | null;
  starboxProgress: number;

  activeBuffs: ActiveBuff[];
  attackBuffRounds: number;
  shieldBuffRounds: number;

  roundsWon: number;
  roundHistory: {
    round: number;
    opponentName: string;
    userCorrect: boolean;
    userTookDamage: boolean;
    damage: number;
  }[];

  trophyEarned: number;
  coinsEarned: number;

  resetStore: () => void;
  startGame: () => void;
  loadBattleRound: (round: number) => void;
  selectAnswer: (optionId: string) => void;
  revealNextBot: () => void;
  resolveRound: () => void;
  advanceToNext: () => void;
  selectAbility: (abilityId: string) => void;
  userSelectAbility: (abilityId: string) => void;
  nextStarboxTurn: () => void;
  finishStarboxAndContinue: () => void;
  useBuff: (buffId: string) => void;
  openKitab: () => void;
  closeKitab: () => void;
  finishTutorial: () => void;
  dismissTutorialOverlay: () => void;
  decrementTimer: () => void;
  setStarboxProgress: (progress: number) => void;
}

const createInitialPlayers = (): DemoPlayerState[] => {
  const user: DemoPlayerState = {
    id: DEMO_USER.id,
    name: DEMO_USER.name,
    character: DEMO_USER.character,
    image: DEMO_USER.image,
    health: 100,
    maxHealth: 100,
    isMe: true,
    isBot: false,
    isAlive: true,
  };

  const bots: DemoPlayerState[] = DEMO_BOTS.map((bot) => ({
    id: bot.id,
    name: bot.name,
    character: bot.character,
    image: bot.image,
    health: 100,
    maxHealth: 100,
    isMe: false,
    isBot: true,
    isAlive: true,
  }));

  return [user, ...bots];
};

const getInitialState = () => ({
  phase: "intro" as DemoPhase,
  currentRound: 0,
  totalRounds: DEMO_TOTAL_ROUNDS,
  currentQuestionText: "",
  currentOptions: [] as DemoOption[],
  selectedAnswerId: null as string | null,
  isCorrectAnswer: null as boolean | null,
  timeLeft: DEMO_SECONDS_PER_ROUND,
  players: createInitialPlayers(),
  userPlayer: createInitialPlayers()[0],
  botPlayers: createInitialPlayers().slice(1),
  currentOpponentId: "",
  roundScript: null as DemoRoundScript | null,
  botSimState: "idle" as "idle" | "revealing" | "resolved",
  revealedBotIndex: 0,
  botSimResults: [] as BotSimResult[],
  damageApplied: false,
  roundResultMessage: null as string | null,
  tutorialMessage: null as string | null,
  showTutorialOverlay: false,
  showKitabHint: false,
  kitabHintText: "",
  abilities: [...DEMO_ABILITIES],
  starboxTurnIndex: 0,
  pickingAbilityId: null as string | null,
  allStarboxPicked: false,
  userPickedAbilityName: null as string | null,
  starboxProgress: 0,
  activeBuffs: [] as ActiveBuff[],
  attackBuffRounds: 0,
  shieldBuffRounds: 0,
  roundsWon: 0,
  roundHistory: [] as {
    round: number;
    opponentName: string;
    userCorrect: boolean;
    userTookDamage: boolean;
    damage: number;
  }[],
  trophyEarned: 0,
  coinsEarned: 0,
});

function abilityToBuff(abilityId: string, abilityName: string): ActiveBuff[] {
  switch (abilityId) {
    case "1":
      return [
        {
          id: "buff-mat",
          name: abilityName,
          type: "material",
          image: "/buff/material.webp",
          label: "Materi",
          used: false,
          effectApplied: false,
        },
      ];
    case "2":
      return [
        {
          id: "buff-atk",
          name: abilityName,
          type: "attack",
          image: "/buff/attack.webp",
          label: "Attack",
          used: false,
          effectApplied: false,
        },
      ];
    case "3":
      return [
        {
          id: "buff-heal",
          name: abilityName,
          type: "heal",
          image: "/buff/heal.webp",
          label: "Heal",
          used: false,
          effectApplied: false,
        },
      ];
    case "4":
      return [
        {
          id: "buff-shield",
          name: abilityName,
          type: "shield",
          image: "/buff/attack.webp",
          label: "Shield",
          used: false,
          effectApplied: false,
        },
      ];
    default:
      return [];
  }
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  ...getInitialState(),

  resetStore: () => {
    set(getInitialState());
  },

  startGame: () => {
    const players = createInitialPlayers();
    set({
      ...getInitialState(),
      phase: "lobby",
      players,
      userPlayer: players[0],
      botPlayers: players.slice(1),
    });
  },

  loadBattleRound: (round: number) => {
    const state = get();
    const question = DEMO_QUESTIONS[round - 1];
    const script = DEMO_ROUND_SCRIPTS[round - 1];

    if (!question || !script) {
      set({ phase: "finished" });
      return;
    }

    let opponentId = "";
    if (script.isProfBubu) {
      opponentId = DEMO_PROF_BUBU.id;
    } else {
      opponentId = OPPONENT_MAP[round] ?? state.botPlayers[0].id;
    }

    set({
      phase: "battle",
      currentRound: round,
      currentQuestionText: question.text,
      currentOptions: question.options,
      selectedAnswerId: null,
      isCorrectAnswer: null,
      timeLeft: DEMO_SECONDS_PER_ROUND,
      roundScript: script,
      currentOpponentId: opponentId,
      botSimState: "idle",
      revealedBotIndex: 0,
      botSimResults: [],
      damageApplied: false,
      roundResultMessage: null,
      showKitabHint: false,
      kitabHintText: "",
      tutorialMessage: script.tutorialMessage ?? null,
      showTutorialOverlay: true,
    });
  },

  selectAnswer: (optionId: string) => {
    const state = get();
    if (state.selectedAnswerId || state.botSimState !== "idle") return;
    if (state.showTutorialOverlay || state.showKitabHint) return;

    const option = state.currentOptions.find((o) => o.id === optionId);
    const isCorrect = option?.isCorrect ?? false;

    set({
      selectedAnswerId: optionId,
      isCorrectAnswer: isCorrect,
      damageApplied: false,
    });

    setTimeout(() => {
      const s = get();
      if (s.roundScript?.isProfBubu) {
        const correct = s.currentOptions.find((o) => o.isCorrect);
        set({
          roundResultMessage: s.isCorrectAnswer
            ? "Bagus! Jawabanmu benar! \u2705"
            : `Jawaban yang benar adalah ${correct?.text ?? "-"}. Jangan khawatir, ini latihan!`,
        });
        setTimeout(() => get().advanceToNext(), 2000);
        return;
      }

      const script = s.roundScript;
      if (!script) return;
      const results = script.botScripts.map(bs => ({
        botId: bs.botId,
        name: s.botPlayers.find(b => b.id === bs.botId)?.name ?? "???",
        isCorrect: bs.isCorrect,
        delayMs: bs.delayMs,
      }));
      set({ botSimState: "resolved", botSimResults: results });
      setTimeout(() => get().resolveRound(), 800);
    }, 1500);
  },

  revealNextBot: () => {
    const state = get();
    if (!state.roundScript || state.botSimState !== "revealing") return;

    const script = state.roundScript;
    const currentBotIdx = state.revealedBotIndex;

    if (currentBotIdx >= script.botScripts.length) {
      get().resolveRound();
      return;
    }

    const botScript = script.botScripts[currentBotIdx];
    const bot = state.botPlayers.find((b) => b.id === botScript.botId);
    if (!bot) {
      get().resolveRound();
      return;
    }

    const updatedResults = [
      ...state.botSimResults,
      {
        botId: botScript.botId,
        name: bot.name,
        isCorrect: botScript.isCorrect,
        delayMs: botScript.delayMs,
      },
    ];

    set({
      botSimResults: updatedResults,
      revealedBotIndex: currentBotIdx + 1,
    });

    if (currentBotIdx + 1 >= script.botScripts.length) {
      setTimeout(() => get().resolveRound(), 600);
    }
  },

  resolveRound: () => {
    const state = get();
    if (state.damageApplied) return;

    const script = state.roundScript;
    if (!script) return;

    let baseDamage = calculateDemoDamage(state.currentRound);

    if (state.attackBuffRounds > 0) {
      baseDamage += 10;
      set((s) => ({ attackBuffRounds: s.attackBuffRounds - 1 }));
    }

    const shieldActive = state.shieldBuffRounds > 0;

    const userIsCorrect = state.isCorrectAnswer;

    let userTakesDamage = false;
    let userIsWinner = false;

    if (script.isProfBubu) {
      userIsWinner = userIsCorrect ?? false;
    } else {
      const anyBotCorrectFaster = state.botSimResults.some(
        (r) => r.isCorrect && r.delayMs < 1500
      );

      if (!userIsCorrect) {
        userTakesDamage = true;
      } else if (anyBotCorrectFaster) {
        userTakesDamage = true;
      } else {
        userIsWinner = true;
      }
    }

    const updatedPlayers = state.players.map((p) => {
      if (p.isMe) {
        if (!userTakesDamage) return p;
        const dmg = shieldActive ? Math.floor(baseDamage * 0.5) : baseDamage;
        const newHealth = Math.max(0, p.health - dmg);
        return { ...p, health: newHealth, isAlive: newHealth > 0 };
      }

      const botResult = state.botSimResults.find((r) => r.botId === p.id);
      if (!botResult) return p;

      let botTakesDamage = false;
      if (!botResult.isCorrect) {
        botTakesDamage = true;
      } else if (userIsCorrect && userIsWinner) {
        botTakesDamage = true;
      }

      const newHealth = botTakesDamage
        ? Math.max(0, p.health - baseDamage)
        : p.health;
      return { ...p, health: newHealth, isAlive: newHealth > 0 };
    });

    if (shieldActive) {
      set((s) => ({ shieldBuffRounds: s.shieldBuffRounds - 1 }));
    }

    const sorted = [...updatedPlayers].sort((a, b) => b.health - a.health);

    const foundOpponent = state.players.find(
      (p) => p.id === state.currentOpponentId
    );
    const opponentName = foundOpponent?.name ?? "???";

    const userDamage = userTakesDamage
      ? shieldActive
        ? Math.floor(baseDamage * 0.5)
        : baseDamage
      : 0;

    let shieldDetail = "";
    if (shieldActive && userTakesDamage) {
      shieldDetail = ` (Perisai: -50% = ${userDamage} damage)`;
    }

    let atkDetail = "";
    if (state.attackBuffRounds >= 0 && userIsWinner) {
      atkDetail = ` +10 bonus = ${baseDamage}`;
    }

    let message: string;
    const allBotsDead = sorted
      .filter((p) => p.isBot)
      .every((p) => !p.isAlive);

    if (allBotsDead && script.gameOverMessage) {
      message = script.gameOverMessage;
    } else if (script.isProfBubu) {
      message = userIsCorrect
        ? "Latihan selesai! Siap untuk battle selanjutnya."
        : "Tidak apa-apa! Ini hanya latihan.";
    } else {
      message = userIsWinner
        ? `Kamu benar & tercepat! +0 damage. ${baseDamage}${atkDetail} damage untuk lawan.${shieldDetail}`
        : `Kamu kena ${userDamage} damage! ${
            userTakesDamage
              ? "Jawabanmu salah atau kurang cepat."
              : ""
          }`;
    }

    const newHistory = [
      ...state.roundHistory,
      {
        round: state.currentRound,
        opponentName,
        userCorrect: userIsCorrect ?? false,
        userTookDamage: userTakesDamage,
        damage: userDamage || baseDamage,
      },
    ];

    set({
      players: sorted,
      userPlayer:
        sorted.find((p) => p.isMe) ?? state.userPlayer,
      botPlayers: sorted.filter((p) => p.isBot),
      damageApplied: true,
      botSimState: "resolved",
      roundResultMessage: message,
      roundsWon: userIsWinner ? state.roundsWon + 1 : state.roundsWon,
      roundHistory: newHistory,
    });

    setTimeout(() => {
      if (allBotsDead) {
        get().finishTutorial();
      } else {
        get().advanceToNext();
      }
    }, 2500);
  },

  advanceToNext: () => {
    const state = get();

    if (state.currentRound === DEMO_STARBOX_TRIGGER_ROUND) {
      set({
        phase: "starbox",
        abilities: DEMO_ABILITIES.map((a) => ({ ...a })),
        starboxTurnIndex: 0,
        pickingAbilityId: null,
        allStarboxPicked: false,
        showTutorialOverlay: true,
        tutorialMessage: null,
      });
      return;
    }

    if (state.currentRound >= DEMO_TOTAL_ROUNDS) {
      set({ phase: "finished" });
      return;
    }

    const nextRound = state.currentRound + 1;
    get().loadBattleRound(nextRound);
  },

  selectAbility: (abilityId: string) => {
    set((state) => ({
      abilities: state.abilities.map((a) =>
        a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a
      ),
    }));
  },

  userSelectAbility: (abilityId: string) => {
    set((state) => ({
      pickingAbilityId: abilityId,
      userPickedAbilityName:
        state.abilities.find((a) => a.id === abilityId)?.name ?? null,
      abilities: state.abilities.map((a) =>
        a.id === abilityId && a.stock > 0 ? { ...a, stock: a.stock - 1 } : a
      ),
    }));
  },

  nextStarboxTurn: () => {
    set((state) => {
      const nextIndex = state.starboxTurnIndex + 1;
      const sortedPlayers = [...state.players].sort(
        (a, b) => a.health - b.health
      );
      const allPicked = nextIndex >= sortedPlayers.length;
      return {
        starboxTurnIndex: nextIndex,
        pickingAbilityId: null,
        allStarboxPicked: allPicked,
      };
    });
  },

  finishStarboxAndContinue: () => {
    const state = get();
    const abilityName = state.userPickedAbilityName;
    if (!abilityName) {
      set({ activeBuffs: [], attackBuffRounds: 0, shieldBuffRounds: 0 });
      get().loadBattleRound(DEMO_STARBOX_TRIGGER_ROUND + 1);
      return;
    }

    const pickedAbility = DEMO_ABILITIES.find((a) => a.name === abilityName);
    const pickedId = pickedAbility?.id;
    const buffs = pickedId ? abilityToBuff(pickedId, abilityName) : [];

    set({
      activeBuffs: buffs,
      attackBuffRounds: 0,
      shieldBuffRounds: 0,
      showKitabHint: false,
      kitabHintText: "",
    });

    get().loadBattleRound(DEMO_STARBOX_TRIGGER_ROUND + 1);
  },

  useBuff: (buffId: string) => {
    const state = get();

    if (state.botSimState !== "idle") return;
    if (state.showTutorialOverlay) return;

    const buff = state.activeBuffs.find((b) => b.id === buffId);
    if (!buff || buff.used) return;

    if (buff.type === "material") {
      const hint = KITAB_HINTS[state.currentRound] ?? "";
      set({
        showKitabHint: true,
        kitabHintText: hint,
        activeBuffs: state.activeBuffs.map((b) =>
          b.id === buffId ? { ...b, used: true, effectApplied: true } : b
        ),
      });
      return;
    }

    const updatedBuffs = state.activeBuffs.map((b) =>
      b.id === buffId ? { ...b, used: true, effectApplied: true } : b
    );

    let newHealth = state.userPlayer.health;
    let atkRounds = state.attackBuffRounds;
    let shdRounds = state.shieldBuffRounds;

    switch (buff.type) {
      case "heal":
        newHealth = Math.min(100, state.userPlayer.health + 20);
        break;
      case "attack":
        atkRounds = 1;
        break;
      case "shield":
        shdRounds = 1;
        break;
    }

    const updatedUser = { ...state.userPlayer, health: newHealth };
    const updatedPlayers = state.players.map((p) =>
      p.isMe ? { ...p, health: newHealth } : p
    );

    set({
      activeBuffs: updatedBuffs,
      userPlayer: updatedUser,
      players: updatedPlayers,
      attackBuffRounds: atkRounds,
      shieldBuffRounds: shdRounds,
    });
  },

  openKitab: () => {
    const hint = KITAB_HINTS[get().currentRound] ?? "";
    set({ showKitabHint: true, kitabHintText: hint });
  },

  closeKitab: () => {
    set({ showKitabHint: false, kitabHintText: "" });
  },

  finishTutorial: () => {
    const state = get();
    const finalUser = state.players.find((p) => p.isMe);
    const userHealth = finalUser?.health ?? 100;

    const trophyBase = userHealth * 5 + state.roundsWon * 10;
    const coinBase = userHealth * 2 + state.roundsWon * 5;
    const trophyMul = state.userPickedAbilityName?.includes("PIALA")
      ? 1.05
      : 1;
    const coinMul = state.userPickedAbilityName?.includes("KANTONG")
      ? 1.05
      : 1;

    const placements = [...state.players]
      .sort((a, b) => b.health - a.health)
      .map((p, i) => ({ ...p, placement: i + 1 }));

    set({
      phase: "finished",
      botSimState: "idle",
      showKitabHint: false,
      players: placements,
      userPlayer:
        placements.find((p) => p.isMe) ?? state.userPlayer,
      botPlayers: placements.filter((p) => p.isBot),
      trophyEarned: Math.floor(trophyBase * trophyMul),
      coinsEarned: Math.floor(coinBase * coinMul),
    });
  },

  dismissTutorialOverlay: () => {
    set({ showTutorialOverlay: false });
  },

  decrementTimer: () => {
    const state = get();
    if (
      state.phase !== "battle" ||
      state.selectedAnswerId ||
      state.botSimState !== "idle" ||
      state.showTutorialOverlay ||
      state.showKitabHint
    )
      return;

    if (state.timeLeft <= 1) {
      set({ timeLeft: 0 });
      return;
    }
    set({ timeLeft: state.timeLeft - 1 });
  },

  setStarboxProgress: (progress: number) => {
    set({ starboxProgress: progress });
  },
}));
