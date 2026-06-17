// app/auth/layout.tsx
import React from "react";
import Link from "next/link";
  import AuthProvider from "@/providers/AuthProvider";
/* ==========================================================================
   ULTRA-PREMIUM IMAGE VECTOR GRAPHICS (NO TEXT, PURE THEMED GEOMETRY)
   ========================================================================== */


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
   <AuthProvider>
        {/* Dynamic Inner Panel Routing Target Slot */}
        {children}
   </AuthProvider>
  );
}