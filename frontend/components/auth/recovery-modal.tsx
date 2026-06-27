"use client";

import { Copy, Download, AlertTriangle } from "lucide-react";
import { primaryButtonStyles, secondaryButtonStyles } from "./auth-styles";

interface RecoveryModalProps {
  recoveryCode: string;
  onCopy: () => void;
  onDownload: () => void;
  onDismiss: () => void;
}

export function RecoveryModal({ recoveryCode, onCopy, onDownload, onDismiss }: RecoveryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-950/30">
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Save your recovery code
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            This is the <span className="font-semibold text-slate-700 dark:text-slate-300">only time</span> this
            code will be shown. Store it somewhere safe — you&apos;ll need it to recover account control.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 px-4 py-4 text-center font-mono text-sm font-semibold tracking-wider text-white dark:border-slate-700">
          {recoveryCode}
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCopy} className={secondaryButtonStyles}>
            <span className="flex items-center justify-center gap-2">
              <Copy size={16} /> Copy
            </span>
          </button>
          <button type="button" onClick={onDownload} className={primaryButtonStyles}>
            <span className="flex items-center justify-center gap-2">
              <Download size={16} /> Save file
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          I&apos;ve saved this securely
        </button>
      </div>
    </div>
  );
}