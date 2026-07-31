"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Monitor, ShieldCheck, LogOut } from "lucide-react";
import { authService } from "@/services/auth.service";
import { DeviceSession } from "@/types/session.types";

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function SecurityPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["sessions"],
    queryFn: () => authService.getSessions(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sessions"] });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      invalidate();
      toast.success("Signed out of that device");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not sign out that device."),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: () => authService.revokeOtherSessions(),
    onSuccess: (res: any) => {
      invalidate();
      toast.success(res?.message || "Signed out of other devices");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not sign out other devices."),
  });

  const sessions: DeviceSession[] = query.data?.data ?? [];
  const otherCount = sessions.filter((s) => !s.isCurrent).length;

  const handleRevoke = (session: DeviceSession) => {
    if (!confirm(`Sign out of "${session.device}"? That device will need to log in again.`)) return;
    revokeMutation.mutate(session._id);
  };

  const handleRevokeOthers = () => {
    if (!confirm(`Sign out of ${otherCount} other device(s)? They'll need to log in again.`)) return;
    revokeOthersMutation.mutate();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Security</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every device currently signed into your account. If you don't recognize one, sign it out.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Active sessions {sessions.length ? `(${sessions.length})` : ""}</h2>
            {otherCount > 0 && (
              <button
                onClick={handleRevokeOthers}
                disabled={revokeOthersMutation.isPending}
                className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:opacity-80 px-3 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 transition disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out of {otherCount} other device{otherCount > 1 ? "s" : ""}
              </button>
            )}
          </div>

          {query.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((s) => (
                <div key={s._id} className="px-6 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{s.device}</p>
                        {s.isCurrent && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <ShieldCheck className="w-3 h-3" /> This device
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.ip ? `${s.ip} · ` : ""}Active {timeAgo(s.lastActiveAt)} · Signed in {timeAgo(s.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!s.isCurrent && (
                    <button
                      onClick={() => handleRevoke(s)}
                      disabled={revokeMutation.isPending}
                      className="shrink-0 text-xs font-medium text-destructive hover:opacity-80 px-3 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 transition disabled:opacity-50"
                    >
                      Sign out
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
