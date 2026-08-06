"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DiffEditor } from "@monaco-editor/react";
import { ArrowRight, Clock3, Copy, Eye, GitCompare, Layers, Loader2, ShieldAlert, ShieldX } from "lucide-react";
import { BrandMark } from "@/components/auth/brand-mark";
import { diffShareService } from "@/services/diffShare.service";
import { DiffShareContent } from "@/types/diffShare.types";

function formatCountdown(ms: number) {
  if (ms <= 0) return "expired";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function ShareDiffPage() {
  const { token } = useParams<{ token: string }>();
  const [diff, setDiff] = useState<DiffShareContent | null>(null);
  const [error, setError] = useState("");
  const [exhausted, setExhausted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sideBySide, setSideBySide] = useState(true);

  useEffect(() => {
    if (!token) return;
    diffShareService
      .getDiffShare(token)
      .then((res) => setDiff(res.data))
      .catch((err) => {
        setExhausted(err?.response?.status === 410);
        setError(err?.response?.data?.message || "This diff link is invalid or has expired.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const remainingMs = diff ? new Date(diff.expiresAt).getTime() - Date.now() : 0;
  const viewsLabel = diff ? `${diff.viewCount} / ${diff.maxViews ?? "∞"} views used` : "";

  return (
    <main className="h-screen w-full bg-background text-foreground antialiased flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-background">
        <div className="w-full max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="shrink-0 scale-90 origin-left">
            <BrandMark />
          </a>
          <a
            href="/auth/register"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            Create your own diff link <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </header>
      <div className="flex-1 min-h-0 pt-4 pb-4 px-4 flex flex-col">
        <div className="w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading diff...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="rounded-2xl border border-border bg-card p-8 max-w-sm w-full text-center">
                {exhausted ? (
                  <ShieldX className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                ) : (
                  <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                )}
                <p className="text-sm font-medium text-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Ask whoever sent this link to share it again.
                </p>
              </div>
            </div>
          ) : diff ? (
            <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <GitCompare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-semibold truncate">{diff.title || `${diff.leftLabel} vs ${diff.rightLabel}`}</h1>
                    <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                      <span>{diff.leftLabel} <span className="text-border">vs</span> {diff.rightLabel}</span>
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {diff.language}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {viewsLabel}</span>
                      <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" /> Expires in {formatCountdown(remainingMs)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy link
                  </button>
                  <button
                    onClick={() => setSideBySide((v) => !v)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition"
                  >
                    {sideBySide ? "Inline view" : "Side-by-side view"}
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative">
                <DiffEditor
                  theme="light"
                  language={diff.language}
                  original={diff.leftContent}
                  modified={diff.rightContent}
                  options={{
                    readOnly: true,
                    renderSideBySide: sideBySide,
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                  loading={
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
