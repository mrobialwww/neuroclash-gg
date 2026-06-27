import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Signout error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
