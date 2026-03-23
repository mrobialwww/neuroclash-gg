// DELETE /api/user-game/leave/[user_game_id]
// - dilakukan ketika user keluar dari lobby atau selesai quiz
// - menghapus record user_games berdasarkan user_game_id

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ user_game_id: string }> }
) {
  try {
    // Gunakan Service Role Key untuk bypass masalah RLS saat DELETE
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { user_game_id } = await params;

    const { error } = await supabaseAdmin
      .from("user_games")
      .delete()
      .eq("user_game_id", user_game_id);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
