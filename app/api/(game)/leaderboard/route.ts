import { leaderboardService } from "@/services/leaderboardService";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));

    const { data, pagination } = await leaderboardService.getLeaderboard(page, limit);

    // If user is logged in, also fetch their personal entry
    let myEntry = null;
    if (user) {
      myEntry = await leaderboardService.getUserLeaderboardEntry(user.id);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Leaderboard retrieved successfully",
        data,
        pagination,
        myEntry,
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
