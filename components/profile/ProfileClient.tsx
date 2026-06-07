import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { Loader2, Check, X, User, Mail, Calendar, Hash, ChevronRight, LogOut } from "lucide-react";
import { getCharacterBgColor } from "@/lib/constants/characters";
import { MainButton } from "@/components/common/MainButton";
import axios from "axios";

interface ProfileData {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

export default function ProfileClient({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { avatar, baseCharacter, updateUsername } = useUserStore();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      const result = await res.json();

      if (result.success) {
        const data = Array.isArray(result.data) ? result.data[0] : result.data;
        setProfile(data);
        setNewUsername(data.username);
      } else {
        toast.error("Gagal memuat profil");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateUsername = async () => {
    if (newUsername.trim().length < 3) {
      toast.error("Username minimal 3 karakter");
      return;
    }

    if (newUsername === profile?.username) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });

      const result = await res.json();
      if (result.success) {
        setProfile((prev) => prev ? { ...prev, username: newUsername } : null);
        updateUsername(newUsername);
        toast.success("Username berhasil diperbarui!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Gagal memperbarui username");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post("/api/auth/signout");
      window.location.href = "/signin";
    } catch (error) {
      toast.error("Gagal keluar");
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 animate-pulse">
        <div className="flex flex-col items-center mb-12">
          <div className="h-32 w-32 rounded-full bg-white/10 mb-6" />
          <div className="h-8 w-48 bg-white/10 rounded mb-2" />
          <div className="h-5 w-64 bg-white/10 rounded" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/10" />
          ))}
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 pb-20 sm:px-8 md:py-16">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6 md:mb-8">
        <div
          className="relative h-28 w-28 md:h-32 md:w-32 rounded-full border-4 border-white overflow-hidden mb-4 md:mb-6 flex items-center justify-center transition-transform duration-500"
          style={{ backgroundColor: getCharacterBgColor(baseCharacter || "Slime") }}
        >
          <div className="relative w-[75%] h-[75%]">
            <Image
              src={avatar || "/default/Slime.webp"}
              alt="Avatar"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1 md:mb-2">
            {profile.username}
          </h1>
          <p className="text-[#A1A1AA] text-sm md:text-base font-medium">
            {profile.email}
          </p>
        </div>
      </div>

      {/* Account Info List */}
      <div className="space-y-3 md:space-y-4">
        <div className="mt-4 mb-2 md:mb-4 px-1 text-lg md:text-xl font-bold text-white">
          Pengaturan Akun
        </div>

        {/* Username Row */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-1">
          {isEditing ? (
            <div className="flex items-center gap-2 p-2 md:p-3">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#F4F4F5] text-[#71717A]">
                <User size={18} className="md:w-5 md:h-5" />
              </div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username baru"
                className="flex-1 bg-transparent px-1 md:px-2 text-base md:text-lg font-semibold text-black outline-none w-full"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleUpdateUsername()}
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUpdateUsername}
                  disabled={isUpdating}
                  className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#4D70E8] text-white hover:bg-[#3D5FD0] transition-colors disabled:opacity-50"
                  title="Simpan"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} className="md:w-4 md:h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewUsername(profile.username);
                  }}
                  className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7] transition-colors"
                  title="Batal"
                >
                  <X size={16} className="md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex w-full items-center justify-between p-4 md:p-5 hover:bg-[#FAFAFA] transition-colors group/row"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl bg-[#F4F4F5] text-[#71717A] shrink-0">
                  <User size={20} className="md:w-[22px] md:h-[22px]" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-[#A1A1AA] mb-0.5">Username</div>
                  <div className="text-base md:text-lg font-bold text-black leading-tight">{profile.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-[#555555] group-hover/row:text-black transition-colors cursor-pointer shrink-0">
                <span className="text-md md:text-lg font-semibold">Ganti</span>
                <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
            </button>
          )}
        </div>

        {/* Email Row (Read Only) */}
        <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-white">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl bg-[#F4F4F5] text-[#71717A] shrink-0">
              <Mail size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] md:text-xs font-semibold text-[#A1A1AA] mb-0.5">Email</div>
              <div className="text-base md:text-lg font-bold text-black leading-tight break-all md:break-normal">{profile.email}</div>
            </div>
          </div>
        </div>

        {/* User ID Row */}
        <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-white">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl bg-[#F4F4F5] text-[#71717A] shrink-0">
              <Hash size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] md:text-xs font-semibold text-[#A1A1AA] mb-0.5">ID Pengguna</div>
              <div className="text-sm md:text-lg font-bold text-black truncate max-w-[140px] sm:max-w-none leading-tight">{profile.user_id}</div>
            </div>
          </div>
        </div>

        {/* Join Date Row */}
        <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-white">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl bg-[#F4F4F5] text-[#71717A] shrink-0">
              <Calendar size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] md:text-xs font-semibold text-[#A1A1AA] mb-0.5">Bergabung Sejak</div>
              <div className="text-base md:text-lg font-bold text-black leading-tight">
                {new Date(profile.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4 md:pt-6 flex justify-center">
          <MainButton
            variant="red"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            className="px-6 md:px-8 h-10 md:h-11"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <LogOut size={16} className="md:w-4 md:h-4" />
              <span>Keluar dari Akun</span>
            </div>
          </MainButton>
        </div>
      </div>
    </main>
  );
}
