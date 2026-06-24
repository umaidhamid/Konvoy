"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Terminal, Shield, Share2, Code2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/service/auth.service";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Shared style tokens
// ---------------------------------------------------------------------------

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 " +
  "placeholder:text-slate-400 transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 focus-visible:border-slate-900 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-white dark:focus-visible:border-white";

const labelStyles =
  "text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400";

const primaryButtonStyles =
  "h-12 w-full rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm " +
  "transition-colors duration-150 hover:bg-slate-800 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-white";

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

function PasswordInput({ id, value, onChange, placeholder, required }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={`${inputStyles} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
}

function FeatureBadge({ icon, label }: FeatureBadgeProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 p-3">
      <span className="shrink-0 text-slate-300">{icon}</span>
      <span className="text-xs font-medium tracking-wide text-slate-200">{label}</span>
    </div>
  );
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={
          light
            ? "flex h-9 w-9 items-center justify-center rounded-xl bg-white"
            : "flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white"
        }
      >
        <span
          className={
            light
              ? "text-sm font-black tracking-tight text-slate-900"
              : "text-sm font-black tracking-tight text-white dark:text-slate-900"
          }
        >
          K
        </span>
      </div>
      <span
        className={
          light
            ? "text-lg font-semibold tracking-tight text-white"
            : "text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        }
      >
        Konoy
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "umaid.hamid.in@gmail.com",
    password: "Password123!",
  });
  const { setUser } = useAuth();

  // Pointer tracking reference retained for the auth panel (no longer used
  // to render a glow — kept so the hook/handler stay available if needed).
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

try {
  console.log("1");

  const response = await authService.login(
    formData.email,
    formData.password
  );

  console.log("2", response);

  toast.success("Welcome back to Konoy!");

  console.log("3");

  setUser(response.user);

  console.log("4");

  router.push("/dashboard");

  console.log("5");
} catch (error: any) {
  console.error("ERROR:", error);

  toast.error(
    error?.response?.data?.message ||
    error?.message ||
    "Invalid credentials provided"
  );

      const errorCode = error?.response?.data?.code;
      const errorMessage = error?.response?.data?.message || "Invalid credentials provided";

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      toast.success("Connecting securely via Google SSO...");
    } catch (error: any) {
      toast.error("Failed to authenticate with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white lg:grid lg:grid-cols-12 dark:bg-slate-950">
      {/* Left: brand / product panel */}
      <div className="relative hidden flex-col justify-between border-r border-slate-800 bg-slate-950 p-12 text-white lg:col-span-5 lg:flex xl:col-span-4">
        <BrandMark light />

        <div className="flex max-w-sm flex-col gap-5">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Terminal access for your secret drops.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Create, save, and retrieve secure files or encrypted developer docs directly inside
            your codebase via simple CLI execution.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FeatureBadge icon={<Terminal size={16} />} label="CLI fetching" />
          <FeatureBadge icon={<Shield size={16} />} label="Encrypted" />
          <FeatureBadge icon={<Share2 size={16} />} label="Share links" />
          <FeatureBadge icon={<Code2 size={16} />} label="Dev docs" />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>v1.0.4 — Developer workspace core</span>
        </div>
      </div>

      {/* Right: authentication form */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:col-span-7 xl:col-span-8"
      >
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-7 space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Sign in
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your professional credentials or use SSO.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mb-6 h-12 w-full rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
            </Button>

            <div className="mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Or
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
                type="submit"
                className={`${primaryButtonStyles} mt-2`}
                disabled={isLoading || isGoogleLoading}
              >
                <span className="flex items-center justify-center">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Sign in to workspace"}
                </span>
              </Button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <a href="/auth/register" className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-slate-50">
                Create one
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}