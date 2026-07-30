"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, KeyRound, Trash2, ShieldCheck, Mail, RefreshCcw, Lock, Clock3, Download, LogIn, ChevronDown } from "lucide-react";
import { secretService } from "@/services/secret.service";
import { EXPIRY_OPTIONS, MAX_VIEWS_OPTIONS, MySecret } from "@/types/secret.types";

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

function statusOf(s: MySecret) {
  if (s.isRevoked) return { label: "Revoked", className: "text-muted-foreground", active: false };
  if (new Date(s.expiresAt).getTime() < Date.now()) return { label: "Expired", className: "text-muted-foreground", active: false };
  if (s.maxViews !== null && s.viewCount >= s.maxViews) return { label: "Limit reached", className: "text-muted-foreground", active: false };
  return { label: "Active", className: "text-success", active: true };
}

// Amber/red as an active secret's expiry approaches, so you notice before it dies unused.
function urgencyClassOf(s: MySecret) {
  const total = new Date(s.expiresAt).getTime() - new Date(s.createdAt).getTime();
  const remaining = new Date(s.expiresAt).getTime() - Date.now();
  const pct = total > 0 ? remaining / total : 0;
  if (pct < 0.1 || remaining < 2 * 60 * 1000) return "text-destructive";
  if (pct < 0.4) return "text-amber-500";
  return "text-muted-foreground";
}

function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";
const labelClass = "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5";

function maxViewsKey(v: number | null) {
  return v === null ? "unlimited" : String(v);
}
function parseMaxViewsKey(key: string): number | null {
  return key === "unlimited" ? null : Number(key);
}

function RecreatePicker({
  busy,
  onConfirm,
  onCancel,
}: {
  busy: boolean;
  onConfirm: (expiresInMinutes: number, maxViews: number | null) => void;
  onCancel: () => void;
}) {
  const [minutes, setMinutes] = useState<number>(EXPIRY_OPTIONS[0].minutes);
  const [maxViews, setMaxViews] = useState<string>(maxViewsKey(1));

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border">
        {EXPIRY_OPTIONS.map((o) => (
          <option key={o.minutes} value={o.minutes}>{o.label}</option>
        ))}
      </select>
      <select value={maxViews} onChange={(e) => setMaxViews(e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border">
        {MAX_VIEWS_OPTIONS.map((o) => (
          <option key={maxViewsKey(o.value)} value={maxViewsKey(o.value)}>{o.label}</option>
        ))}
      </select>
      <button
        disabled={busy}
        onClick={() => onConfirm(minutes, parseMaxViewsKey(maxViews))}
        className="text-xs font-medium px-2 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
      >
        Create
      </button>
      <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition">Cancel</button>
    </div>
  );
}

function ExtendPicker({ busy, onConfirm, onCancel }: { busy: boolean; onConfirm: (addMinutes: number) => void; onCancel: () => void }) {
  const [minutes, setMinutes] = useState<number>(EXPIRY_OPTIONS[0].minutes);
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border">
        {EXPIRY_OPTIONS.map((o) => (
          <option key={o.minutes} value={o.minutes}>+{o.label}</option>
        ))}
      </select>
      <button
        disabled={busy}
        onClick={() => onConfirm(minutes)}
        className="text-xs font-medium px-2 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
      >
        Extend
      </button>
      <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition">Cancel</button>
    </div>
  );
}

