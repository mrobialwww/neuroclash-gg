import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const COST_CHARACTER = 2500;
const COST_SKIN_EPIC = 7500;
const COST_SKIN_LEGEND = 15000;

const BASE_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/characters`;

const charactersData = [
  {
    name: "Slime",
    skins: [{ name: "Juragan Slime", level: "epic" as const }],
  },
  {
    name: "Robot",
    skins: [{ name: "Cyber Batik", level: "epic" as const }],
  },
  {
    name: "Api",
    skins: [
      { name: "Api Baskara", level: "epic" as const },
      { name: "Mecha Blaze", level: "legend" as const },
    ],
  },
  {
    name: "Air",
    skins: [
      { name: "Tirta Lurik", level: "epic" as const },
      { name: "Akuatron", level: "legend" as const },
    ],
  },
  {
    name: "Hantu",
    skins: [
      { name: "Jurig Peci", level: "epic" as const },
      { name: "Agen Hantu", level: "legend" as const },
    ],
  },
  {
    name: "Golem",
    skins: [{ name: "Batu Pendekar", level: "epic" as const }],
  },
  {
    name: "Awan",
    skins: [{ name: "Mega Mendung", level: "epic" as const }],
  },
  {
    name: "Jamur",
    skins: [{ name: "Raden Jamur", level: "epic" as const }],
  },
  {
    name: "Alien",
    skins: [{ name: "Alien Nyasar", level: "epic" as const }],
  },
  {
    name: "Bulu",
    skins: [{ name: "Bulu Dalang", level: "epic" as const }],
  },
  {
    name: "Naga",
    skins: [{ name: "Naga Pusaka", level: "epic" as const }],
  },
  {
    name: "Griffin",
    skins: [{ name: "Griffin Garuda", level: "epic" as const }],
  },
  {
    name: "Phoenix",
    skins: [{ name: "Srikandi", level: "epic" as const }],
  },
  {
    name: "Yeti",
    skins: [{ name: "Yeti Petapa", level: "epic" as const }],
  },
  {
    name: "Peri",
    skins: [{ name: "Peri Jelita", level: "epic" as const }],
  },
  {
    name: "Unicorn",
    skins: [{ name: "Kuda Kencana", level: "epic" as const }],
  },
  {
    name: "Serigala",
    skins: [{ name: "Roger Malam", level: "epic" as const }],
  },
  {
    name: "Vampir",
    skins: [{ name: "Raden Drakula", level: "epic" as const }],
  },
];

const encodeUrl = (path: string) => {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
};

const seedData = async () => {
  console.log("Cleaning up existing data...");

  // Hapus skin dulu (karena dia merujuk ke character_id)
  const { error: skinDeleteError } = await supabase
    .from("skin")
    .delete()
    .gt("skin_id", 0); // Menghapus semua ID > 0

  if (skinDeleteError) {
    console.error("Error deleting skins:", skinDeleteError.message);
  } else {
    console.log("Existing skins cleared.");
  }

  // Baru hapus characters
  const { error: charDeleteError } = await supabase
    .from("characters")
    .delete()
    .gt("character_id", 0);

  if (charDeleteError) {
    console.error("Error deleting characters:", charDeleteError.message);
  } else {
    console.log("Existing characters cleared.");
  }

  console.log("Start seeding characters and skins...");

  for (const char of charactersData) {
    const charImageUrl = `${BASE_STORAGE_URL}/default/${char.name}.webp`;

    const { data: charResult, error: charError } = await supabase
      .from("characters")
      .insert({
        character_name: char.name,
        image_url: charImageUrl,
        cost: COST_CHARACTER,
      })
      .select()
      .single();

    if (charError) {
      console.error(`Error seeding character ${char.name}:`, charError.message);
      continue;
    }

    console.log(`Successfully seeded character: ${char.name}`);

    for (const skin of char.skins) {
      const skinImageUrl = `${BASE_STORAGE_URL}/${skin.level}/${encodeURIComponent(skin.name)}.webp`;
      const cost = skin.level === "epic" ? COST_SKIN_EPIC : COST_SKIN_LEGEND;

      const { error: skinError } = await supabase.from("skin").insert({
        character_id: charResult.character_id,
        skin_name: skin.name,
        skin_level: skin.level,
        image_url: skinImageUrl,
        cost: cost,
      });

      if (skinError) {
        console.error(
          `Error seeding skin ${skin.name} for ${char.name}:`,
          skinError.message,
        );
      } else {
        console.log(
          `  - Successfully seeded skin: ${skin.name} (${skin.level})`,
        );
      }
    }
  }

  console.log("\nSeeding finished!");
};

seedData();
