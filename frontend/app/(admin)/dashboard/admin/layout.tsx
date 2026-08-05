"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";

const TABS = [
  { name: "Overview", href: "/dashboard/admin" },
  { name: "Users", href: "/dashboard/admin/users" },
  { name: "Projects", href: "/dashboard/admin/projects" },
  { name: "Activity Log", href: "/dashboard/admin/logs" },
  { name: "Plans", href: "/dashboard/admin/plans" },
  { name: "Contact", href: "/dashboard/admin/contact" },
  { name: "Settings", href: "/dashboard/admin/settings" },
];

function isTabActive(pathname: string, href: string) {
  if (href === "/dashboard/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);

  const canLoad = !authLoading && !!user && user.role === "admin";

  const statsQuery = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => adminService.getStats(),
    enabled: canLoad,
  });
  const plansQuery = useQuery({
    queryKey: ["adminPlans"],
    queryFn: () => adminService.getAllPlans(),
    enabled: canLoad,
  });
  const contactQuery = useQuery({
    queryKey: ["adminContact", 1, ""],
    queryFn: () => adminService.getContactQueries(1, 1, ""),
    enabled: canLoad,
  });

  const stats = statsQuery.data?.data ?? null;
  const plansCount = plansQuery.data?.data?.length ?? 0;
  const contactUnreadCount = contactQuery.data?.unreadCount ?? 0;

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const counts: Record<string, number> = {
    Users: stats?.totalUsers ?? 0,
    Projects: stats?.totalProjects ?? 0,
    Plans: plansCount,
  };

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Site Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every user and every project on the platform, not just yours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {TABS.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            const count = counts[tab.name];
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs font-medium px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                {tab.name}
                {tab.name === "Contact" && contactUnreadCount > 0 && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      active ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {contactUnreadCount}
                  </span>
                )}
                {typeof count === "number" && count > 0 ? ` (${count})` : ""}
              </Link>
            );
          })}

          <div className="flex-1" />

          <Link
            href="/dashboard/admin/broadcast"
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              isTabActive(pathname, "/dashboard/admin/broadcast")
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Broadcast
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
