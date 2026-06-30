import React from "react";
import AuthProvider from "@/providers/AuthProvider";
import Sidebar from "@/components/admin/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
        {/* Modular Sticky Navigation Node */}
        <Sidebar />

        {/* Content Panel Frame */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header synced with structural border & background variables */}
          <header className="h-14 border-b border-border bg-background/95 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-200">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-pointer">Workspace</span>
              <span className="text-border">/</span>
              <span className="text-foreground font-medium tracking-wide">
                Overview
              </span>
            </div>
          </header>

          {/* Main workspace container running surface colors */}
          <main className="flex-1  max-w-7xl w-full mx-auto overflow-y-auto bg-background text-foreground">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}