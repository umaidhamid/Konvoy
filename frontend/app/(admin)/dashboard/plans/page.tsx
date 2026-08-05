"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { planService } from "@/services/plan.service";
import { Plan, PlanLimits } from "@/types/plan.types";
import { PlanStatusCard } from "@/components/dashboard/PlanStatusCard";
import { formatBytes } from "@/lib/formatBytes";
import { getAllDurations, getDisplayPrice } from "@/lib/planPricing";

function limitBullets(limits: Pick<PlanLimits, "maxProjectsPerUser" | "maxMembersPerProject" | "maxFileSizeBytes" | "maxStorageBytes">) {
  return [
    `Up to ${limits.maxProjectsPerUser} projects`,
    `Up to ${limits.maxMembersPerProject} teammates per project`,
    `Up to ${formatBytes(limits.maxFileSizeBytes)} per file`,
    `Up to ${formatBytes(limits.maxStorageBytes)} total storage`,
  ];
}

export default function PlansPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["myPlan"],
    queryFn: () => planService.getMyPlan(),
  });

  const plans = data?.data?.plans ?? [];
  const durations = getAllDurations(plans);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  useEffect(() => {
    if (selectedDuration === null && durations.length > 0) {
      setSelectedDuration(durations[0]);
    }
  }, [durations, selectedDuration]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
          {(error as any)?.response?.data?.message || "Could not load plans."}
        </p>
      </div>
    );
  }

  const { currentPlanId, currentPlanLimits } = data.data;

  // No admin-defined plans yet - show a single card built from the built-in fallback limits.
  const displayPlans: Plan[] = plans.length
    ? plans
    : [
        {
          _id: "__fallback__",
          name: "Free",
          priceLabel: "$0",
          priceSuffix: "forever",
          description: "Everything you need to manage a few personal projects.",
          features: ["CLI push / pull / add", "Invite teammates to any project", "Email notifications"],
          pricingOptions: [],
          isHidden: false,
          isDefault: true,
          isActive: true,
          createdAt: "",
          updatedAt: "",
          ...currentPlanLimits,
        },
      ];

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every account has usage limits. Reach out if you need more room.
          </p>
        </div>

        <PlanStatusCard myPlan={data.data} />

        {durations.length > 0 && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDuration(d)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                    selectedDuration === d
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d} month{d > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {displayPlans.map((plan) => {
            const isCurrent = plan._id === currentPlanId || (!currentPlanId && plan._id === "__fallback__");
            const bullets = [...limitBullets(plan), ...plan.features];
            const price = getDisplayPrice(plan, selectedDuration);

            return (
              <div
                key={plan._id}
                className={`p-6 rounded-lg bg-card border flex flex-col ${
                  isCurrent ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold">{plan.name}</h2>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Current plan
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight">{price.label}</span>
                  {price.suffix && <span className="text-xs text-muted-foreground">{price.suffix}</span>}
                </div>
                {plan.description && <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>}

                <ul className="mt-5 space-y-2 flex-1">
                  {bullets.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-foreground">
                      <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground opacity-60 cursor-not-allowed"
                    >
                      Current plan
                    </button>
                  ) : (
                    <Link
                      href="/contact"
                      className="block text-center w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                    >
                      Contact us
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
