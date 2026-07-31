"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronUp, Lightbulb, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { featureRequestService } from "@/services/featureRequest.service";
import { FeatureRequest, FeatureRequestStatus } from "@/types/featureRequest.types";

const STATUS_TABS: { value: FeatureRequestStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "planned", label: "Planned" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "declined", label: "Declined" },
];

const STATUS_STYLES: Record<FeatureRequestStatus, string> = {
  open: "bg-secondary text-secondary-foreground",
  planned: "bg-primary/10 text-primary border border-primary/20",
  "in-progress": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  done: "bg-success/10 text-success border border-success/20",
  declined: "bg-destructive/5 text-destructive border border-destructive/20",
};

function authorLabel(createdBy: FeatureRequest["createdBy"]) {
  if (typeof createdBy === "string") return "Someone";
  return createdBy.fullname || createdBy.email || "Someone";
}

function timeAgo(dateString: string) {
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

export default function FeedbackPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FeatureRequestStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const query = useQuery({
    queryKey: ["featureRequests", statusFilter],
    queryFn: () => featureRequestService.list(statusFilter),
  });
  const requests = query.data?.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["featureRequests"] });

  const createMutation = useMutation({
    mutationFn: () => featureRequestService.create(title.trim(), description.trim()),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setTitle("");
      setDescription("");
      toast.success("Idea submitted");
    },
    onError: (err: any) => setFormError(err?.response?.data?.message || "Could not submit this idea."),
  });

  const voteMutation = useMutation({
    mutationFn: (id: string) => featureRequestService.toggleVote(id),
    onSuccess: invalidate,
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not update your vote."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => featureRequestService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Removed");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not remove this idea."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeatureRequestStatus }) => featureRequestService.setStatus(id, status),
    onSuccess: invalidate,
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not update status."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (title.trim().length < 3) return setFormError("Title must be at least 3 characters.");
    createMutation.mutate();
  };

  const handleDelete = (r: FeatureRequest) => {
    if (!confirm(`Remove "${r.title}"?`)) return;
    deleteMutation.mutate(r._id);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Suggest what Konvoy should build next, and upvote the ideas you want most.
            </p>
          </div>
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-3.5 py-2 rounded-lg hover:opacity-90 transition shrink-0"
          >
            {formOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {formOpen ? "Cancel" : "Submit an idea"}
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">Title</label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dark mode for the web editor"
                maxLength={120}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">
                Details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="What would this help you do?"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>
            {formError && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">{formError}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {createMutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`text-xs font-medium px-3.5 py-2 rounded-lg transition ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/30">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No ideas here yet - be the first to submit one.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {requests.map((r) => (
              <div key={r._id} className="flex gap-3 p-4 rounded-xl border border-border bg-card">
                <button
                  onClick={() => voteMutation.mutate(r._id)}
                  disabled={voteMutation.isPending}
                  className={`shrink-0 flex flex-col items-center justify-center gap-0.5 w-12 h-14 rounded-lg border transition disabled:opacity-50 ${
                    r.hasVoted
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-xs font-semibold">{r.voteCount}</span>
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    {(r.isMine || user?.role === "admin") && (
                      <button
                        onClick={() => handleDelete(r)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>}
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                      {r.status.replace("-", " ")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {authorLabel(r.createdBy)} · {timeAgo(r.createdAt)}
                    </span>
                    {user?.role === "admin" && (
                      <select
                        value={r.status}
                        onChange={(e) => statusMutation.mutate({ id: r._id, status: e.target.value as FeatureRequestStatus })}
                        className="ml-auto text-[11px] px-2 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border"
                      >
                        {STATUS_TABS.filter((t) => t.value !== "all").map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
