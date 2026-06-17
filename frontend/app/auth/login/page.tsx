// app/auth/login/page.tsx
import React from "react";
import AuthSidebar from "@/components/auth/auth-sidebar";
import LoginForm from "./login-form";

function LoginGraphic() {
  return (
    <svg className="h-full w-full max-h-48 object-contain" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="login-grad" x1="0" y1="0" x2="320" y2="200">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <rect x="20" y="40" width="280" height="130" rx="20" fill="url(#login-grad)" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.5"/>
      <rect x="44" y="68" width="110" height="10" rx="5" fill="currentColor" className="text-foreground" opacity="0.15"/>
      <rect x="44" y="88" width="70" height="8" rx="4" fill="currentColor" className="text-foreground" opacity="0.08"/>
      <circle cx="215" cy="105" r="48" fill="rgb(var(--card))" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1"/>
      <circle cx="215" cy="105" r="34" fill="rgb(59, 130, 246)" fillOpacity="0.06"/>
      <path d="M203 106 V95 C203 88.4 208.4 83 215 83 C221.6 83 227 88.4 227 95 V106" stroke="rgb(59, 130, 246)" strokeWidth="3" strokeLinecap="round"/>
      <rect x="196" y="106" width="38" height="28" rx="8" fill="rgb(var(--card))" stroke="rgb(59, 130, 246)" strokeWidth="3"/>
      <circle cx="215" cy="118" r="3.5" fill="rgb(59, 130, 246)"/>
    </svg>
  );
}

export default function LoginPage() {
  return (
    <>
      <AuthSidebar 
        themeColor="primary"
        graphic={<LoginGraphic />}
        heading="Welcome back partner"
        description="Log in to access your secure personalized dashboard, manage critical business analytics, and review active system integrity profiles."
      />
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 md:p-12 lg:p-16 bg-card/30 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[360px]">
          <LoginForm />
        </div>
      </div>
    </>
  );
}