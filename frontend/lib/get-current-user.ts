import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
export interface User {
  _id: string;
  username: string;
  email: string;
}

export async function getCurrentUser(): Promise<User> {
  try {
    const cookieStore = await cookies();

    const { data } = await api.get("/auth/is-auth", {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return data.user;
  } catch {
    // toast.error("Failed to get current user");
    redirect("/login");
  }
}