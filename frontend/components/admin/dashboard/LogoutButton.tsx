"use client";
import { authService } from "@/service/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        authService.logout();
        router.push("/login");
        toast.success("Logged out successfully");
      }}
      className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
    >
      Logout
    </button>
  );
}