"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    current: true,
    description: "Everything you need to manage a few personal projects.",
    features: [
      "Unlimited projects",
      "CLI push / pull / add",
      "Invite teammates to any project",
      "Email notifications",
    ],
  },
  {
    name: "Pro",
    price: "Coming soon",
    period: "",
    current: false,
    description: "For teams that need more storage and faster collaboration.",
    features: [
      "Everything in Free",
      "Larger file size limits",
      "Priority support",
      "Team activity history",
    ],
  },
  {
    name: "Enterprise",
    price: "Talk to us",
    period: "",
    current: false,
    description: "Custom limits, SSO, and dedicated support for larger orgs.",
    features: [
      "Everything in Pro",
      "Single sign-on (SSO)",
      "Audit logs",
      "Dedicated support",
    ],
  },
];

export default function PlansPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You're currently on the Free plan. Paid plans aren't available yet — reach out if you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-lg bg-card border flex flex-col ${
                plan.current ? "border-primary" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold">{plan.name}</h2>
                {plan.current && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Current plan
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-xs text-muted-foreground">/ {plan.period}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>

              <ul className="mt-5 space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-foreground">
                    <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {plan.current ? (
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
          ))}
        </div>
      </div>
    </div>
  );
}
