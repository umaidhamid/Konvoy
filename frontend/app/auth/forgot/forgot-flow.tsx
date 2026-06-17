// app/auth/forgot/forgot-flow.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, ShieldQuestion, KeyRound, CheckCircle2, Lock, HelpCircle } from "lucide-react";

type ForgotStep = 1 | 2 | 3;

export default function ForgotPasswordFlow() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotStep>(1);
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [receivedToken, setReceivedToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReceivedToken("jwt_identity_payload_reset_x92k1ls0");
    setStep(3);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Token deployment target verified:", receivedToken);
    alert("Authorization changes configured successfully!");
    router.push("/auth/login");
  };

  return (
    <div className="relative">
      {step < 3 && (
        <button
          onClick={() => (step === 1 ? router.push("/auth/login") : setStep((step - 1) as ForgotStep))}
          className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="space-y-2.5">
              <h1 className="text-3xl font-black tracking-tight">Identify Account</h1>
              <p className="text-sm font-medium text-muted-foreground">Enter account routing profile path email</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Email Address</label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-border/60 bg-background/30 py-3 pr-4 pl-12 text-sm font-medium outline-none transition-all focus:border-amber-500 focus:bg-background/80 focus:ring-4 focus:ring-amber-500/10"
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95"
              >
                Continue Verification <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">Verification</h1>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Challenge Validation Architecture
              </p>
            </div>

            <form onSubmit={handleVerificationSubmit} className="mt-6 space-y-5">
              <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-500" /> Challenge Question Template
                </label>
                <p className="text-sm font-bold text-foreground leading-snug">What was the name of your first pet?</p>
                <div className="relative">
                  <ShieldQuestion className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-border/60 bg-background py-2.5 pr-4 pl-10 text-sm font-medium outline-none focus:border-amber-500"
                    placeholder="Provide tracking register logic"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">One-Time Password (OTP)</label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full tracking-[0.4em] rounded-xl border border-border/60 bg-background py-3 pr-4 pl-12 text-sm font-black outline-none focus:border-amber-500 focus:bg-background/80"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-500"
              >
                Confirm System Match
              </button>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="h-7 w-7 stroke-[2.2]" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Set New Password</h1>
              <p className="text-xs font-medium text-muted-foreground">Tokens parsed and assigned accurately</p>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="mt-6 space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-[11px] font-mono break-all text-muted-foreground shadow-inner">
                <span className="font-bold text-foreground block mb-1 text-[10px] uppercase tracking-wider">Payload Hash Key:</span>
                {receivedToken}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">New Password</label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="password"
                    required
                    className="w-full rounded-xl border border-border/60 bg-background py-3 pr-4 pl-12 text-sm font-medium outline-none focus:border-emerald-500"
                    placeholder="Enter alphanumeric layout string"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500"
              >
                Save Changes & Conclude
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}