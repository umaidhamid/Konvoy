"use client";

import React, { useState } from "react";
import { Download, DatabaseBackup, ShieldCheck } from "lucide-react";
import { dataExportService } from "@/services/dataExport.service";

export default function DataExportPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.open(dataExportService.exportUrl(), "_blank");
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Download your data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get a copy of everything tied to your Konvoy account - your profile, projects, files, and activity - as
            a single JSON file.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <DatabaseBackup className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold">What's included</h2>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Account profile (name, email, plan, join date)</li>
                <li>All your projects and their files (decrypted content)</li>
                <li>Secret share links you've created (metadata only - not decrypted content)</li>
                <li>Diff shares you've created</li>
                <li>Your activity history and notifications</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Secret content is deliberately left out - decrypted secrets in a downloaded file would defeat the
                point of sharing them securely.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Preparing download..." : "Download my data (.json)"}
          </button>
        </div>
      </div>
    </div>
  );
}
