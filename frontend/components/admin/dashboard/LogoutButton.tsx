"use client";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await authService.logout();
          toast.success("Logged out successfully");
        } catch {
          toast.error("Failed to log out. Please try again.");
          return;
        }
        router.push("/login");
      }}
      className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
    >
      Logout
    </button>
  );
}