"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Terminal, Shield, Share2, Code2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Modular Imports
import { labelStyles, inputStyles, primaryButtonStyles } from "@/components/auth/auth-styles";
import { BrandMark } from "@/components/auth/brand-mark";
import { FeatureBadge } from "@/components/auth/feature-badge";
import { PasswordInput } from "@/components/auth/password-input";

export default function LoginPage() {

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const { setUser, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );

      toast.success("Welcome back to Konvoy!");

      setUser(response.user);

      router.push("/dashboard");
    } catch (error: any) {
      console.error("ERROR:", error);

      const errorCode = error?.response?.data?.code;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid credentials provided";

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

                toast.success(res.data.message || "Verification email sent successfully");
              } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to send verification email");
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
    <div className="flex min-h-screen w-full bg-white lg:grid lg:grid-cols-12 dark:bg-slate-950">
      {/* Left: brand / product panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800 bg-slate-950 p-12 text-white lg:col-span-5 lg:flex xl:col-span-4">
        {/* Ambient background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />

        <div className="relative z-10">
          <BrandMark light />
        </div>

        <div className="relative z-10 flex max-w-sm flex-col gap-5">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Terminal access for your secret drops.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Create, save, and retrieve secure files or encrypted developer docs directly inside
            your codebase via simple CLI execution.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          <FeatureBadge icon={<Terminal size={16} />} label="CLI fetching" />
          <FeatureBadge icon={<Shield size={16} />} label="Encrypted" />
          <FeatureBadge icon={<Share2 size={16} />} label="Share links" />
          <FeatureBadge icon={<Code2 size={16} />} label="Dev docs" />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>v1.0.4 — Developer workspace core</span>
        </div>
      </div>

      {/* Right: authentication form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:col-span-7 xl:col-span-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>

          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none"
          >
            {/* Cursor-tracked spotlight */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(500px circle at ${mousePos.x}% ${mousePos.y}%, rgba(15, 23, 42, 0.06), transparent 60%)`,
              }}
            />

            <div className="relative mb-7 space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Sign in
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your professional credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className={labelStyles}>
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputStyles}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className={labelStyles}>
                    Password
                  </Label>
                  <button
                    onClick={() => router.push("/auth/forgot-password")}
                    type="button"
                    className="text-xs font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Forgot password?
                  </button>
                </div>

                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <label className="flex select-none items-center gap-2 pt-1 text-sm text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 dark:border-slate-700 dark:accent-white"
                />
                Keep me signed in on this device
              </label>

              <Button
                type="submit"
                className={`${primaryButtonStyles} mt-2`}
                disabled={isLoading}
              >
                <span className="flex items-center justify-center">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Sign in to workspace"}
                </span>
              </Button>
            </form>

            <div className="relative mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <a href="/auth/register" className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-slate-50">
                Create one
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
            Need help?{" "}
            <a href="/contact" className="font-medium text-slate-500 underline-offset-4 hover:underline dark:text-slate-400">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
