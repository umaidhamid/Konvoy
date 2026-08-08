"use client";
import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  return (
    <button
      type="button"
      disabled={loggingOut}
      onClick={async () => {
        setLoggingOut(true);
        try {
          await authService.logout();
          toast.success("Logged out successfully");
        } catch {
          toast.error("Failed to log out. Please try again.");
          setLoggingOut(false);
          return;
        }
        router.push("/auth/login");
      }}
      className="px-4 py-2 text-red-900 hover:text-red-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}