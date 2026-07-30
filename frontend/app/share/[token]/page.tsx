"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Copy, Eye, KeyRound, Lock, LogIn, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { Navbar } from "@/components/client/navbar";
import { secretService } from "@/services/secret.service";
import { SecretPeek } from "@/types/secret.types";

const AUTO_HIDE_SECONDS = 60;

function formatCountdown(ms: number) {
  if (ms <= 0) return "expired";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function ShareSecretPage() {
  const { token } = useParams<{ token: string }>();
  const [peek, setPeek] = useState<SecretPeek | null>(null);
  const [peekError, setPeekError] = useState("");
  const [loading, setLoading] = useState(true);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [retryableError, setRetryableError] = useState("");
  const [deadError, setDeadError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [hidden, setHidden] = useState(false);
  const [burned, setBurned] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_HIDE_SECONDS);

  useEffect(() => {
    if (!token) return;
    secretService
      .peekSecret(token)
      .then((res) => setPeek(res.data))
      .catch((err) => setPeekError(err?.response?.data?.message || "This link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!peek || revealed !== null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [peek, revealed]);

  // Auto-hide the revealed content after a minute so it doesn't linger on screen.
  useEffect(() => {
    if (revealed === null || hidden) return;
    if (secondsLeft <= 0) {
      setHidden(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [revealed, hidden, secondsLeft]);

  const handleReveal = async () => {
    setRevealing(true);
    setRetryableError("");
    setNeedsSignIn(false);
    try {
      const res = await secretService.revealSecret(token, passphraseInput || undefined);
      setRevealed(res.data.content);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "This link is invalid or has expired.";
      if (status === 401 && message.toLowerCase().includes("sign in")) {
        setNeedsSignIn(true);
      } else if (status === 401) {
        setRetryableError(message);
        setPassphraseInput("");
      } else {
        setDeadError(message);
      }
    } finally {
      setRevealing(false);
    }
  };

  const handleCopy = async () => {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
  };

  const handleBurnNow = async () => {
    await secretService.burnSecret(token);
    setBurned(true);
    setHidden(true);
  };

  const error = peekError || deadError;
  const remainingMs = peek ? new Date(peek.expiresAt).getTime() - now : 0;
  const viewsLabel = peek ? `${peek.viewCount} of ${peek.maxViews ?? "∞"} views used` : "";

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <div className="pt-32 pb-20 px-4 flex justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : revealed !== null ? (
              hidden ? (
                <div className="text-center py-4">
                  <Eye className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    {burned ? "Deleted." : "Hidden for your safety."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {burned
                      ? "This secret can't be viewed again."
                      : "Copy it before revealing again, if you still have views left."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
                      <ShieldCheck className="w-4 h-4" /> Secret revealed
                    </div>
                    <span className="text-[11px] text-muted-foreground">auto-hides in {secondsLeft}s</span>
                  </div>
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all bg-background border border-border rounded-lg p-3 max-h-64 overflow-y-auto">
                    {revealed}
                  </pre>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button
                      onClick={() => setHidden(true)}
                      className="px-3 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/70 transition"
                    >
                      Hide
                    </button>
                    <button
                      onClick={handleBurnNow}
                      title="Delete this secret now"
                      className="px-3 py-2 bg-destructive/5 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">{viewsLabel}</p>
                </>
              )
            ) : needsSignIn ? (
              <div className="text-center py-4">
                <LogIn className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-sm font-medium text-foreground">Sign in required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Whoever sent this wants only a signed-in Konvoy account to view it.
                </p>
                <a
                  href="/auth/login"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition"
                >
                  Sign in, then come back to this tab
                </a>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask whoever sent this link to share it again.
                </p>
              </div>
            ) : peek ? (
              <div className="text-center py-2">
                <KeyRound className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h1 className="text-base font-semibold">You've received a secret</h1>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Expires {formatCountdown(remainingMs)} · {viewsLabel}
                </p>
                {peek.requireAuth && (
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <LogIn className="w-3 h-3" /> Requires a signed-in Konvoy account
                  </p>
                )}

                {peek.hasPassphrase && (
                  <div className="text-left mt-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">
                      <Lock className="w-3 h-3" /> Passphrase required
                    </label>
                    <input
                      type="password"
                      value={passphraseInput}
                      onChange={(e) => setPassphraseInput(e.target.value)}
                      placeholder="Enter the passphrase you were given"
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                    />
                  </div>
                )}

                {retryableError && <p className="text-xs text-destructive mt-2 text-left">{retryableError}</p>}

                <button
                  onClick={handleReveal}
                  disabled={revealing || (peek.hasPassphrase && !passphraseInput.trim())}
                  className="mt-4 w-full px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                >
                  {revealing ? "Revealing..." : "Reveal secret"}
                </button>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Only click this once you're ready to view it - each view counts against the limit above.
                </p>
              </div>
            ) : null}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">Shared securely via Konvoy</p>
        </div>
      </div>
    </main>
  );
}
