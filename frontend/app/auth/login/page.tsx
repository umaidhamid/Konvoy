"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/service/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import  {AuthProvider}  from "@/context/AuthProvider";
import api from "@/lib/api";
export default function LoginPage() { 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "umaid@example.com", password: "Password@123" });
  const { setUser } = useAuth();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await authService.login(formData.email, formData.password);
    toast.success("Login successful");
    setUser(response.user);
    router.push("/dashboard");
  } catch (error: any) {
    // Extract error code from response
    const errorCode = error?.response?.data?.code;
    const errorMessage = error?.response?.data?.message || "Login failed";

   if (errorCode === "ACCOUNT_NOT_VERIFIED") {
  toast.error(errorMessage, {
    duration: 6000,
    action: {
      label: "Verify Account",
      onClick: async () => {
        try {
          const res = await api.post("/auth/resend-verification", {
            email: formData.email,
          });

          toast.success(
            res.data.message || "Verification email sent successfully"
          );
        } catch (error: any) {
          toast.error(
            error.response?.data?.message ||
              "Failed to send verification email"
          );
        }
      },
    },
  });
} else {
  toast.error(errorMessage);
}
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm border-zinc-200 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button   onClick={() => router.push("/auth/forgot")} type="button" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}