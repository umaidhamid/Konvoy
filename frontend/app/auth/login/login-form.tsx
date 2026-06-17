// app/auth/login/login-form.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form execution logic injected:", formData);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <div className="space-y-2.5">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
          Sign In
        </h1>
        <p className="text-sm font-medium text-muted-foreground">Enter your active platform credentials to verify access</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Email Address</label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="email"
              required
              className="w-full rounded-xl border border-border/60 bg-background/30 py-3 pr-4 pl-12 text-sm font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary focus:bg-background/80 focus:ring-4 focus:ring-primary/10"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Password</label>
            <Link href="/auth/forgot" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors duration-150">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-xl border border-border/60 bg-background/30 py-3 pr-12 pl-12 text-sm font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary focus:bg-background/80 focus:ring-4 focus:ring-primary/10"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors duration-150"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_20px_-6px_rgba(59,130,246,0.4)] transition-all duration-150 hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99]"
        >
          Verify & Authenticate
        </button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
        New to the stack?{" "}
        <Link href="/auth/register" className="font-extrabold text-primary hover:underline underline-offset-4">
          Create account
        </Link>
      </div>
    </motion.div>
  );
}