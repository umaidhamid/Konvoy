"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { AdminContactQuery } from "@/types/admin.types";
import { Pager } from "@/components/admin/dashboard/Pager";
import { timeAgo } from "@/lib/adminFormat";

export default function AdminContactPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [contactPage, setContactPage] = useState(1);
  const [contactSearchInput, setContactSearchInput] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setContactSearch(contactSearchInput);
      setContactPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [contactSearchInput]);

  const canLoad = !!user && user.role === "admin";

  const contactQuery = useQuery({
    queryKey: ["adminContact", contactPage, contactSearch],
    queryFn: () => adminService.getContactQueries(contactPage, 20, contactSearch),
    enabled: canLoad,
    placeholderData: keepPreviousData,
  });

  const contactQueries = contactQuery.data?.data ?? [];
  const contactPagination = contactQuery.data?.pagination ?? null;
  const error = (contactQuery.error as any)?.response?.data?.message || "";

  const contactReadMutation = useMutation({
    mutationFn: ({ queryId, isRead }: { queryId: string; isRead: boolean }) =>
      adminService.setContactQueryRead(queryId, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContact"] });
    },
  });

  const handleToggleQueryExpand = (q: AdminContactQuery) => {
    const opening = expandedQueryId !== q._id;
    setExpandedQueryId(opening ? q._id : null);
    if (opening && !q.isRead) {
      contactReadMutation.mutate({ queryId: q._id, isRead: true });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={contactSearchInput}
          onChange={(e) => setContactSearchInput(e.target.value)}
          placeholder="Search by name, email, or subject..."
          className="w-full sm:w-64 px-3 py-2 bg-background border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {contactQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border">
          {contactQueries.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground text-sm">No messages yet.</p>
          ) : (
            contactQueries.map((q) => {
              const expanded = expandedQueryId === q._id;
              return (
                <div key={q._id}>
                  <button
                    onClick={() => handleToggleQueryExpand(q)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-card-hover transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      {!q.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      <div className="min-w-0">
                        <div className={`text-sm truncate ${q.isRead ? "text-muted-foreground" : "font-medium text-foreground"}`}>
                          {q.subject}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {q.name} · {q.email}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(q.createdAt)}</span>
                  </button>
                  {expanded && (
                    <div className="px-4 pb-4 -mt-1">
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-background border border-border rounded-lg p-3">
                        {q.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <a href={`mailto:${q.email}`} className="text-xs text-primary hover:underline">
                          Reply by email
                        </a>
                        <button
                          onClick={() => contactReadMutation.mutate({ queryId: q._id, isRead: !q.isRead })}
                          className="text-xs text-muted-foreground hover:text-foreground transition"
                        >
                          Mark as {q.isRead ? "unread" : "read"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <Pager pagination={contactPagination} onPage={setContactPage} />
        </div>
      )}
    </div>
  );
}
