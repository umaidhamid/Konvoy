"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Cloud,
  Copy,
  KeyRound,
  Lock,
  MinusCircle,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import { projectsService } from "@/services/projects.service";
import { projectfilesService } from "@/services/projectfiles.service";
import { awsPushService } from "@/services/awsPush.service";
import { AwsPushResult } from "@/types/awsPush.types";

const inputClass =
  "w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed";
const selectClass = inputClass;
const labelClass = "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5";

const REGION_PATTERN = /^[a-z]{2}(-gov)?-[a-z]+-\d$/;
const ACCESS_KEY_PATTERN = /^[A-Z0-9]{16,128}$/;
const COMMON_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
];

const slugifyForPrefix = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function AwsPushPage() {
  const [projectSlug, setProjectSlug] = useState("");
  const [fileId, setFileId] = useState("");
  const [region, setRegion] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [prefix, setPrefix] = useState("");
  const [prefixTouched, setPrefixTouched] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [secure, setSecure] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AwsPushResult | null>(null);

  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: () => projectsService.getProjects() });
  const projects = projectsQuery.data?.data ?? [];

  const filesQuery = useQuery({
    queryKey: ["projectFiles", projectSlug],
    queryFn: () => projectfilesService.getProjectFiles(projectSlug),
    enabled: !!projectSlug,
  });
  const files = filesQuery.data?.files ?? [];
  const selectedFile = files.find((f) => f._id === fileId);
  const currentProject = projects.find((p) => p.slug === projectSlug);

  // Auto-pick the only project so single-project accounts don't hit an empty state for no reason.
  useEffect(() => {
    if (!projectSlug && projects.length === 1 && projects[0].slug) {
      setProjectSlug(projects[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  // Suggest a sensible default prefix once project + file are picked, but leave it alone
  // once the user has edited it themselves.
  useEffect(() => {
    if (prefixTouched || !currentProject || !selectedFile) return;
    const fileName = (selectedFile.path || selectedFile.name).replace(/\.[^/.]+$/, "");
    setPrefix(`/konvoy/${slugifyForPrefix(currentProject.name)}/${slugifyForPrefix(fileName) || "env"}`);
  }, [currentProject, selectedFile, prefixTouched]);

  const regionValid = !region.trim() || REGION_PATTERN.test(region.trim());
  const accessKeyValid = !accessKeyId.trim() || ACCESS_KEY_PATTERN.test(accessKeyId.trim());
  const prefixValid = !prefix.trim() || /^\/?[a-zA-Z0-9_.\-/]+$/.test(prefix.trim());

  const canSubmit =
    !!fileId &&
    !!region.trim() &&
    regionValid &&
    !!accessKeyId.trim() &&
    accessKeyValid &&
    !!secretAccessKey.trim() &&
    !!prefix.trim() &&
    prefixValid;

  const selectProject = (slug: string) => {
    setProjectSlug(slug);
    setFileId("");
    setPrefixTouched(false);
    setPrefix("");
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const res = await awsPushService.pushToParameterStore({
        fileId,
        region: region.trim(),
        accessKeyId: accessKeyId.trim(),
        secretAccessKey,
        prefix: prefix.trim(),
        overwrite,
        secure,
      });
      setResult(res.data);
      const failedCount = res.data.results.filter((r) => r.status === "failed" || r.status === "skipped").length;
      if (failedCount > 0) {
        toast.error(`${failedCount} of ${res.data.results.length} parameters didn't make it`);
      } else {
        toast.success(`Pushed ${res.data.results.length} parameter${res.data.results.length === 1 ? "" : "s"} to AWS`);
      }
      // Credentials are only ever needed for this one request - drop them from state immediately.
      setSecretAccessKey("");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Could not push to AWS Parameter Store.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyPrefix = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.prefix);
    toast.success("Prefix copied");
  };

  const created = result?.results.filter((r) => r.status === "created" || r.status === "updated").length ?? 0;
  const failed = result?.results.filter((r) => r.status === "failed").length ?? 0;
  const skipped = result?.results.filter((r) => r.status === "skipped").length ?? 0;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Push to AWS Parameter Store</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Write a project's <code>KEY=VALUE</code> file straight into AWS Systems Manager Parameter Store,
              so your infra can read it without copy-pasting.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-400">
            Your AWS credentials are sent directly to the server for this one request and are <strong>never
            stored, logged, or reused</strong> — use an IAM user/role scoped to <code>ssm:PutParameter</code> on
            the prefix below, not your root account.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Project</label>
                <select value={projectSlug} onChange={(e) => selectProject(e.target.value)} className={selectClass}>
                  <option value="">
                    {projectsQuery.isLoading ? "Loading projects…" : "Select a project…"}
                  </option>
                  {projects.filter((p) => !!p.slug).map((p) => (
                    <option key={p._id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>File</label>
                <select
                  value={fileId}
                  onChange={(e) => {
                    setFileId(e.target.value);
                    setResult(null);
                  }}
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
                    <option key={f._id} value={f._id}>
                      {f.path || f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>AWS region</label>
                <input
                  list="aws-regions"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. us-east-1"
                  className={inputClass}
                  autoComplete="off"
                />
                <datalist id="aws-regions">
                  {COMMON_REGIONS.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
                {!regionValid && (
                  <p className="text-[11px] text-destructive mt-1">Doesn't look like a valid region, e.g. "us-east-1".</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Parameter prefix</label>
                <input
                  value={prefix}
                  onChange={(e) => {
                    setPrefix(e.target.value);
                    setPrefixTouched(true);
                  }}
                  placeholder="/konvoy/my-project/env"
                  className={inputClass + " font-mono"}
                  autoComplete="off"
                />
                {!prefixValid && (
                  <p className="text-[11px] text-destructive mt-1">
                    Only letters, numbers, '.', '-', '_' and '/' are allowed.
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <KeyRound className="w-3 h-3 inline mr-1 -mt-0.5" /> Access key ID
                </label>
                <input
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  placeholder="AKIA…"
                  className={inputClass + " font-mono"}
                  autoComplete="off"
                  spellCheck={false}
                />
                {!accessKeyValid && (
                  <p className="text-[11px] text-destructive mt-1">
                    Access key IDs are uppercase letters and numbers only.
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  <Lock className="w-3 h-3 inline mr-1 -mt-0.5" /> Secret access key
                </label>
                <input
                  type="password"
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className={inputClass + " font-mono"}
                  autoComplete="new-password"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                  className="rounded border-border"
                />
                Overwrite existing parameters at this prefix
              </label>
              {!overwrite && (
                <p className="text-[11px] text-muted-foreground -mt-1.5 ml-6">
                  Keys that already exist at this prefix will fail instead of being replaced.
                </p>
              )}

              <label className="flex items-center gap-2 text-sm text-muted-foreground select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={secure}
                  onChange={(e) => setSecure(e.target.checked)}
                  className="rounded border-border"
                />
                Store as SecureString (encrypted with the account's default KMS key)
              </label>
              {!secure && (
                <p className="text-[11px] text-amber-600 -mt-1.5 ml-6">
                  Storing as plain String means these values are readable to anyone with SSM read access.
                  Only turn this off for non-secret values.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              {error ? (
                <p role="alert" className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg flex-1">
                  {error}
                </p>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Pushing…" : "Push to AWS"}
              </button>
            </div>
          </form>
        </div>

        {result && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate">{result.file.name}</h2>
                <button
                  onClick={copyPrefix}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono mt-0.5 transition"
                  title="Copy prefix"
                >
                  {result.prefix}/* <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {created > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full text-success bg-success/10">
                    {created} written
                  </span>
                )}
                {failed > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full text-destructive bg-destructive/10">
                    {failed} failed
                  </span>
                )}
                {skipped > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full text-muted-foreground bg-secondary">
                    {skipped} skipped
                  </span>
                )}
              </div>
            </div>
            <div className="divide-y divide-border">
              {result.results.map((r) => (
                <div key={r.key} className="px-6 py-2.5 flex items-center gap-2.5 text-sm">
                  {r.status === "failed" ? (
                    <X className="w-4 h-4 text-destructive shrink-0" />
                  ) : r.status === "skipped" ? (
                    <MinusCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-success shrink-0" />
                  )}
                  <span className="font-mono truncate">{r.name}</span>
                  {(r.status === "failed" || r.status === "skipped") && r.error && (
                    <span className="text-xs text-destructive ml-auto shrink-0 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {r.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
