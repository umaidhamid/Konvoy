// components/auth/auth-sidebar.tsx
import React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthSidebarProps {
  themeColor: "primary" | "emerald" | "amber";
  graphic: React.ReactNode;
  heading: string;
  description: string;
}

export default function AuthSidebar({ themeColor, graphic, heading, description }: AuthSidebarProps) {
  const themeClasses = {
    primary: "bg-primary/[0.03] border-primary/10",
    emerald: "bg-emerald-500/[0.03] border-emerald-500/10",
    amber: "bg-amber-500/[0.03] border-amber-500/10",
  };

  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-muted/20 p-12 md:flex border-r border-border/30">
      
      {/* Background ambient accent layer */}
      <div className={`absolute inset-0 z-0 transition-colors duration-500 ${themeClasses[themeColor]}`} />

      {/* Top Brand Block Header */}
      <div className="relative z-10 flex items-center gap-3 font-bold tracking-tight text-foreground select-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 text-primary-foreground">
          <ShieldCheck className="h-5.5 w-5.5 stroke-[2.2]" />
        </div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          SecurePortal
        </span>
      </div>

      {/* Graphic Engine Visual Workspace */}
      <div className="relative z-10 my-auto py-8 w-full flex flex-col items-center space-y-8 select-none">
        <div className="w-full drop-shadow-[0_16px_24px_rgba(0,0,0,0.04)] dark:drop-shadow-[0_16px_24px_rgba(0,0,0,0.2)]">
          {graphic}
        </div>
        <div className="space-y-3 text-center max-w-[88%]">
          <h2 className={`text-2xl font-black tracking-tight ${
            themeColor === 'emerald' ? 'bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300' :
            themeColor === 'amber' ? 'bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-300' :
            'bg-gradient-to-r from-primary to-blue-500 dark:from-blue-400 dark:to-indigo-300'
          } bg-clip-text text-transparent`}>
            {heading}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium opacity-85">
            {description}
          </p>
        </div>
      </div>

      {/* Footer Branding Signature */}
      <div className="relative z-10 text-[10px] font-bold text-muted-foreground/40 tracking-[0.2em] uppercase">
        &copy; 2026 Enterprise Identity Stack
      </div>
    </div>
  );
}