export default function SecretsPage() {
  const queryClient = useQueryClient();
  const origin = useOrigin();

  const [content, setContent] = useState("");
  const [label, setLabel] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [requireAuth, setRequireAuth] = useState(false);
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(EXPIRY_OPTIONS[0].minutes);
  const [maxViews, setMaxViews] = useState<string>(maxViewsKey(1));
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [createdHasPassphrase, setCreatedHasPassphrase] = useState(false);
  const [formError, setFormError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Limit reached" | "Expired" | "Revoked">("");
  const [recreatingId, setRecreatingId] = useState<string | null>(null);
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const mySecretsQuery = useQuery({ queryKey: ["mySecrets"], queryFn: () => secretService.listMySecrets() });
  const secrets = mySecretsQuery.data?.data ?? [];
  const filteredSecrets = secrets.filter((s) => {
    const status = statusOf(s);
    if (statusFilter && status.label !== statusFilter) return false;
    if (searchInput && !s.label.toLowerCase().includes(searchInput.toLowerCase())) return false;
    return true;
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["mySecrets"] });

  const createMutation = useMutation({
    mutationFn: () => secretService.createSecret(content, expiresInMinutes, parseMaxViewsKey(maxViews), label, passphrase, requireAuth),
    onSuccess: (res) => {
      setCreatedLink(`${window.location.origin}/share/${res.data.token}`);
      setCreatedHasPassphrase(!!passphrase.trim());
      setContent("");
      setLabel("");
      setPassphrase("");
      setRequireAuth(false);
      invalidate();
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Could not create the share link.";
      setFormError(message);
      toast.error(message);
    },
  });

  const recreateMutation = useMutation({
    mutationFn: ({ id, expiresInMinutes, maxViews }: { id: string; expiresInMinutes: number; maxViews: number | null }) =>
      secretService.recreateSecret(id, expiresInMinutes, maxViews),
    onSuccess: (res) => {
      setCreatedLink(`${window.location.origin}/share/${res.data.token}`);
      setCreatedHasPassphrase(false);
      setRecreatingId(null);
      invalidate();
      toast.success("New link created");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not recreate the link."),
  });

  const extendMutation = useMutation({
    mutationFn: ({ id, addMinutes }: { id: string; addMinutes: number }) => secretService.extendSecret(id, addMinutes),
    onSuccess: () => {
      setExtendingId(null);
      invalidate();
      toast.success("Expiry extended");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not extend this link."),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => secretService.revokeSecret(id),
    onSuccess: () => {
      invalidate();
      toast.success("Link revoked");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not revoke the link."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => secretService.deleteSecretHistory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Removed from history");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not remove this entry."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!content.trim()) return setFormError("Secret content is required.");
    if (passphrase && passphrase.trim().length < 4) {
      return setFormError("Passphrase must be at least 4 characters - leave it blank to skip a passphrase.");
    }
    if (label.trim().length > 60) return setFormError("Label can't exceed 60 characters.");
    setCreatedLink(null);
    createMutation.mutate();
  };

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const mailtoFor = (link: string) =>
    `mailto:?subject=${encodeURIComponent("A secret has been shared with you")}&body=${encodeURIComponent(`Open this link to view it: ${link}`)}`;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Secrets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Share a password, API key, or config value through a link instead of chat or email - it expires on its
            own, and can be capped to a set number of views.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Secret</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Paste the value you want to share..."
                className={inputClass + " font-mono resize-none"}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Label (optional, only visible to you)</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Staging DB password" maxLength={60} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Passphrase (optional)</label>
                <input
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Recipient must enter this to view"
                  maxLength={100}
                  className={inputClass}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {passphrase && passphrase.trim().length < 4 ? (
                    <span className="text-destructive">At least 4 characters, or clear this field.</span>
                  ) : (
                    "Leave blank to skip - at least 4 characters if set."
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className={labelClass}>Expires</label>
                <select value={expiresInMinutes} onChange={(e) => setExpiresInMinutes(Number(e.target.value))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition">
                  {EXPIRY_OPTIONS.map((o) => (
                    <option key={o.minutes} value={o.minutes}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Max views</label>
                <select value={maxViews} onChange={(e) => setMaxViews(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition">
                  {MAX_VIEWS_OPTIONS.map((o) => (
                    <option key={maxViewsKey(o.value)} value={maxViewsKey(o.value)}>{o.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer pb-2.5">
                <input type="checkbox" checked={requireAuth} onChange={(e) => setRequireAuth(e.target.checked)} />
                Require Konvoy sign-in to view
              </label>

              <button
                type="submit"
                disabled={!content.trim() || (!!passphrase && passphrase.trim().length < 4) || createMutation.isPending}
                className="ml-auto px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {createMutation.isPending ? "Creating..." : "Create share link"}
              </button>
            </div>

            {formError && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
          </form>

          {createdLink && (
            <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" /> This is the only time you'll see this link
              </div>
              {createdHasPassphrase && (
                <p className="text-xs text-muted-foreground mt-1">Remember to share the passphrase separately - it isn't included in the link.</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <input readOnly value={createdLink} onFocus={(e) => e.target.select()} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono" />
                <button onClick={() => copyLink(createdLink)} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <a href={mailtoFor(createdLink)} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg hover:bg-secondary/70 transition">
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex flex-wrap items-center gap-2 justify-between">
            <h2 className="text-sm font-semibold">Your share links</h2>
            {secrets.length > 0 && (
              <div className="flex items-center gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary transition">
                  <option value="">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Limit reached">Limit reached</option>
                  <option value="Expired">Expired</option>
                  <option value="Revoked">Revoked</option>
                </select>
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by label..." className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition w-36" />
                <button
                  onClick={() => window.open(secretService.exportCsvUrl(), "_blank")}
                  title="Export CSV"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          {mySecretsQuery.isLoading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : filteredSecrets.length === 0 ? (
            <div className="text-center py-10 px-4">
              <KeyRound className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{secrets.length === 0 ? "You haven't shared anything yet." : "No links match that filter."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredSecrets.map((s) => {
                const status = statusOf(s);
                const link = `${origin}/share/${s.token}`;
                const viewsPct = s.maxViews ? Math.min(100, Math.round((s.viewCount / s.maxViews) * 100)) : 0;
                return (
                  <div key={s._id} className="px-6 py-3 space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold ${status.active ? urgencyClassOf(s) : status.className}`}>{status.label}</span>
                          <span className="text-xs text-muted-foreground">{s.viewCount} / {s.maxViews ?? "∞"} views</span>
                          {s.hasPassphrase && (
                            <span title="Passphrase protected"><Lock className="w-3 h-3 text-muted-foreground" /></span>
                          )}
                          {s.requireAuth && (
                            <span title="Requires sign-in"><LogIn className="w-3 h-3 text-muted-foreground" /></span>
                          )}
                          {s.label && <span className="text-sm font-medium text-foreground truncate">{s.label}</span>}
                        </div>
                        {s.maxViews && (
                          <div className="h-1 rounded-full bg-secondary overflow-hidden mt-1.5 max-w-[160px]">
                            <div className={`h-full rounded-full ${viewsPct >= 100 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${viewsPct}%` }} />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {timeAgo(s.createdAt)}
                          {status.active && ` · Expires ${timeUntil(s.expiresAt)}`}
                          {s.viewedAt && ` · Last viewed ${timeAgo(s.viewedAt)}`}
                        </p>
                        {s.viewLog.length > 0 && (
                          <button
                            onClick={() => setExpandedLogId(expandedLogId === s._id ? null : s._id)}
                            className="flex items-center gap-1 text-[11px] text-primary hover:underline mt-1"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedLogId === s._id ? "rotate-180" : ""}`} />
                            View history ({s.viewLog.length})
                          </button>
                        )}
                        {expandedLogId === s._id && (
                          <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                            {s.viewLog.map((v, i) => (
                              <li key={i}>Viewed {timeAgo(v)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {status.active && (
                          <>
                            <button onClick={() => copyLink(link)} title="Copy link" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <a href={mailtoFor(link)} title="Share via email" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                            <button onClick={() => setExtendingId(extendingId === s._id ? null : s._id)} title="Extend expiry" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                              <Clock3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => revokeMutation.mutate(s._id)}
                              disabled={revokeMutation.isPending}
                              className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:opacity-80 px-3 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 transition disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Revoke
                            </button>
                          </>
                        )}
                        {!status.active && recreatingId !== s._id && (
                          <>
                            <button onClick={() => setRecreatingId(s._id)} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 px-3 py-1.5 rounded bg-primary/5 hover:bg-primary/10 transition">
                              <RefreshCcw className="w-3.5 h-3.5" /> Recreate
                            </button>
                            <button onClick={() => deleteMutation.mutate(s._id)} disabled={deleteMutation.isPending} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition disabled:opacity-50" title="Delete from history">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {recreatingId === s._id && (
                      <RecreatePicker
                        busy={recreateMutation.isPending}
                        onCancel={() => setRecreatingId(null)}
                        onConfirm={(minutes, mv) => recreateMutation.mutate({ id: s._id, expiresInMinutes: minutes, maxViews: mv })}
                      />
                    )}
                    {extendingId === s._id && (
                      <ExtendPicker
                        busy={extendMutation.isPending}
                        onCancel={() => setExtendingId(null)}
                        onConfirm={(addMinutes) => extendMutation.mutate({ id: s._id, addMinutes })}
                      />
                    )}
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
