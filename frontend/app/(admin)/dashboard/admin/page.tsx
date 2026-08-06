"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Gauge, HardDrive, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { formatBytes } from "@/lib/formatBytes";
import { memberLabel } from "@/lib/adminFormat";

export default function AdminOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const canLoad = !authLoading && !!user && user.role === "admin";

  const statsQuery = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => adminService.getStats(),
    enabled: canLoad,
  });
  const stats = statsQuery.data?.data ?? null;
  const error = (statsQuery.error as any)?.response?.data?.message || "";

  if (statsQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, href: "/dashboard/admin/users" },
          { label: "Total Projects", value: stats?.totalProjects ?? "—", icon: FolderKanban, href: "/dashboard/admin/projects" },
          { label: "Total Files", value: stats?.totalFiles ?? "—", icon: Gauge, href: null },
          { label: "Storage Used", value: stats ? formatBytes(stats.totalSizeBytes) : "—", icon: HardDrive, href: null },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const content = (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</div>
            </>
          );
          return stat.href ? (
            <Link
              key={idx}
              href={stat.href}
              className="bg-card border border-border p-5 rounded-lg hover:border-primary/40 transition-colors"
            >
              {content}
            </Link>
          ) : (
            <div key={idx} className="bg-card border border-border p-5 rounded-lg">
              {content}
            </div>
          );
        })}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Top Projects by Storage</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-card text-xs text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="text-left font-medium px-4 py-3">Project</th>
              <th className="text-left font-medium px-4 py-3">Owner</th>
              <th className="text-left font-medium px-4 py-3">Files</th>
              <th className="text-left font-medium px-4 py-3">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!stats?.topProjects.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No files uploaded yet.
                </td>
              </tr>
            ) : (
              stats.topProjects.map((p) => (
                <tr key={p.projectId}>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{memberLabel(p.owner)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.fileCount}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatBytes(p.sizeBytes)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
