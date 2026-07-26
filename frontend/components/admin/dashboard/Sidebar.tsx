"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const displayName = user?.fullname || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside 
      className={`w-54 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col shrink-0 h-screen sticky top-0 hidden md:flex ${className}`}
    >
      {/* Brand Header with dynamic Primary accent */}
      <div className="h-14 border-b border-sidebar-border flex items-center px-6">
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-sidebar-foreground bg-clip-text text-transparent">
          Oasis Ascend
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/10"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon 
                className={`h-4 w-4 transition-transform group-hover:scale-105 ${
                  isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                }`} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Context */}
      <Link
        href="/dashboard/settings"
        className="p-4 border-t border-sidebar-border flex items-center gap-3 bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors"
      >
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt=""
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate text-sidebar-foreground">{displayName}</p>
          {user?.email && <p className="text-xs truncate text-muted-foreground">{user.email}</p>}
        </div>
      </Link>
    </aside>
  );
}