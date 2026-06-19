"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Terminal, Shield, Share2, Code2, ArrowLeft, KeyRound, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/service/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Shared style tokens (Exactly aligned with authentication theme)
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

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
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
// Main Page
// ---------------------------------------------------------------------------

export default function ForgotPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const emailParam = searchParams.get("email") as string;

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(emailParam || "umaid.hamid.in@gmail.com");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"email" | "recovery">("email");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      toast.success("Reset link sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email || !newPassword || !confirmPassword) {
      toast.error("Please fill all required verification fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await authService.recoverAccount(email, token, newPassword);
      toast.success("Account recovered successfully");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to recover account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken!, newPassword, emailParam!);
      toast.success("Password updated successfully");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white lg:grid lg:grid-cols-12 dark:bg-slate-950">
      {/* Left Panel */}
      <div className="relative hidden flex-col justify-between border-r border-slate-800 bg-slate-950 p-12 text-white lg:col-span-5 lg:flex xl:col-span-4">
        <BrandMark light />

        <div className="flex max-w-sm flex-col gap-5">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Secure workspace cryptographic recovery.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Verify identity through explicit link-state configurations or use your secondary high-entropy 
            backup codes assigned at environment checkout.
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
          <span>v1.0.4 — SecOps Verification Gateway</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:col-span-7 xl:col-span-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-7 space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {resetToken
                  ? "Create New Password"
                  : mode === "email"
                  ? "Reset Password"
                  : "Recover Account"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {resetToken
                  ? "Choose a new password for your enterprise workspace account."
                  : mode === "email"
                  ? "Enter your work email to receive a secure reset link configuration."
                  : "Enter your workspace email and master backup code sequence."}
              </p>
            </div>

            <form className="space-y-4">
              {resetToken ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className={labelStyles}>New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className={labelStyles}>Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputStyles}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className={`${primaryButtonStyles} mt-2`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Modifying...
                      </span>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </>
              ) : mode === "email" ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className={labelStyles}>Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputStyles}
                    />
                  </div>

                  <Button
                    type="submit"
                    onClick={handleSendLink}
                    disabled={isLoading}
                    className={`${primaryButtonStyles} mt-2`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Dispatching...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Mail size={16} /> Send Reset Link
                      </span>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className={labelStyles}>Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="token" className={labelStyles}>Master Recovery Code</Label>
                    <Input
                      id="token"
                      type="text"
                      maxLength={32}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className={`${inputStyles} font-mono text-center tracking-wider`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className={labelStyles}>New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className={labelStyles}>Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputStyles}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleRecoverAccount}
                    disabled={isLoading}
                    className={`${primaryButtonStyles} mt-2`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Restoring...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <KeyRound size={16} /> Recover Account
                      </span>
                    )}
                  </Button>
                </>
              )}
            </form>

            {/* Bottom Actions and Navigation Hooks */}
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
              {!resetToken && (
                <button
                  type="button"
                  onClick={() => setMode(mode === "email" ? "recovery" : "email")}
                  className="flex w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {mode === "email" ? (
                    <>
                      <ShieldAlert size={14} /> I lost access to this email
                    </>
                  ) : (
                    "Back to email reset link"
                  )}
                </button>
              )}

              <a
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 text-sm text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeft size={14} /> Return to sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}