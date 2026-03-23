import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "@/components/history/HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  // Kalau belum login, redirect ke halaman login
  if (error || !user?.id) {
    redirect("/signin");
  }

  // userId langsung di-pass ke client component
  return <HistoryClient userId={user.id} />;
}
