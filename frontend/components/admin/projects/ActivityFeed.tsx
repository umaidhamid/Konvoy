"use client";

import React from "react";
import {
  Activity as ActivityIcon,
  FolderKanban,
  UserPlus,
  UserMinus,
  FilePlus,
  FileEdit,
  FileMinus,
  History,
  LucideIcon,
} from "lucide-react";
import { timeAgo } from "@/lib/adminFormat";
import { ActivityAction, ActivityEntry, Pagination } from "@/types/activity.types";

const ACTION_META: Record<ActivityAction, { icon: LucideIcon; color: string }> = {
  project_created: { icon: FolderKanban, color: "text-primary" },
  project_updated: { icon: FolderKanban, color: "text-primary" },
  member_added: { icon: UserPlus, color: "text-success" },
  member_removed: { icon: UserMinus, color: "text-destructive" },
  member_left: { icon: UserMinus, color: "text-muted-foreground" },
  file_created: { icon: FilePlus, color: "text-primary" },
  file_renamed: { icon: FileEdit, color: "text-muted-foreground" },
  file_deleted: { icon: FileMinus, color: "text-destructive" },
  file_version_restored: { icon: History, color: "text-warning" },
};

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const meta = ACTION_META[entry.action] ?? { icon: ActivityIcon, color: "text-muted-foreground" };
  const Icon = meta.icon;
  const actorLabel = entry.isMine ? "You" : entry.actor?.name || "Someone";
  const absoluteDate = new Date(entry.createdAt).toLocaleString();

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-secondary ${meta.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          <span className="font-medium">{actorLabel}</span> {entry.message}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5" title={absoluteDate}>
          {timeAgo(entry.createdAt)}
        </p>
      </div>
    </li>
  );
}

export function ActivityFeed({ entries, loading }: { entries: ActivityEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <ActivityIcon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <ActivityRow key={entry._id} entry={entry} />
      ))}
    </ul>
  );
}

export function ActivityFooter({
  pagination,
  loadingMore,
  onLoadMore,
}: {
  pagination: Pagination | null;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (!pagination || pagination.total === 0) return null;
  const hasMore = pagination.page < pagination.pages;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-[11px] text-muted-foreground">
        {pagination.total} update{pagination.total === 1 ? "" : "s"}
      </span>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
