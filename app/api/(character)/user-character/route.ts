/**
 * POST /api/user-character
 * http://localhost:3000/api/user-character
 *
 * Body:
 *   {
 *     "user_id": "c307f9dc-482f-4442-b566-97dbc258c0e8",
 *     "character_id": 2,
 *     "cost": 7500,
 *     "base_character": "Slime",
 *     "skin_level": "epic"
 *   }
 *
 * Fungsi:
 *   1. Menambahkan suatu baris record baru ke tabel user_characters dan sekaligus melakukan
 *      update tabel users menggunakan transactions
 *   2. Tujuan utamanya ketika ingin user ingin membeli suatu skin, maka akan dicek terlebih dahulu
 *      apakah user memiliki skin dengan skin_level = default terlebih dahulu?
 *      a. Jika iya maka skin yg baru dibeli akan dimasukkan ke tabel user_characters dan
 *         tabel users akan diupdate dengan mengurangi coin = coin - cost skin
 *      b. Jika tidak maka user tidak diperkenankan untuk membeli dan menambahkan skin
 *         yang bersangkutan ke dalam tabel user_characters
 */
import { NextResponse } from "next/server";
import { buyCharacter } from "@/services/shop/shopService.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { user_id, character_id, cost, coin, base_character, skin_level } =
      body;

    // Validate required fields
    if (
      !user_id ||
      character_id === undefined ||
      cost === undefined ||
      coin === undefined ||
      !base_character ||
      !skin_level
    ) {
      return NextResponse.json(
        { error: "Data tidak lengkap untuk melakukan pembelian" },
        { status: 400 }
      );
    }

    // Panggil service yang menangani logic & validasi
    await buyCharacter({
      userId: user_id,
      characterId: character_id,
      cost,
      coin,
      baseCharacter: base_character,
      skinLevel: skin_level,
    });

    return NextResponse.json({
      message: "Berhasil melakukan pembelian karakter baru",
    });
  } catch (error: any) {
    console.error("API Error [POST /api/user-character]:", error);

    // Check if it's a known error from the service
    const status =
      error.message &&
      (error.message.includes("Coin") || error.message.includes("default"))
        ? 400
        : 500;

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}
