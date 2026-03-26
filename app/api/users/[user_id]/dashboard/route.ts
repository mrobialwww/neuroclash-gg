/**
 * GET /api/users/[user_id]/dashboard
 * http://localhost:3000/api/users/c307f9dc-482f-4442-b566-97dbc258c0e8/dashboard
 *
 * Fungsi:
 *   1. Mendapatkan data dashboard untuk user (user info, rank, active character)
 *   2. Tujuan utamanya ketika dashboard page ingin mendapatkan data user
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const supabase = await createClient();

    const { user_id } = await params;

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("username, coin, total_trophy")
      .eq("user_id", user_id)
      .single();

    if (userError || !user) {
      console.error("Supabase Error fetching user:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get rank based on trophy
    const { data: rank } = await supabase
      .from("ranks")
      .select("name, image_url")
      .lte("min_trophy", user.total_trophy || 0)
      .gte("max_trophy", user.total_trophy || 0)
      .single();

    // Get user's active character
    const { data: userCharacters, error: charError } = await supabase
      .from("user_characters")
      .select("is_used, characters(name, image_url, skin_level, cost)")
      .eq("user_id", user_id)
      .eq("is_used", true)
      .maybeSingle();

    let avatar = "/default/Slime.webp";
    if (userCharacters && !charError && userCharacters.characters) {
      const charArray = Array.isArray(userCharacters.characters)
        ? userCharacters.characters
        : [userCharacters.characters];
      if (charArray.length > 0) {
        avatar = charArray[0]?.image_url || "/default/Slime.webp";
      }
    }

    const dashboardData = {
      username: user.username,
      coins: user.coin,
      trophy: user.total_trophy,
      rankName: rank?.name || "Bronze",
      rankImageUrl: rank?.image_url || "/rank/bronze.webp",
      avatar,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashboardData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
