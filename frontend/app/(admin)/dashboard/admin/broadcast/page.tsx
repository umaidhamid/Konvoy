"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { BroadcastAudience } from "@/types/broadcast.types";
import { timeAgo, memberLabel } from "@/lib/adminFormat";

const AUDIENCE_OPTIONS: { value: BroadcastAudience; label: string; description: string }[] = [
  { value: "all", label: "All users", description: "Every active account on Konvoy." },
  { value: "verified", label: "Verified users", description: "Only accounts that have verified their email." },
  { value: "plan", label: "Users on a specific plan", description: "Only accounts currently assigned to one plan." },
];

export default function AdminBroadcastPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [planId, setPlanId] = useState("");
  const [formError, setFormError] = useState("");

  const canLoad = !!user && user.role === "admin";

  const plansQuery = useQuery({
    queryKey: ["adminPlans"],
    queryFn: () => adminService.getAllPlans(),
    enabled: canLoad,
  });
  const plans = plansQuery.data?.data ?? [];

  const audienceCountQuery = useQuery({
    queryKey: ["broadcastAudienceCount", audience, planId],
    queryFn: () => adminService.getBroadcastAudienceCount(audience, planId),
    enabled: canLoad && (audience !== "plan" || !!planId),
  });
  const audienceCount = audienceCountQuery.data?.data?.count ?? null;

  const logsQuery = useQuery({
    queryKey: ["adminLogs"],
    queryFn: () => adminService.getLogs(),
    enabled: canLoad,
  });
  const recentBroadcasts = (logsQuery.data?.data ?? []).filter((l) => l.targetType === "broadcast").slice(0, 10);

  const sendMutation = useMutation({
    mutationFn: () => adminService.sendBroadcast({ title: title.trim(), message: message.trim(), audience, planId: audience === "plan" ? planId : undefined }),
    onSuccess: (res) => {
      toast.success(res.message || "Announcement sent");
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["adminLogs"] });
    },
    onError: (err: any) => setFormError(err?.response?.data?.message || "Could not send this announcement."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (title.trim().length < 3) return setFormError("Title must be at least 3 characters.");
    if (message.trim().length < 3) return setFormError("Message must be at least 3 characters.");
    if (audience === "plan" && !planId) return setFormError("Choose a plan to target.");
    if (!confirm(`Send this announcement to ${audienceCount ?? "the selected"} user(s)?`)) return;
    sendMutation.mutate();
  };

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
      <form onSubmit={handleSubmit} className="border border-border rounded-lg bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Send an announcement</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Delivers as an in-app notification to every matching user immediately.
        </p>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled maintenance tonight"
            maxLength={120}
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="What should users know?"
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">Audience</label>
          <div className="space-y-2">
            {AUDIENCE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                  audience === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-card-hover"
                }`}
              >
                <input
                  type="radio"
                  name="audience"
                  checked={audience === opt.value}
                  onChange={() => setAudience(opt.value)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
          {audience === "plan" && (
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition"
            >
              <option value="">Choose a plan...</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.userCount} user{p.userCount === 1 ? "" : "s"})
                </option>
              ))}
            </select>
          )}
        </div>

        {formError && (
          <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">{formError}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {audience === "plan" && !planId
              ? "Choose a plan to see recipient count."
              : audienceCount !== null
              ? `Will notify ${audienceCount} user${audienceCount === 1 ? "" : "s"}.`
              : "..."}
          </span>
          <button
            type="submit"
            disabled={sendMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {sendMutation.isPending ? "Sending..." : "Send announcement"}
          </button>
        </div>
      </form>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Recent broadcasts</h2>
        </div>
        <div className="divide-y divide-border">
          {recentBroadcasts.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground text-xs">No announcements sent yet.</p>
          ) : (
            recentBroadcasts.map((l) => (
              <div key={l._id} className="px-4 py-3">
                <p className="text-xs text-foreground">{l.details}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {memberLabel(l.actorId)} · {timeAgo(l.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
