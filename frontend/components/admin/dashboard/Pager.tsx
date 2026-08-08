"use client";

import { Pagination } from "@/types/admin.types";

export function Pager({ pagination, onPage }: { pagination: Pagination | null; onPage: (page: number) => void }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
      <span>
        Page {pagination.page} of {pagination.pages} · {pagination.total} total
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(pagination.page - 1)}
          disabled={pagination.page <= 1}
          aria-label="Previous page"
          className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/70 transition"
        >
          Prev
        </button>
        <button
          onClick={() => onPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
          aria-label="Next page"
          className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/70 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
