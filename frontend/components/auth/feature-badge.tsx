"use client";

interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
}

export function FeatureBadge({ icon, label }: FeatureBadgeProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 p-3">
      <span className="shrink-0 text-slate-300">{icon}</span>
      <span className="text-xs font-medium tracking-wide text-slate-200">{label}</span>
    </div>
  );
}