"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
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
          { label: "Total Users", value: stats?.totalUsers ?? "—" },
          { label: "Total Projects", value: stats?.totalProjects ?? "—" },
          { label: "Total Files", value: stats?.totalFiles ?? "—" },
          { label: "Storage Used", value: stats ? formatBytes(stats.totalSizeBytes) : "—" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-card border border-border p-5 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</div>
          </div>
        ))}
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
