/**
 * GET /api/users/[user_id]
 * http://localhost:3000/api/users/c307f9dc-482f-4442-b566-97dbc258c0e8
 *
 * Fungsi:
 *   1. Mendapatkan suatu baris record dari tabel users berdasarkan user_id
 *   2. Tujuan utamanya ketika user/creator game ingin mendapatkan detail users berdasarkan user_id
 */

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
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
  try {
    const { user_id } = await params;
    const { username } = await request.json();

    if (!username || username.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Username must be at least 3 characters long" }, { status: 400 });
    }

    const { userRepository } = await import("@/repository/userRepository");
    const updatedUser = await userRepository.updateUsername(user_id, username);

    return NextResponse.json(
      {
        success: true,
        message: "Username updated successfully",
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("API Error updating username:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
