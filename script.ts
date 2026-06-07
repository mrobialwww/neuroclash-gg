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

const COST_DEFAULT = 2500;
const COST_EPIC = 7500;
const COST_LEGEND = 15000;

const BASE_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/characters`;

const charactersData = [
  { base_character: "Slime", skin_name: "Slime", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Slime", skin_name: "Juragan Slime", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Robot", skin_name: "Robot", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Robot", skin_name: "Cyber Batik", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Api", skin_name: "Api", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Api", skin_name: "Api Baskara", skin_level: "epic", cost: COST_EPIC },
  { base_character: "Api", skin_name: "Mecha Blaze", skin_level: "legend", cost: COST_LEGEND },

  { base_character: "Air", skin_name: "Air", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Air", skin_name: "Tirta Lurik", skin_level: "epic", cost: COST_EPIC },
  { base_character: "Air", skin_name: "Akuatron", skin_level: "legend", cost: COST_LEGEND },

  { base_character: "Hantu", skin_name: "Hantu", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Hantu", skin_name: "Jurig Peci", skin_level: "epic", cost: COST_EPIC },
  { base_character: "Hantu", skin_name: "Agen Hantu", skin_level: "legend", cost: COST_LEGEND },

  { base_character: "Golem", skin_name: "Golem", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Golem", skin_name: "Batu Pendekar", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Awan", skin_name: "Awan", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Awan", skin_name: "Mega Mendung", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Jamur", skin_name: "Jamur", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Jamur", skin_name: "Raden Jamur", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Alien", skin_name: "Alien", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Alien", skin_name: "Alien Nyasar", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Bulu", skin_name: "Bulu", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Bulu", skin_name: "Bulu Dalang", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Naga", skin_name: "Naga", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Naga", skin_name: "Naga Pustaka", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Griffin", skin_name: "Griffin", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Griffin", skin_name: "Griffin Garuda", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Phoenix", skin_name: "Phoenix", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Phoenix", skin_name: "Srikandi", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Yeti", skin_name: "Yeti", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Yeti", skin_name: "Yeti Petapa", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Peri", skin_name: "Peri", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Peri", skin_name: "Peri Jelita", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Unicorn", skin_name: "Unicorn", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Unicorn", skin_name: "Kuda Kencana", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Serigala", skin_name: "Serigala", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Serigala", skin_name: "Roger Malam", skin_level: "epic", cost: COST_EPIC },

  { base_character: "Vampir", skin_name: "Vampir", skin_level: "default", cost: COST_DEFAULT },
  { base_character: "Vampir", skin_name: "Raden Drakula", skin_level: "epic", cost: COST_EPIC },
];

const seedData = async () => {
  console.log("Cleaning up existing data...");

  const { error: deleteError } = await supabase.from("characters").delete().gt("character_id", 0);

  if (deleteError) {
    console.error("Error deleting characters:", deleteError.message);
    process.exit(1);
  }

  console.log("Existing characters cleared.");
  console.log("Start seeding characters...");

  for (const [index, char] of charactersData.entries()) {
    // Skin default → folder /default/[base_character].webp
    // Skin epic/legend → folder /[skin_level]/[skin_name].webp
    const imageUrl =
      char.skin_level === "default"
        ? `${BASE_STORAGE_URL}/default/${encodeURIComponent(char.base_character)}.webp`
        : `${BASE_STORAGE_URL}/${char.skin_level}/${encodeURIComponent(char.skin_name)}.webp`;

    const { error } = await supabase.from("characters").insert({
      character_id: index + 1,
      base_character: char.base_character,
      skin_name: char.skin_name,
      skin_level: char.skin_level,
      cost: char.cost,
      image_url: imageUrl,
    });

    if (error) {
      console.error(`Error seeding ${char.skin_name}:`, error.message);
    } else {
      console.log(`✓ ${char.skin_level.toUpperCase()} - ${char.base_character} → ${char.skin_name}`);
    }
  }

  console.log("\nSeeding finished!");
};

seedData();
