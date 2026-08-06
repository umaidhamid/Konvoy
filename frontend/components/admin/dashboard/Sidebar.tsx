"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Cloud,
  Compass,
  CreditCard,
  DatabaseBackup,
  FolderKanban,
  Gift,
  GitCompare,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  Lightbulb,
  Monitor,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { notificationsService } from "@/services/notifications.service";

interface SidebarProps {
  className?: string;
  /** "mobile" renders as a full-height drawer instead of the sticky desktop rail. */
  variant?: "desktop" | "mobile";
  /** Called after a nav link is clicked - used to close the mobile drawer. */
  onNavigate?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { name: "Feedback", href: "/dashboard/feedback", icon: Lightbulb },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Search", href: "/dashboard/search", icon: Search },
      { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
      { name: "Team", href: "/dashboard/team", icon: Users },
      { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
    ],
  },
  {
    label: "Security",
    items: [
      { name: "Secrets", href: "/dashboard/secrets", icon: KeyRound },
      { name: "Diff Share", href: "/dashboard/diff-share", icon: GitCompare },
      { name: "Env Drift", href: "/dashboard/env-drift", icon: Scale },
      { name: "AWS Push", href: "/dashboard/aws-push", icon: Cloud },
      // { name: "Sessions", href: "/dashboard/security", icon: Monitor },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Referrals", href: "/dashboard/referrals", icon: Gift },
      { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
      { name: "Guide", href: "/dashboard/guide", icon: Compass },
      { name: "Export Data", href: "/dashboard/data-export", icon: DatabaseBackup },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export const ADMIN_GROUP: NavGroup = {
  label: "Admin",
  items: [{ name: "Admin", href: "/dashboard/admin", icon: ShieldCheck }],
};

const isItemActive = (pathname: string, href: string) =>
  href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

// Longest-matching href wins, so e.g. /dashboard/admin/users still labels itself "Admin"
// rather than falling through to nothing.
export function getActiveNavLabel(pathname: string, isAdmin: boolean): string {
  const groups = isAdmin ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;
  let best: { name: string; href: string } | null = null;
  for (const group of groups) {
    for (const item of group.items) {
      if (isItemActive(pathname, item.href) && (!best || item.href.length > best.href.length)) {
        best = item;
      }
    }
  }
  return best?.name ?? "Overview";
}

export default function Sidebar({ className = "", variant = "desktop", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const displayName = user?.fullname || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();
  const groups = user?.role === "admin" ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;

  const unreadQuery = useQuery({
    queryKey: ["notificationsUnreadCount"],
    queryFn: () => notificationsService.getNotifications(1, 1),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;

  const layoutClass =
    variant === "mobile"
      ? "w-72 max-w-[85vw] h-full flex"
      : "w-56 h-screen sticky top-0 hidden md:flex shrink-0";

  return (
    <aside
      className={`border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col ${layoutClass} ${className}`}
    >
      {/* Brand Header with dynamic Primary accent */}
      <div className="h-14 border-b border-sidebar-border flex items-center px-6 shrink-0">
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-sidebar-foreground bg-clip-text text-transparent">
          Konvoy
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {groups.map((group, groupIndex) => (
          <div key={group.label || `group-${groupIndex}`}>
            {group.label && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(pathname, item.href);
                const badge = item.href === "/dashboard/notifications" ? unreadCount : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/10"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-primary" />
                    )}
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                      }`}
                    />
                    <span className="truncate flex-1">{item.name}</span>
                    {badge > 0 && (
                      <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer Context */}
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className="p-4 border-t border-sidebar-border flex items-center gap-3 bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors shrink-0"
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
