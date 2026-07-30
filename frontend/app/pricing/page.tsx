"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Navbar } from "@/components/client/navbar";
import { CtaFooter } from "@/components/client/cta-footer";
import { planService } from "@/services/plan.service";
import { formatBytes } from "@/lib/formatBytes";
import { getAllDurations, getDisplayPrice } from "@/lib/planPricing";

export default function PublicPricingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["publicPlans"],
    queryFn: () => planService.getPublicPlans(),
  });

  const plans = data?.data ?? [];
  const durations = getAllDurations(plans);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  // Default to the shortest billing term once plans have loaded.
  useEffect(() => {
    if (selectedDuration === null && durations.length > 0) {
      setSelectedDuration(durations[0]);
    }
  }, [durations, selectedDuration]);

  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mx-auto text-center mb-10">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Pricing</span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
              Straightforward plans, real limits
            </h1>
            <p className="text-muted-foreground mt-4">
              Every plan lists exactly what it includes. No hidden caps, no surprises.
            </p>
          </div>

          {durations.length > 0 && (
            <div className="flex justify-center mb-12">
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

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Pricing isn't published yet - <a href="/contact" className="text-primary hover:underline">contact us</a> for details.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const bullets = [
                  `Up to ${plan.maxProjectsPerUser} projects`,
                  `Up to ${plan.maxFilesPerProject} files per project`,
                  `Up to ${plan.maxMembersPerProject} teammates per project`,
                  `Up to ${formatBytes(plan.maxFileSizeBytes)} per file`,
                  `Up to ${formatBytes(plan.maxStorageBytes)} total storage`,
                  ...plan.features,
                ];
                const price = getDisplayPrice(plan, selectedDuration);

                return (
                  <div
                    key={plan._id}
                    className={`p-6 rounded-2xl bg-card border flex flex-col ${
                      plan.isDefault ? "border-primary" : "border-border"
                    }`}
                  >
                    <h2 className="text-sm font-semibold">{plan.name}</h2>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-semibold tracking-tight">{price.label}</span>
                      {price.suffix && <span className="text-xs text-muted-foreground">{price.suffix}</span>}
                    </div>
                    {plan.description && <p className="text-xs text-muted-foreground mt-3">{plan.description}</p>}

                    <ul className="mt-5 space-y-2 flex-1">
                      {bullets.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-foreground">
                          <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <a
                      href="/auth/register"
                      className="mt-6 block text-center w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                    >
                      Get started
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CtaFooter />
    </main>
  );
}
