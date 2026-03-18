// GET /api/users/[user_id]
// - user dengan user_id membuka page dengan section statistik pertandingan
// - pembuat game membuka detail partisipan dengan user_id

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
  try {
    const supabase = await createClient();

    const { user_id } = await params;

    const { data, error } = await supabase.from("users").select("*").eq("user_id", user_id);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "User retrieved successfully",
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
