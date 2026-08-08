"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { AdminPlan, PlanFormValues } from "@/types/plan.types";

interface PlanFormModalProps {
  plan: AdminPlan | null;
  submitting: boolean;
  onSubmit: (values: PlanFormValues) => void;
  onClose: () => void;
}

const inputClass =
  "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";

const labelClass = "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5";

const bytesToMb = (bytes: number) => (bytes ? bytes / (1024 * 1024) : 0);

const STANDARD_DURATIONS = [1, 3, 6, 12] as const;

export function PlanFormModal({ plan, submitting, onSubmit, onClose }: PlanFormModalProps) {
  const [name, setName] = useState(plan?.name ?? "");
  const [priceLabel, setPriceLabel] = useState(plan?.priceLabel ?? "");
  const [priceSuffix, setPriceSuffix] = useState(plan?.priceSuffix ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [features, setFeatures] = useState((plan?.features ?? []).join("\n"));
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(String(plan ? bytesToMb(plan.maxFileSizeBytes) : 2));
  const [maxProjectsPerUser, setMaxProjectsPerUser] = useState(String(plan?.maxProjectsPerUser ?? 20));
  const [maxStorageMb, setMaxStorageMb] = useState(String(plan ? bytesToMb(plan.maxStorageBytes) : 500));
  const [maxMembersPerProject, setMaxMembersPerProject] = useState(String(plan?.maxMembersPerProject ?? 5));
  const [durationPrices, setDurationPrices] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (const d of STANDARD_DURATIONS) {
      map[d] = plan?.pricingOptions.find((o) => o.durationMonths === d)?.priceLabel ?? "";
    }
    return map;
  });
  const [isHidden, setIsHidden] = useState(plan?.isHidden ?? false);
  const [isDefault, setIsDefault] = useState(plan?.isDefault ?? false);
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const mb = parseFloat(maxFileSizeMb);
    const projectsPerUser = parseInt(maxProjectsPerUser, 10);
    const storageMb = parseFloat(maxStorageMb);
    const membersPerProject = parseInt(maxMembersPerProject, 10);

    if (!name.trim()) return setError("Plan name is required.");
    if (!mb || mb <= 0) return setError("Max file size must be greater than 0.");
    if (!projectsPerUser || projectsPerUser <= 0) return setError("Max projects per user must be greater than 0.");
    if (!storageMb || storageMb <= 0) return setError("Max storage must be greater than 0.");
    if (!membersPerProject || membersPerProject <= 0) return setError("Max members per project must be greater than 0.");

    const pricingOptions = STANDARD_DURATIONS.filter((d) => durationPrices[d]?.trim()).map((d) => ({
      durationMonths: d,
      priceLabel: durationPrices[d].trim(),
    }));

    onSubmit({
      name: name.trim(),
      priceLabel: priceLabel.trim(),
      priceSuffix: priceSuffix.trim(),
      description: description.trim(),
      features: features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      maxFileSizeBytes: Math.round(mb * 1024 * 1024),
      maxProjectsPerUser: projectsPerUser,
      maxStorageBytes: Math.round(storageMb * 1024 * 1024),
      maxMembersPerProject: membersPerProject,
      pricingOptions,
      isHidden,
      isDefault,
      isActive,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">{plan ? `Edit "${plan.name}"` : "New plan"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Pro" />
            </div>
            <div>
              <label className={labelClass}>Price label</label>
              <input
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                className={inputClass}
                placeholder="$29"
              />
            </div>
            <div>
              <label className={labelClass}>Price suffix</label>
              <input
                value={priceSuffix}
                onChange={(e) => setPriceSuffix(e.target.value)}
                className={inputClass}
                placeholder="/month"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="For teams that need more room to grow."
            />
          </div>

          <div>
            <label className={labelClass}>Features (one per line)</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder={"Priority support\nTeam activity history"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Max file size (MB)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={maxFileSizeMb}
                onChange={(e) => setMaxFileSizeMb(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max storage (MB)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={maxStorageMb}
                onChange={(e) => setMaxStorageMb(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Projects / user</label>
              <input
                type="number"
                min="1"
                step="1"
                value={maxProjectsPerUser}
                onChange={(e) => setMaxProjectsPerUser(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Members / project</label>
              <input
                type="number"
                min="1"
                step="1"
                value={maxMembersPerProject}
                onChange={(e) => setMaxMembersPerProject(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Billing price by duration (leave blank to not offer)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STANDARD_DURATIONS.map((d) => (
                <div key={d}>
                  <span className="block text-[10px] text-muted-foreground mb-1">{d} month{d > 1 ? "s" : ""}</span>
                  <input
                    value={durationPrices[d]}
                    onChange={(e) => setDurationPrices((prev) => ({ ...prev, [d]: e.target.value }))}
                    className={inputClass}
                    placeholder="$—"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Default plan for new users
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                disabled={isDefault}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active (assignable)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} />
              Hidden (not shown to users - assign manually)
            </label>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground font-medium text-sm rounded-lg hover:bg-secondary/70 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Saving..." : plan ? "Save changes" : "Create plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
