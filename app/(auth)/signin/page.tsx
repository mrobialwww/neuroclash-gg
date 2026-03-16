"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import AuthCard from "@/components/auth/card_glass";
import { toast } from "sonner";
import axios from "axios";
import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/auth/signin", values);

      if (data.success && data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        toast.error("Login Gagal", {
          description: data.message || "Terjadi kesalahan.",
        });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login gagal, coba lagi.";
      toast.error("Authentication Error", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { data } = await axios.post("/api/auth/google");

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Authentication Error", {
          description: "Could not retrieve redirect URL.",
        });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login initialization failed";
      toast.error("Authentication Error", {
        description: message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthCard title="Masuk" background="/background/Daftar.png">
      <div className="form">
        <form onSubmit={form.handleSubmit(handleLogin)}>
          <div className="field">
            <span className="field-label">Email</span>
            <input
              className="field-input"
              type="email"
              placeholder="email@contoh.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p style={{ color: '#ff6b6b', marginTop: 6 }}>{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="field">
            <span className="field-label">Password</span>
            <input
              className={`field-input has-icon`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password kamu"
              {...form.register("password")}
            />
            <button
              className="field-icon"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            {form.formState.errors.password && (
              <p style={{ color: '#ff6b6b', marginTop: 6 }}>{form.formState.errors.password.message}</p>
            )}
          </div>

          <button className="btn-primary" type="submit" disabled={isLoading || isGoogleLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <button className="btn-google" type="button" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <svg className="google-icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          {isGoogleLoading ? 'Memproses...' : 'Daftar dengan Google'}
        </button>

        <p className="login-link">
          Belum punya akun? <Link href="/signup" className="link">Daftar</Link>
        </p>

        <p className="terms">
          Dengan masuk, Anda menyetujui <Link href="/terms">Ketentuan layanan</Link> dan <Link href="/privacy">Kebijakan Privasi</Link>
        </p>
      </div>
    </AuthCard>
  );
}
