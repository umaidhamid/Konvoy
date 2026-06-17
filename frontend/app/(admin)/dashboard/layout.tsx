
import React from "react";
import AuthProvider from "@/providers/AuthProvider";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <div className="flex min-h-screen bg-background text-foreground">

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">
              Overview
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </AuthProvider>
  );
}