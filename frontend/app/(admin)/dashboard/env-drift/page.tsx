"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FolderOpen,
  GitCompare,
  Minus,
  Plus,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { projectsService } from "@/services/projects.service";
import { projectfilesService } from "@/services/projectfiles.service";
import { envDriftService } from "@/services/envDrift.service";
import { EnvDriftResult } from "@/types/envDrift.types";

const selectClass =
  "w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed";
const labelClass = "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5";

export default function EnvDriftPage() {
  const [projectSlug, setProjectSlug] = useState("");
  const [fileIdA, setFileIdA] = useState("");
  const [fileIdB, setFileIdB] = useState("");
  const [reveal, setReveal] = useState(false);
  const [result, setResult] = useState<EnvDriftResult | null>(null);
  const [error, setError] = useState("");
  const [comparing, setComparing] = useState(false);

  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: () => projectsService.getProjects() });
  const projects = projectsQuery.data?.data ?? [];

  const filesQuery = useQuery({
    queryKey: ["projectFiles", projectSlug],
    queryFn: () => projectfilesService.getProjectFiles(projectSlug),
    enabled: !!projectSlug,
  });
  const files = filesQuery.data?.files ?? [];

  // Auto-pick the only project so single-project accounts don't hit an empty state for no reason.
  useEffect(() => {
    if (!projectSlug && projects.length === 1 && projects[0].slug) {
      setProjectSlug(projects[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const sameFile = !!fileIdA && !!fileIdB && fileIdA === fileIdB;
  const canCompare = !!fileIdA && !!fileIdB && !sameFile;

  const clearResult = () => {
    setResult(null);
    setError("");
  };

  const selectProject = (slug: string) => {
    setProjectSlug(slug);
    setFileIdA("");
    setFileIdB("");
    setReveal(false);
    clearResult();
  };

  const selectFileA = (id: string) => {
    setFileIdA(id);
    clearResult();
  };

  const selectFileB = (id: string) => {
    setFileIdB(id);
    clearResult();
  };

  const swapFiles = () => {
    setFileIdA(fileIdB);
    setFileIdB(fileIdA);
    clearResult();
  };

  const runCompare = async (nextReveal: boolean) => {
    if (!canCompare) return;
    setComparing(true);
    setError("");
    try {
      const res = await envDriftService.compare(fileIdA, fileIdB, nextReveal);
      setResult(res.data);
      setReveal(nextReveal);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Could not compare these files.";
      setError(message);
      setResult(null);
      toast.error(message);
    } finally {
      setComparing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCompare(false);
  };

  const toggleReveal = () => {
    if (!result) return;
    runCompare(!reveal);
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    toast.success(`Copied "${key}"`);
  };

  const currentProject = projects.find((p) => p.slug === projectSlug);
  const hasDrift = result ? result.onlyInA.length + result.onlyInB.length + result.changed.length > 0 : false;
  const unparsableFiles = result
    ? [
        result.fileA.parsedKeyCount === 0 ? result.fileA.name : null,
        result.fileB.parsedKeyCount === 0 ? result.fileB.name : null,
      ].filter((name): name is string => !!name)
    : [];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Env Drift Check</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compare two env/config files in a project — e.g. <code>.env.staging</code> vs{" "}
              <code>.env.production</code> — and see which keys are missing or changed, without exposing
              values unless you ask for them.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="env-drift-project">Project</label>
              <select
                id="env-drift-project"
                value={projectSlug}
                onChange={(e) => selectProject(e.target.value)}
                disabled={projectsQuery.isLoading}
                className={selectClass}
              >
                <option value="">
                  {projectsQuery.isLoading ? "Loading projects…" : "Select a project…"}
                </option>
                {projects.filter((p) => !!p.slug).map((p) => (
                  <option key={p._id} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              {!projectsQuery.isLoading && projects.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  You don't have any projects yet. Create one first, then come back here.
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <label className={labelClass} htmlFor="env-drift-file-a">File A</label>
                <select
                  id="env-drift-file-a"
                  value={fileIdA}
                  onChange={(e) => selectFileA(e.target.value)}
                  disabled={!projectSlug || filesQuery.isLoading}
                  className={selectClass}
                >
                  <option value="">
                    {!projectSlug
                      ? "Pick a project first…"
                      : filesQuery.isLoading
                      ? "Loading files…"
                      : files.length === 0
                      ? "No files in this project"
                      : "Select a file…"}
                  </option>
                  {files.map((f) => (
                    <option key={f._id} value={f._id} disabled={f._id === fileIdB}>
                      {f.path || f.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={swapFiles}
                disabled={!fileIdA && !fileIdB}
                title="Swap files"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              <div>
                <label className={labelClass} htmlFor="env-drift-file-b">File B</label>
                <select
                  id="env-drift-file-b"
                  value={fileIdB}
                  onChange={(e) => selectFileB(e.target.value)}
                  disabled={!projectSlug || filesQuery.isLoading}
                  className={selectClass}
                >
                  <option value="">
                    {!projectSlug
                      ? "Pick a project first…"
                      : filesQuery.isLoading
                      ? "Loading files…"
                      : files.length === 0
                      ? "No files in this project"
                      : "Select a file…"}
                  </option>
                  {files.map((f) => (
                    <option key={f._id} value={f._id} disabled={f._id === fileIdA}>
                      {f.path || f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {projectSlug && !filesQuery.isLoading && files.length === 1 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" /> This project only has one file — add a second (e.g. a
                staging/production variant) to compare something.
              </p>
            )}
            {sameFile && (
              <p className="text-xs text-destructive">Pick two different files to compare.</p>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              {error ? (
                <p
                  role="alert"
                  className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg flex-1"
                >
                  {error}
                </p>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={!canCompare || comparing}
                className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <GitCompare className="w-4 h-4" />
                {comparing ? "Comparing…" : "Compare"}
              </button>
            </div>
          </form>
        </div>

        {!result && !comparing && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Scale className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Pick two files above and hit Compare to see what's drifted between them.
            </p>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate">
                  {result.fileA.name} <span className="text-muted-foreground font-normal">vs</span> {result.fileB.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{currentProject?.name ?? projectSlug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SummaryBadge label="missing" count={result.onlyInA.length + result.onlyInB.length} tone="destructive" />
                <SummaryBadge label="changed" count={result.changed.length} tone="warning" />
                <SummaryBadge label="identical" count={result.identicalCount} tone="success" />
                <button
                  onClick={toggleReveal}
                  disabled={comparing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition disabled:opacity-50"
                >
                  {comparing ? (
                    "Loading…"
                  ) : reveal ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide values
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Reveal values
                    </>
                  )}
                </button>
              </div>
            </div>

            {unparsableFiles.length > 0 ? (
              <div className="px-6 py-8 text-center">
                <AlertTriangle className="w-7 h-7 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-medium">Couldn't find any KEY=VALUE lines</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {unparsableFiles.join(" and ")} {unparsableFiles.length === 1 ? "doesn't" : "don't"} look like{" "}
                  <code>.env</code> format, so there's nothing to compare. This tool only understands plain{" "}
                  <code>KEY=value</code> lines — it can't diff JSON, YAML, or other formats yet.
                </p>
              </div>
            ) : !hasDrift ? (
              <div className="px-6 py-8 text-center">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-success" />
                <p className="text-sm font-medium">No drift detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Every key present in either file matches. {result.identicalCount} key
                  {result.identicalCount === 1 ? "" : "s"} identical.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                <DriftSection
                  icon={<Minus className="w-3.5 h-3.5" />}
                  tone="destructive"
                  title={`Missing in ${result.fileB.name}`}
                  subtitle={`Present in ${result.fileA.name} only`}
                >
                  {result.onlyInA.map((entry) => (
                    <EntryRow key={entry.key} entryKey={entry.key} value={entry.value} reveal={reveal} onCopy={copyKey} />
                  ))}
                </DriftSection>

                <DriftSection
                  icon={<Plus className="w-3.5 h-3.5" />}
                  tone="destructive"
                  title={`Missing in ${result.fileA.name}`}
                  subtitle={`Present in ${result.fileB.name} only`}
                >
                  {result.onlyInB.map((entry) => (
                    <EntryRow key={entry.key} entryKey={entry.key} value={entry.value} reveal={reveal} onCopy={copyKey} />
                  ))}
                </DriftSection>

                <DriftSection
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  tone="warning"
                  title="Different values"
                  subtitle="Present in both files, but the value differs"
                >
                  {result.changed.map((entry) => (
                    <div key={entry.key} className="px-6 py-2.5 text-sm font-mono group">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{entry.key}</span>
                        <button
                          onClick={() => copyKey(entry.key)}
                          title="Copy key"
                          className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {reveal && (
                        <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                          <div className="truncate">{result.fileA.name}: {entry.valueA || <em>empty</em>}</div>
                          <div className="truncate">{result.fileB.name}: {entry.valueB || <em>empty</em>}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </DriftSection>

                <div className="px-6 py-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {result.identicalCount} key{result.identicalCount === 1 ? "" : "s"} identical in both files.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryBadge({ label, count, tone }: { label: string; count: number; tone: "destructive" | "warning" | "success" }) {
  if (count === 0) return null;
  const toneClass =
    tone === "destructive"
      ? "text-destructive bg-destructive/10"
      : tone === "warning"
      ? "text-amber-600 bg-amber-500/10"
      : "text-success bg-success/10";
  return (
    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${toneClass}`}>
      {count} {label}
    </span>
  );
}

function DriftSection({
  icon,
  tone,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  tone: "destructive" | "warning";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const hasChildren = React.Children.count(children) > 0;
  const toneClass = tone === "destructive" ? "text-destructive bg-destructive/10" : "text-amber-600 bg-amber-500/10";

  if (!hasChildren) return null;

  return (
    <div>
      <div className="px-6 py-3 flex items-center gap-2">
        <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${toneClass}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="pb-2">{children}</div>
    </div>
  );
}

function EntryRow({
  entryKey,
  value,
  reveal,
  onCopy,
}: {
  entryKey: string;
  value?: string;
  reveal: boolean;
  onCopy: (key: string) => void;
}) {
  return (
    <div className="px-6 py-1.5 text-sm font-mono flex items-baseline gap-1.5 group">
      <span className="text-foreground">{entryKey}</span>
      <button
        onClick={() => onCopy(entryKey)}
        title="Copy key"
        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
      >
        <Copy className="w-3 h-3" />
      </button>
      {reveal && <span className="text-xs text-muted-foreground truncate">= {value || <em>empty</em>}</span>}
    </div>
  );
}
