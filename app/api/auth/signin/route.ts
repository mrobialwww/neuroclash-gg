import { createClient } from "@/lib/supabase/server";
import { LoginSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const values = await req.json();

  // ZOD validation
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  // Destructure validated fields
  const { email, password } = validatedFields.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }

    return NextResponse.json({ success: true, redirectTo: "/" }, { status: 200 });
  } catch (err) {
    console.error("❌ Error:", err);
    return NextResponse.json({ success: false, message: "Server error", error: String(err) }, { status: 500 });
  }
}
