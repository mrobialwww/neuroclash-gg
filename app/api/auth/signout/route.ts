import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Signout error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
