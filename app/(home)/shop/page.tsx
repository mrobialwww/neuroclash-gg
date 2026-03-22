import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ShopClient from "@/components/shop/ShopCLient";

export default async function ShopPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  // Kalau belum login, redirect ke halaman login
  if (error || !user?.id) {
    redirect("/signin");
  }

  // userId langsung di-pass ke client — tidak perlu useSession sama sekali
  return <ShopClient userId={user.id} />;
}
