"use client";

import React from "react";
import { MyPlanResponse } from "@/types/plan.types";
import { formatBytes } from "@/lib/formatBytes";

function daysUntil(dateString: string) {
  const ms = new Date(dateString).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function PlanStatusCard({ myPlan }: { myPlan: MyPlanResponse }) {
  const { plans, currentPlanId, currentPlanExpiresAt, currentPlanLimits, usage } = myPlan;
  const planName = plans.find((p) => p._id === currentPlanId)?.name ?? "Free";
  const expired = !!currentPlanExpiresAt && new Date(currentPlanExpiresAt).getTime() < Date.now();
  const storagePct = Math.min(
    100,
    Math.round((usage.storageUsedBytes / currentPlanLimits.maxStorageBytes) * 100)
  );

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
        <a href="/dashboard/plans" className="text-xs text-primary hover:underline">
          View plans
        </a>
      </div>

      <div className="text-xs text-muted-foreground">
        {usage.projectCount} / {currentPlanLimits.maxProjectsPerUser} projects used
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Storage</span>
          <span>
            {formatBytes(usage.storageUsedBytes)} of {formatBytes(currentPlanLimits.maxStorageBytes)} used (
            {formatBytes(Math.max(0, currentPlanLimits.maxStorageBytes - usage.storageUsedBytes))} left)
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full ${storagePct >= 90 ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${storagePct}%` }}
          />
        </div>
      </div>

      {expired && (
        <p className="text-xs text-destructive">
          Your plan expired - limits have reverted to the default plan. Contact us to renew.
        </p>
      )}
    </div>
  );
}
