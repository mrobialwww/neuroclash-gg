import { User } from "@/app/types/User";

export interface Player extends User {
  health: number;
  maxHealth: number;
  isMe?: boolean;
}

export const MOCK_PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Budi_Gamer",
    character: "Slime",
    image: "/default/Slime.webp",
    health: 80,
    maxHealth: 100,
    isMe: true,
  },
  {
    id: "p2",
    name: "Yanto_Gamer",
    character: "Api Baskara",
    image: "/epic/Api%20Baskara.webp",
    health: 100,
    maxHealth: 100,
  },
  {
    id: "p3",
    name: "Griffin_Master",
    character: "Griffin",
    image: "/default/Griffin.webp",
    health: 50,
    maxHealth: 100,
  },
  {
    id: "p4",
    name: "Slimey_Pro",
    character: "Slime",
    image: "/default/Slime.webp",
    health: 20,
    maxHealth: 100,
  },
  {
    id: "p5",
    name: "Mecha_Warrior",
    character: "Mecha Blaze",
    image: "/legend/Mecha%20Blaze.webp",
    health: 95,
    maxHealth: 100,
  },
  {
    id: "p6",
    name: "Raden_D",
    character: "Raden Drakula",
    image: "/epic/Raden%20Drakula.webp",
    health: 100,
    maxHealth: 100,
  },
  {
    id: "p7",
    name: "Cyber_Batik",
    character: "Cyber Batik",
    image: "/epic/Cyber%20Batik.webp",
    health: 75,
    maxHealth: 100,
  },
  {
    id: "p8",
    name: "Roger_M",
    character: "Roger Malam",
    image: "/epic/Roger%20Malam.webp",
    health: 40,
    maxHealth: 100,
  },
];
