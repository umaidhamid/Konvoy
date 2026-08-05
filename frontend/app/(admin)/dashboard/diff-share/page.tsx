"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, GitCompare, Trash2, ShieldCheck, Eye, Clock3, Layers } from "lucide-react";
import { diffShareService } from "@/services/diffShare.service";
import { DIFF_EXPIRY_OPTIONS, DIFF_MAX_VIEWS_OPTIONS, MyDiffShare } from "@/types/diffShare.types";

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function timeUntil(dateString: string) {
  const ms = new Date(dateString).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const minutes = Math.ceil(ms / (1000 * 60));
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.ceil(hours / 24);
  return `in ${days}d`;
}

function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";
const selectClass =
  "px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";
const labelClass = "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5";

const LANGUAGE_OPTIONS = [
  "plaintext", "javascript", "typescript", "python", "json", "yaml", "html", "css", "shell", "sql", "markdown",
];

function maxViewsKey(v: number | null) {
  return v === null ? "unlimited" : String(v);
}
function parseMaxViewsKey(key: string): number | null {
  return key === "unlimited" ? null : Number(key);
}

function statusOf(d: MyDiffShare) {
  if (new Date(d.expiresAt).getTime() < Date.now()) return { label: "Expired", active: false };
  if (d.maxViews !== null && d.viewCount >= d.maxViews) return { label: "Limit reached", active: false };
  return { label: "Active", active: true };
}

export default function DiffSharePage() {
  const queryClient = useQueryClient();
  const origin = useOrigin();

  const [title, setTitle] = useState("");
  const [leftLabel, setLeftLabel] = useState("Original");
  const [rightLabel, setRightLabel] = useState("Modified");
  const [leftContent, setLeftContent] = useState("");
  const [rightContent, setRightContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(DIFF_EXPIRY_OPTIONS[2].minutes);
  const [maxViews, setMaxViews] = useState<string>(maxViewsKey(null));
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [createdMaxViews, setCreatedMaxViews] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  const myDiffsQuery = useQuery({ queryKey: ["myDiffShares"], queryFn: () => diffShareService.listMyDiffShares() });
  const diffs = myDiffsQuery.data?.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["myDiffShares"] });

  const createMutation = useMutation({
    mutationFn: () =>
      diffShareService.createDiffShare(
        leftContent,
        rightContent,
        expiresInMinutes,
        parseMaxViewsKey(maxViews),
        title,
        leftLabel,
        rightLabel,
        language
      ),
    onSuccess: (res) => {
      setCreatedLink(`${window.location.origin}/share/diff/${res.data.token}`);
      setCreatedMaxViews(res.data.maxViews);
      setTitle("");
      setLeftContent("");
      setRightContent("");
      invalidate();
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Could not create the diff link.";
      setFormError(message);
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => diffShareService.deleteDiffShare(id),
    onSuccess: () => {
      invalidate();
      toast.success("Removed");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not remove this entry."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!leftContent.trim() && !rightContent.trim()) return setFormError("Add content to at least one side.");
    setCreatedLink(null);
    createMutation.mutate();
  };

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <GitCompare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Diff Share</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Paste two blocks of text or code and get a shareable read-only diff link - handy for comparing
              configs, logs, or a code change without granting access to a project.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <input
                  value={leftLabel}
                  onChange={(e) => setLeftLabel(e.target.value)}
                  maxLength={40}
                  placeholder="Left label"
                  className="w-full px-2 py-1 bg-transparent text-xs font-semibold text-muted-foreground tracking-wide uppercase focus:outline-none focus:text-foreground transition border-b border-transparent focus:border-border"
                />
                <textarea
                  value={leftContent}
                  onChange={(e) => setLeftContent(e.target.value)}
                  rows={11}
                  placeholder="Paste the original content..."
                  className={inputClass + " font-mono resize-none"}
                />
                <p className="text-[11px] text-muted-foreground text-right">{leftContent.length.toLocaleString()} chars</p>
              </div>
              <div className="space-y-1.5">
                <input
                  value={rightLabel}
                  onChange={(e) => setRightLabel(e.target.value)}
                  maxLength={40}
                  placeholder="Right label"
                  className="w-full px-2 py-1 bg-transparent text-xs font-semibold text-muted-foreground tracking-wide uppercase focus:outline-none focus:text-foreground transition border-b border-transparent focus:border-border"
                />
                <textarea
                  value={rightContent}
                  onChange={(e) => setRightContent(e.target.value)}
                  rows={11}
                  placeholder="Paste the modified content..."
                  className={inputClass + " font-mono resize-none"}
                />
                <p className="text-[11px] text-muted-foreground text-right">{rightContent.length.toLocaleString()} chars</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div>
                <label className={labelClass}>Title (optional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Staging config change" maxLength={80} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass + " w-full"}>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expires</label>
                <select value={expiresInMinutes} onChange={(e) => setExpiresInMinutes(Number(e.target.value))} className={selectClass + " w-full"}>
                  {DIFF_EXPIRY_OPTIONS.map((o) => (
                    <option key={o.minutes} value={o.minutes}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Max views</label>
                <select value={maxViews} onChange={(e) => setMaxViews(e.target.value)} className={selectClass + " w-full"}>
                  {DIFF_MAX_VIEWS_OPTIONS.map((o) => (
                    <option key={maxViewsKey(o.value)} value={maxViewsKey(o.value)}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              {formError ? (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg flex-1">
                  {formError}
                </p>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={(!leftContent.trim() && !rightContent.trim()) || createMutation.isPending}
                className="shrink-0 px-5 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {createMutation.isPending ? "Creating..." : "Create diff link"}
              </button>
            </div>
          </form>

          {createdLink && (
            <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" /> Diff link created
                {createdMaxViews !== null && (
                  <span className="text-muted-foreground normal-case font-normal">
                    · limited to {createdMaxViews} view{createdMaxViews === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input readOnly value={createdLink} onFocus={(e) => e.target.select()} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono" />
                <button onClick={() => copyLink(createdLink)} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Your diff links</h2>
          </div>
          {myDiffsQuery.isLoading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : diffs.length === 0 ? (
            <div className="text-center py-10 px-4">
              <GitCompare className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You haven't shared a diff yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {diffs.map((d: MyDiffShare) => {
                const link = `${origin}/share/diff/${d.token}`;
                const status = statusOf(d);
                return (
                  <div key={d._id} className="px-6 py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${status.active ? "text-success" : "text-muted-foreground"}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {d.viewCount} / {d.maxViews ?? "∞"}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {d.language}
                        </span>
                        {d.title && <span className="text-sm font-medium text-foreground truncate">{d.title}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {d.leftLabel} vs {d.rightLabel} · Created {timeAgo(d.createdAt)}
                        {status.active && (
                          <>
                            {" "}· <Clock3 className="w-3 h-3 inline" /> Expires {timeUntil(d.expiresAt)}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {status.active && (
                        <button onClick={() => copyLink(link)} title="Copy link" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(d._id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
