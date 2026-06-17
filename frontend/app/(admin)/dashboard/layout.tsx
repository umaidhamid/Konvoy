import React from 'react';
import Link from 'next/link';
import { Home, Folder, FileText, Settings, ShieldAlert } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navigation scoped strictly to your 1-month MVP recommendation
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/dashboard/projects', icon: Folder },
    { name: 'Files', href: '/dashboard/files', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          {/* Logo / Branding */}
          <div className="flex items-center gap-2 font-mono font-bold text-lg tracking-wider mb-8">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-md text-xs">DV</span>
            DevVault <span className="text-[10px] text-muted font-normal bg-card-hover px-1.5 py-0.5 rounded border border-border">MVP</span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-radius text-sm text-secondary hover:text-foreground hover:bg-card-hover transition-colors group"
                >
                  <Icon className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Org context indicator */}
        <div className="p-4 border-t border-border bg-card-hover/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-xs text-primary">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium leading-none">Personal Account</span>
              <span className="text-[10px] text-muted mt-0.5">free tier</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Simple Top Header */}
        <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">Overview</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-xs font-mono bg-card hover:bg-card-hover border border-border px-2.5 py-1 rounded transition-colors">
              Docs
            </button>
          </div>
        </header>

        {/* Page Content Injector */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}