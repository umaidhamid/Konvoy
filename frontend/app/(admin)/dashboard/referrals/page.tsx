"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Gift, HardDrive, Mail, Users } from "lucide-react";
import { referralService } from "@/services/referral.service";

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

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

export default function ReferralsPage() {
  const origin = useOrigin();
  const infoQuery = useQuery({ queryKey: ["myReferralInfo"], queryFn: () => referralService.getMyReferralInfo() });
  const info = infoQuery.data?.data;

  const referralLink = info ? `${origin}/auth/register?ref=${info.referralCode}` : "";

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard");
  };

  const mailtoLink = referralLink
    ? `mailto:?subject=${encodeURIComponent("Join me on Konvoy")}&body=${encodeURIComponent(
        `Sign up with my referral link and we both get bonus storage: ${referralLink}`
      )}`
    : "#";

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite teammates to Konvoy. When they verify their account, you both get{" "}
            {info ? formatBytes(info.rewardBytesPerReferral) : "bonus"} of extra storage added on top of your plan.
          </p>
        </div>

        {infoQuery.isLoading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
        ) : info ? (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">
                Your referral link
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono"
                />
                <button
                  onClick={copyLink}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <a
                  href={mailtoLink}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg hover:bg-secondary/70 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <Users className="w-4 h-4 text-primary mb-2" />
                <p className="text-2xl font-bold">{info.totalReferred}</p>
                <p className="text-xs text-muted-foreground mt-0.5">People referred</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <Gift className="w-4 h-4 text-primary mb-2" />
                <p className="text-2xl font-bold">{info.totalVerifiedReferrals}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Verified (rewarded)</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <HardDrive className="w-4 h-4 text-primary mb-2" />
                <p className="text-2xl font-bold">{formatBytes(info.bonusStorageBytes)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Bonus storage earned</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-sm font-semibold">People you've referred</h2>
              </div>
              {info.referredUsers.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No referrals yet - share your link to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {info.referredUsers.map((u, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{u.fullname || u.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Joined {timeAgo(u.joinedAt)}</p>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${u.rewardEarned ? "text-success" : "text-muted-foreground"}`}>
                        {u.rewardEarned ? "Rewarded" : "Pending verification"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
