// app/auth/layout.tsx
import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

/* ==========================================================================
   ULTRA-PREMIUM IMAGE VECTOR GRAPHICS (NO TEXT, PURE THEMED GEOMETRY)
   ========================================================================== */
function GlobalCanvasBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <svg className="h-full w-full object-cover opacity-30 dark:opacity-40" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1440 900" fill="none">
        <defs>
          <radialGradient id="bg-glow-1" cx="20%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg-glow-2" cx="80%" cy="70%" r="60%">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="transparent" />
        <circle cx="250" cy="250" r="500" fill="url(#bg-glow-1)" />
        <circle cx="1100" cy="650" r="600" fill="url(#bg-glow-2)" />
        <path d="M-100,200 Q200,100 400,300 T900,100 T1500,400" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="12 12" fill="none" />
        <path d="M-50,500 Q300,400 600,600 T1200,300 T1600,700" stroke="rgba(0,0,0,0.04)" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
      </svg>
    </div>
  );
}

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-0 sm:p-6 text-foreground bg-background transition-colors duration-300 overflow-hidden selection:bg-primary/20">
      <GlobalCanvasBackground />

      {/* Main Unified Bento Workspace */}
      <div className="relative z-10 flex min-h-screen w-full max-w-[1100px] overflow-hidden bg-card/60 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.3)] sm:min-h-[720px] sm:rounded-3xl border border-border/40 backdrop-blur-2xl">
        
        {/* Dynamic Inner Panel Routing Target Slot */}
        {children}

      </div>
    </div>
  );
}