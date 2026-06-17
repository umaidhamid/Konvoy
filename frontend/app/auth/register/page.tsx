// app/auth/register/page.tsx
import React from "react";
import AuthSidebar from "@/components/auth/auth-sidebar";
import RegisterForm from "./register-form";

function RegisterGraphic() {
  return (
    <svg className="h-full w-full max-h-48 object-contain" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reg-grad" x1="0" y1="0" x2="130" y2="90">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#059669" stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      <path d="M60,120 L120,70 L200,150 L260,90" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="120" cy="70" r="8" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>
      <circle cx="200" cy="150" r="5" fill="currentColor" className="text-muted-foreground" opacity="0.2"/>
      
      <g filter="drop-shadow(0px 12px 24px rgba(0,0,0,0.06))">
        <rect x="105" y="55" width="140" height="95" rx="18" fill="rgb(var(--card))" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5"/>
        <rect x="105" y="55" width="45" height="95" rx="18" fill="url(#reg-grad)"/>
        <circle cx="175" cy="90" r="15" fill="currentColor" className="text-muted" stroke="currentColor" className="text-border" strokeWidth="1"/>
        <path d="M162 116 C162 106 170 104 175 104 C180 104 188 106 188 116" fill="currentColor" className="text-muted"/>
        <rect x="123" y="122" width="40" height="4" rx="2" fill="#10b981" opacity="0.6"/>
        <circle cx="220" cy="78" r="3.5" fill="#10b981"/>
      </g>
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <>
      <AuthSidebar 
        themeColor="emerald"
        graphic={<RegisterGraphic />}
        heading="Start your journey"
        description="Set up a production-ready system identity configuration equipped with custom security parameters and cryptographic architecture templates."
      />
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 md:p-12 lg:p-16 bg-card/30 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[360px]">
          <RegisterForm />
        </div>
      </div>
    </>
  );
}