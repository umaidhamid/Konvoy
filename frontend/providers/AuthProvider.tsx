"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AuthContext, User } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

const pathname = usePathname();
  useEffect(() => {
      if (pathname.startsWith("/auth")) {
    setLoading(false);
    return;
  }
    async function checkAuth() {
      try {
        const res = await api.get("/auth/is-auth");

        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}