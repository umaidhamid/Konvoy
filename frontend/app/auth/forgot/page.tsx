// app/auth/forgot/page.tsx
import React from "react";
import AuthSidebar from "@/components/auth/auth-sidebar";
import ForgotPasswordFlow from "./forgot-flow";

function RecoveryGraphic() {
  return (
    <svg className="h-full w-full max-h-40 object-contain" viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reco-grad" x1="0" y1="0" x2="320" y2="140">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      <rect x="15" y="15" width="290" height="110" rx="16" fill="url(#reco-grad)" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1.5"/>
      <line x1="40" y1="70" x2="280" y2="70" stroke="currentColor" className="text-border" strokeWidth="2" strokeDasharray="4 8" opacity="0.6"/>
      <circle cx="70" cy="70" r="20" fill="rgb(var(--card))" stroke="#f59e0b" strokeWidth="2.5"/>
      <circle cx="70" cy="70" r="8" fill="#f59e0b" opacity="0.3"/>
      <circle cx="160" cy="70" r="18" fill="rgb(var(--card))" stroke="currentColor" className="text-border" strokeWidth="1.5"/>
      <circle cx="250" cy="70" r="18" fill="rgb(var(--card))" stroke="currentColor" className="text-border" strokeWidth="1.5"/>
      <line x1="115" y1="35" x2="115" y2="105" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );
}

export default function ForgotPage() {
  return (
    <>
      <AuthSidebar 
        themeColor="amber"
        graphic={<RecoveryGraphic />}
        heading="Account Recovery Flow"
        description="Multi-tier identity verification module. Answer baseline validation matrix questions and supply token parameters to complete state changes."
      />
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 md:p-12 lg:p-16 bg-card/30 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[360px]">
          <ForgotPasswordFlow />
        </div>
      </div>
    </>
  );
}