"use client";

interface BrandMarkProps {
  light?: boolean;
}

export function BrandMark({ light = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={
          light
            ? "flex h-9 w-9 items-center justify-center rounded-xl bg-white"
            : "flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white"
        }
      >
        <span
          className={
            light
              ? "text-sm font-black tracking-tight text-slate-900"
              : "text-sm font-black tracking-tight text-white dark:text-slate-900"
          }
        >
          K
        </span>
      </div>
      <span
        className={
          light
            ? "text-lg font-semibold tracking-tight text-white"
            : "text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        }
      >
        Konoy
      </span>
    </div>
  );
}