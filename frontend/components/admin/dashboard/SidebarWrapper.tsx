"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      try {
        const res = await api.get("/api/v1/auth/is-auth");

        setUser(res.data.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Sidebar user={user} />;
}   