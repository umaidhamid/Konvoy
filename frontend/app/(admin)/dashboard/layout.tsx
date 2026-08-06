"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import AuthProvider from "@/providers/AuthProvider";
import { AuthContext } from "@/context/AuthContext";
import Sidebar, { getActiveNavLabel } from "@/components/admin/dashboard/Sidebar";
import NotificationBell from "@/components/admin/dashboard/NotificationBell";
import LogoutButton from "@/components/admin/dashboard/LogoutButton";

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer on route change so it doesn't stay open after navigating.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileNavOpen]);

  // Escape closes the drawer, same as clicking the backdrop - standard expectation for any
  // overlay, and was missing entirely.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const activeLabel = getActiveNavLabel(pathname, user?.role === "admin");

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <Sidebar />

      {mobileNavOpen && (
        // Starts below the h-14 header (not inset-0) so the header's own toggle button stays
        // visible and directly clickable instead of being visually buried under the backdrop.
        <div className="fixed inset-x-0 top-14 bottom-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0">
            <Sidebar variant="mobile" onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="md:hidden shrink-0 p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <span className="hidden sm:inline hover:text-foreground transition-colors cursor-default">
                Workspace
              </span>
              <span className="hidden sm:inline text-border">/</span>
              <span className="text-foreground font-medium tracking-wide truncate">{activeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <NotificationBell />
            <Link
              href="/dashboard/settings"
              className="hidden sm:inline-block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto overflow-y-auto bg-background text-foreground">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </AuthProvider>
  );
}
