"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { MyPlanResponse } from "@/types/plan.types";
import { formatBytes } from "@/lib/formatBytes";

function daysUntil(dateString: string) {
  const ms = new Date(dateString).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function PlanStatusCard({ myPlan }: { myPlan: MyPlanResponse }) {
  const { plans, currentPlanId, currentPlanExpiresAt, currentPlanLimits, usage, isOverStorageQuota } = myPlan;
  const planName = plans.find((p) => p._id === currentPlanId)?.name ?? "Free";
  const expired = !!currentPlanExpiresAt && new Date(currentPlanExpiresAt).getTime() < Date.now();
  const storagePct = currentPlanLimits.maxStorageBytes
    ? Math.min(100, Math.round((usage.storageUsedBytes / currentPlanLimits.maxStorageBytes) * 100))
    : 0;
  const hasBonus = currentPlanLimits.bonusStorageBytes > 0;

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {planName} plan
          {currentPlanExpiresAt && (
            <span className={`ml-2 text-xs font-normal ${expired ? "text-destructive" : "text-muted-foreground"}`}>
              {expired ? "· expired" : `· ${daysUntil(currentPlanExpiresAt)}d left`}
            </span>
          )}
        </h2>
        <Link href="/dashboard/plans" className="text-xs text-primary hover:underline">
          View plans
        </Link>
      </div>

      <div className="text-xs text-muted-foreground">
        {usage.projectCount} / {currentPlanLimits.maxProjectsPerUser} projects used
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Storage</span>
          <span>
            {formatBytes(usage.storageUsedBytes)} of {formatBytes(currentPlanLimits.maxStorageBytes)} used
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full ${isOverStorageQuota || storagePct >= 90 ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${Math.max(storagePct, isOverStorageQuota ? 100 : 0)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
          <span>
            {hasBonus ? (
              <>
                {formatBytes(currentPlanLimits.bonusStorageBytes)} basic (referrals) +{" "}
                {formatBytes(currentPlanLimits.planStorageBytes)} plan
              </>
            ) : (
              "No referral bonus yet"
            )}
          </span>
          <span>
            {isOverStorageQuota
              ? `${formatBytes(usage.storageUsedBytes - currentPlanLimits.maxStorageBytes)} over`
              : `${formatBytes(currentPlanLimits.maxStorageBytes - usage.storageUsedBytes)} left`}
          </span>
        </div>
      </div>

      {isOverStorageQuota && (
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            You're over your storage limit{expired ? " since your plan expired" : ""}. Existing files are safe and
            stay readable, but saves that grow a file will be blocked until you're back under the limit.{" "}
            {expired ? "Renew your plan" : "Invite a friend for free bonus storage"} to get more room.
          </span>
        </div>
      )}

      {expired && !isOverStorageQuota && (
        <p className="text-xs text-destructive">
          Your plan expired - limits have reverted to the default plan. Contact us to renew.
        </p>
      )}
    </div>
  );
}
