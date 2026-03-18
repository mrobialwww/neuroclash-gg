import React, { Suspense } from "react"; // Tambahkan Suspense
import { Navbar } from "@/components/layout/Navbar";
import { userService } from "@/services/userService";
import { createClient } from "@/lib/supabase/server";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userData = user ? await userService.getNavbarData(user.id) : null;

  return (
    <div className="min-h-screen font-(family-name:--font-baloo-2)">
      <Navbar initialData={userData} />

      <main>
        <Suspense fallback={<div className="p-10 text-center">Memuat Dashboard...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}