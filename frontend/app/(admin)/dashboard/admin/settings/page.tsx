"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";

const inputClass =
  "w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";
const labelClass = "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canLoad = !!user && user.role === "admin";

  const [referralRewardMb, setReferralRewardMb] = useState("500");
  const [error, setError] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["appSettings"],
    queryFn: () => adminService.getSettings(),
    enabled: canLoad,
  });

  useEffect(() => {
    const bytes = settingsQuery.data?.data?.referralRewardBytes;
    if (bytes !== undefined) setReferralRewardMb(String(Math.round(bytes / (1024 * 1024))));
  }, [settingsQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (referralRewardBytes: number) => adminService.updateSettings({ referralRewardBytes }),
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["appSettings"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not save settings."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const mb = parseFloat(referralRewardMb);
    if (!mb || mb <= 0) return setError("Reward must be greater than 0 MB.");
    updateMutation.mutate(Math.round(mb * 1024 * 1024));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Referral reward</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bonus storage granted to both the referrer and the new user when a referred signup verifies their
              email. This stacks permanently on top of a user's plan and survives plan changes.
            </p>
          </div>
        </div>

        {settingsQuery.isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="w-48">
              <label className={labelClass}>Reward per referral (MB)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={referralRewardMb}
                onChange={(e) => setReferralRewardMb(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </form>
        )}

        {error && (
          <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg mt-3">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
