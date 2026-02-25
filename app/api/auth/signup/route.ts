import { createClient } from "@/lib/supabase/server";
import { RegisterSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const values = await req.json();

  // ZOD validation
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  // Destructure validated fields
  const { name, email, password } = validatedFields.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/callback/credentials`,
      },
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }

    // Edge case: email already registered (Supabase returns no error but empty identities)
    if (data.user && data.user.identities?.length === 0) {
      return NextResponse.json({ success: false, message: "Email already registered." }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: "Check your email to confirm your account." }, { status: 200 });
  } catch (err) {
    console.error("❌ Error:", err);
    return NextResponse.json({ success: false, message: "Server error", error: String(err) }, { status: 500 });
  }
}
