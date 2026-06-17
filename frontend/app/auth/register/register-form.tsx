// app/auth/register/register-form.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, ShieldQuestion, Sparkles } from "lucide-react";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    securityQuestion: "What was the name of your first pet?",
    securityAnswer: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Account registration processing structural setup:", formData);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <div className="space-y-2.5">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-sm font-medium text-muted-foreground">Register down below to initiate platform credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Full Name</label>
          <div className="relative">
            <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              required
              className="w-full rounded-xl border border-border/60 bg-background/30 py-2.5 pr-4 pl-12 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/40 focus:border-emerald-500 focus:bg-background/80 focus:ring-4 focus:ring-emerald-500/10"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Email Address</label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="email"
              required
              className="w-full rounded-xl border border-border/60 bg-background/30 py-2.5 pr-4 pl-12 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/40 focus:border-emerald-500 focus:bg-background/80 focus:ring-4 focus:ring-emerald-500/10"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Password</label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="password"
              required
              className="w-full rounded-xl border border-border/60 bg-background/30 py-2.5 pr-4 pl-12 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/40 focus:border-emerald-500 focus:bg-background/80 focus:ring-4 focus:ring-emerald-500/10"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {/* Dynamic Context Card Layout Grid */}
        <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.01] to-emerald-500/[0.03] p-4 space-y-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Security Recovery Setup
          </p>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground/80">Security Question</label>
            <select
              className="w-full rounded-lg border border-border/60 bg-background p-2 text-sm font-medium outline-none transition-all appearance-none cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              value={formData.securityQuestion}
              onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
            >
              <option>What was the name of your first pet?</option>
              <option>What city were you born in?</option>
              <option>What was your mother&apos;s maiden name?</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground/80">Your Secret Answer</label>
            <div className="relative">
              <ShieldQuestion className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                type="text"
                required
                className="w-full rounded-lg border border-border/60 bg-background py-2 pr-4 pl-9 text-sm font-medium outline-none transition-all focus:border-emerald-500"
                placeholder="Provide valid payload value"
                value={formData.securityAnswer}
                onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] transition-all duration-150 hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99]"
        >
          Initialize Account
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-medium text-muted-foreground">
        Already verified?{" "}
        <Link href="/auth/login" className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}