import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/home/LandingPage";

export default async function RootPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // if (data.user) redirect("/dashboard");

  return <LandingPage />;
}
