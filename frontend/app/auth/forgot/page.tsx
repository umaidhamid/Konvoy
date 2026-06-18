"use client";

import { useState } from "react";
import { authService } from "@/service/auth.service";
import { toast } from "sonner";
export default function ForgotPassword() {
  const [email, setEmail] = useState("umaid.uk39@gmail.com");
  
  const [mode, setMode] = useState<"email" | "recovery">("email");
const handleSendLink = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await authService.forgotPassword(email);
    toast.success("Reset link sent to your email");
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Failed to send reset link");
  }
};
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "email" ? "Reset Password" : "Recover Account"}
          </h2>

          <p className="text-slate-500 mt-2 text-sm">
            {mode === "email"
              ? "Enter your email to receive a password reset link."
              : "Enter your email and recovery code to verify your identity."}
          </p>
        </div>

        <form className="space-y-5">
          {mode === "email" ? (
            <>
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Email Address
                </label>

                <input
                  type="email"
                  required
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
                  required
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
                  maxLength={19}

                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all font-mono text-center tracking-widest"
                />
              </div>

              <button
                type="button"
                onClick={handleSendLink}
                className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Verify Identity
              </button>
            </>
          )}
        </form>

        {/* Secondary Action */}
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
      </div>
    </div>
  );
}