import { Plan } from "@/types/plan.types";

// Every distinct duration (in months) offered by any of the given plans, sorted ascending.
export function getAllDurations(plans: Plan[]): number[] {
  const set = new Set<number>();
  for (const plan of plans) {
    for (const option of plan.pricingOptions) set.add(option.durationMonths);
  }
  return Array.from(set).sort((a, b) => a - b);
}

// The headline price to show for a plan at a given selected duration. Falls back
// to the plan's flat priceLabel/priceSuffix if it doesn't offer that duration.
export function getDisplayPrice(plan: Plan, selectedDuration: number | null) {
  if (selectedDuration != null) {
    const option = plan.pricingOptions.find((o) => o.durationMonths === selectedDuration);
    if (option) {
      return {
        label: option.priceLabel,
        suffix: `for ${selectedDuration} month${selectedDuration > 1 ? "s" : ""}`,
      };
    }
  }
  return { label: plan.priceLabel || "—", suffix: plan.priceSuffix ? `/ ${plan.priceSuffix}` : "" };
}
