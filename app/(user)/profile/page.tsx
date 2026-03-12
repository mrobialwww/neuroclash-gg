"use client";

import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signin");
      } else {
        setEmail(user.email ?? null);
      }
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await axios.post("/api/auth/signout");
      window.location.href = "/signin";
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Selamat datang!</h1>
      <p className="text-gray-600">
        Login sebagai: <span className="font-medium">{email ?? "..."}</span>
      </p>
      <button onClick={handleSignOut} disabled={isLoading} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
        {isLoading ? "Keluar..." : "Sign Out"}
      </button>
    </div>
  );
}
