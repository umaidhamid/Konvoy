"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authService } from "@/service/auth.service";
import { toast } from "sonner";

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const emailParam = searchParams.get("email") as string;
  const [email, setEmail] = useState(emailParam || "umaid.uk39@gmail.com");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"email" | "recovery">("email");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authService.forgotPassword(email);
      toast.success("Reset link sent to your email");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to send reset link"
      );
    }
  };

  const handleRecoverAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!token || !email) {
        toast.error("Please enter recovery code and email");
        return;
      }

      if (!newPassword || !confirmPassword) {
        toast.error("Please fill all fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      await authService.recoverAccount(email, token, newPassword);

      toast.success("Account recovered successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to recover account"
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!newPassword || !confirmPassword) {
        toast.error("Please fill all fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      await authService.resetPassword(resetToken!, newPassword, emailParam!);

      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {resetToken
              ? "Create New Password"
              : mode === "email"
              ? "Reset Password"
              : "Recover Account"}
          </h2>

          <p className="text-slate-500 mt-2 text-sm">
            {resetToken
              ? "Choose a new password for your account."
              : mode === "email"
              ? "Enter your email to receive a password reset link."
              : "Enter your email and recovery code to verify your identity."}
          </p>
        </div>

        <form className="space-y-5">
          {resetToken ? (
            <>
              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Update Password
              </button>
            </>
          ) : mode === "email" ? (
            <>
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <button
                type="submit"
                onClick={handleSendLink}
                className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </>
          ) : (
            <>
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all"
                />
              </div>

              {/* Recovery Code */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Recovery Code
                </label>

                <input
                  type="text"
                  maxLength={32}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all font-mono text-center tracking-widest"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleRecoverAccount}
                className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Recover Account
              </button>
            </>
          )}
        </form>

        {!resetToken && (
          <button
            onClick={() =>
              setMode(mode === "email" ? "recovery" : "email")
            }
            className="w-full mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
          >
            {mode === "email"
              ? "I don't have access to my email"
              : "Back to email reset"}
          </button>
        )}
      </div>
    </div>
  );
}