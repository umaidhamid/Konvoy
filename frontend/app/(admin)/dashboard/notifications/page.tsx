"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  CreditCard,
  FolderKanban,
  HardDrive,
  KeyRound,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { notificationsService } from "@/services/notifications.service";
import { Notification, Pagination } from "@/types/notification.types";

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

function iconForType(type: string) {
  if (type.startsWith("project_")) return FolderKanban;
  if (type.startsWith("member_")) return Users;
  if (type === "account_deactivated") return ShieldAlert;
  if (type === "account_reactivated" || type === "role_changed") return ShieldCheck;
  if (type === "plan_changed") return CreditCard;
  if (type === "storage_granted" || type === "referral_reward") return HardDrive;
  if (type === "secret_viewed") return KeyRound;
  if (type === "announcement") return Megaphone;
  return Bell;
}

function projectHref(projectId: Notification["projectId"]) {
  if (!projectId || typeof projectId === "string") return null;
  return `/dashboard/projects/${projectId.slug}`;
}

function Pager({ pagination, onPage }: { pagination: Pagination | null; onPage: (page: number) => void }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
      <span>
        Page {pagination.page} of {pagination.pages} · {pagination.total} total
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/70 transition"
        >
          Prev
        </button>
        <button
          onClick={() => onPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
          className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/70 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const query = useQuery({
    queryKey: ["notifications", page, unreadOnly],
    queryFn: () => notificationsService.getNotifications(page, 20, unreadOnly),
    placeholderData: keepPreviousData,
  });

  const notifications = query.data?.data ?? [];
  const pagination = query.data?.pagination ?? null;
  const unreadCount = query.data?.unreadCount ?? 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: invalidate,
  });

  const clearReadMutation = useMutation({
    mutationFn: () => notificationsService.clearRead(),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.message || "Cleared");
    },
  });

  const handleRowClick = (n: Notification) => {
    if (!n.read) markReadMutation.mutate(n._id);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Everything that's happened across your projects, plan, and account.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setUnreadOnly(false);
              setPage(1);
            }}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition ${
              !unreadOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setUnreadOnly(true);
              setPage(1);
            }}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition ${
              unreadOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>

          <div className="flex-1" />

          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition disabled:opacity-50"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => clearReadMutation.mutate()}
            disabled={clearReadMutation.isPending}
            className="text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition disabled:opacity-50"
          >
            Clear read
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {query.isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bell className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {unreadOnly ? "No unread notifications." : "Nothing here yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = iconForType(n.type);
                const href = projectHref(n.projectId);
                const content = (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteMutation.mutate(n._id);
                      }}
                      className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                );

                return href ? (
                  <Link
                    key={n._id}
                    href={href}
                    onClick={() => handleRowClick(n)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-card-hover transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={n._id}
                    onClick={() => handleRowClick(n)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-card-hover transition-colors cursor-pointer"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          )}
          <Pager pagination={pagination} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}
