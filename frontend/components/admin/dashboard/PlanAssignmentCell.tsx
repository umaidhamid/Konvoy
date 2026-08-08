"use client";

import { useState } from "react";
import { AdminUser } from "@/types/admin.types";
import { AdminPlan } from "@/types/plan.types";

// Handles plan assignment for one user row. Plans with pricingOptions require
// picking a duration before the change can be committed; plans without one
// (e.g. the default/free plan) commit immediately, same as the old Role select.
export function PlanAssignmentCell({
  user,
  plans,
  busy,
  onAssign,
}: {
  user: AdminUser;
  plans: AdminPlan[];
  busy: boolean;
  onAssign: (planId: string | null, durationMonths?: number) => void;
}) {
  const [pendingPlanId, setPendingPlanId] = useState(user.planId?._id ?? "");
  const [pendingDuration, setPendingDuration] = useState<number | null>(null);

  const pendingPlan = plans.find((p) => p._id === pendingPlanId) || null;
  const needsDuration = !!pendingPlan && pendingPlan.pricingOptions.length > 0;
  const showDurationPicker = needsDuration && pendingPlanId !== (user.planId?._id ?? "");

  const handlePlanSelect = (value: string) => {
    setPendingPlanId(value);
    const plan = plans.find((p) => p._id === value) || null;
    if (!value || !plan || plan.pricingOptions.length === 0) {
      setPendingDuration(null);
      onAssign(value || null);
      return;
    }
    setPendingDuration(plan.pricingOptions[0].durationMonths);
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={pendingPlanId}
        disabled={busy}
        aria-label={`Plan for ${user.fullname || user.email}`}
        onChange={(e) => handlePlanSelect(e.target.value)}
        className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">No plan (default)</option>
        {plans.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
            {!p.isActive ? " (inactive)" : ""}
          </option>
        ))}
      </select>

      {showDurationPicker && pendingPlan && (
        <>
          <select
            value={pendingDuration ?? pendingPlan.pricingOptions[0].durationMonths}
            disabled={busy}
            aria-label="Billing duration"
            onChange={(e) => setPendingDuration(parseInt(e.target.value, 10))}
            className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pendingPlan.pricingOptions.map((o) => (
              <option key={o.durationMonths} value={o.durationMonths}>
                {o.durationMonths}mo - {o.priceLabel}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => onAssign(pendingPlanId, pendingDuration ?? pendingPlan.pricingOptions[0].durationMonths)}
            className="text-xs font-medium px-2 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}
