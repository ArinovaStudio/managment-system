"use client";

import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { LucideArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user", {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        window.location.href = "/signin";
      }
    } catch (err) {
      console.error("Profile load error:", err);
      window.location.href = "/signin";
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData)
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user found</p>;

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex justify-start items-center gap-1 py-4">
        <button onClick={() => router.back()} className="text-gray-500"> Back</button>
        <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
          | Profile
        </div>
        </div>

        <div className="space-y-6">
          <UserMetaCard user={user} onUpdate={updateProfile} />

          <UserInfoCard user={user} onUpdate={updateProfile} />

          <UserAddressCard user={user} onUpdate={updateProfile}/>
        </div>
      </div>
    </div>
  );
}
