"use client";

import { useEffect, useRef, useState } from "react";
import { AdminUser } from "@/types/admin.types";
import { formatBytes } from "@/lib/formatBytes";

const MB = 1024 * 1024;

// Lets an admin set (not add to) a user's bonusStorageBytes - the same field the
// referral program grants, stacked on top of whatever their plan already allows.
export function StorageOverrideCell({
  user,
  busy,
  onSave,
}: {
  user: AdminUser;
  busy: boolean;
  onSave: (bonusStorageBytes: number) => void;
}) {
  const currentMb = Math.round((user.bonusStorageBytes || 0) / MB);
  const [editing, setEditing] = useState(false);
  const [valueMb, setValueMb] = useState(String(currentMb));
  const submittedMbRef = useRef<number | null>(null);
  const wasBusyRef = useRef(false);

  // Only collapse back to the read-only view once the save actually lands - if the request
  // failed, `currentMb` won't match what we submitted, so stay open with the value intact
  // instead of silently reverting and losing what the admin typed.
  useEffect(() => {
    if (wasBusyRef.current && !busy && submittedMbRef.current !== null) {
      if (currentMb === submittedMbRef.current) {
        setEditing(false);
      }
      submittedMbRef.current = null;
    }
    wasBusyRef.current = busy;
  }, [busy, currentMb]);

  const parsed = Number(valueMb);
  const isValid = valueMb.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;

  const startEditing = () => {
    setValueMb(String(currentMb));
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setValueMb(String(currentMb));
  };

  const save = () => {
    if (!isValid) return;
    submittedMbRef.current = Math.round(parsed);
    onSave(Math.round(parsed * MB));
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        disabled={busy}
        className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title="Click to edit bonus storage"
      >
        {user.bonusStorageBytes > 0 ? `+${formatBytes(user.bonusStorageBytes)}` : "—"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        step={1}
        value={valueMb}
        disabled={busy}
        onChange={(e) => setValueMb(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        autoFocus
        className="w-20 text-xs px-2 py-1 rounded-lg bg-background border border-border focus:outline-none focus:border-primary disabled:opacity-50"
      />
      <span className="text-[10px] text-muted-foreground">MB</span>
      <button
        type="button"
        disabled={busy || !isValid}
        onClick={save}
        className="text-xs font-medium px-2 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={cancel}
        className="text-xs px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
