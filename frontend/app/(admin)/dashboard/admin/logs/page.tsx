"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { timeAgo, memberLabel } from "@/lib/adminFormat";

export default function AdminLogsPage() {
  const { user } = useAuth();
  const canLoad = !!user && user.role === "admin";

  const logsQuery = useQuery({
    queryKey: ["adminLogs"],
    queryFn: () => adminService.getLogs(),
    enabled: canLoad,
  });
  const logs = logsQuery.data?.data ?? [];
  const error = (logsQuery.error as any)?.response?.data?.message || "";

  if (logsQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      <div className="border border-border rounded-lg divide-y divide-border">
        {logs.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground text-sm">No admin actions yet.</p>
        ) : (
          logs.map((l) => (
            <div key={l._id} className="px-4 py-3 flex items-start justify-between gap-3 text-sm">
              <div>
                <span className="font-medium text-foreground">{memberLabel(l.actorId)}</span>{" "}
                <span className="text-muted-foreground">{l.details}</span>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(l.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
