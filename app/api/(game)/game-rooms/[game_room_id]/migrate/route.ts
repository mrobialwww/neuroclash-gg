import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ game_room_id: string }> }
) {
  try {
    const { game_room_id } = await params;
    const { new_host_id } = await request.json();

    if (!new_host_id) {
      return NextResponse.json({ error: "New host ID required" }, { status: 400 });
    }

    // Use Service Role to bypass RLS for host migration
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("game_rooms")
      .update({ user_id: new_host_id })
      .eq("game_room_id", game_room_id)
      .select();

    if (error) {
      console.error("Migration Error:", error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
