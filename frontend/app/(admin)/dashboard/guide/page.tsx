"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  FolderKanban,
  Terminal,
  CreditCard,
  ShieldCheck,
  Users,
  History,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { planService } from "@/services/plan.service";
import { formatBytes } from "@/lib/formatBytes";

const CLI_COMMANDS = [
  { cmd: "konvoy login", desc: "Authenticate and store your session locally" },
  { cmd: "konvoy status", desc: "Check you're online, logged in, and your token still works" },
  { cmd: "konvoy init", desc: "Create a new project" },
  { cmd: "konvoy add", desc: "Pick specific file(s) to upload to a project you choose" },
  { cmd: "konvoy push", desc: "Push all local files in the current folder to a project you choose" },
  { cmd: "konvoy pull", desc: "List your projects" },
  { cmd: "konvoy share", desc: "Invite a teammate (by email) to a project you own" },
  { cmd: "konvoy leave", desc: "Leave a project you're a member of" },
  { cmd: "konvoy delete-file", desc: "Permanently delete file(s) from a project" },
  { cmd: "konvoy delete-project", desc: "Permanently delete a project you own" },
];

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function GuidePage() {
  const { user } = useAuth();
  const myPlanQuery = useQuery({
    queryKey: ["myPlan"],
    queryFn: () => planService.getMyPlan(),
    enabled: !!user,
  });
  const limits = myPlanQuery.data?.data.currentPlanLimits;
  const planName = myPlanQuery.data?.data.plans.find((p) => p._id === myPlanQuery.data?.data.currentPlanId)?.name ?? "Free";

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">
            What you can do with Konvoy, and where to do it.
          </p>
        </div>

        <SectionCard
          icon={FolderKanban}
          title="Projects & files"
          description="Everything lives inside a project."
        >
          <ul className="space-y-3 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>
                <Link href="/dashboard/projects" className="text-primary hover:underline">Create a project</Link>{" "}
                to hold a set of files - each one is its own workspace, isolated from your others.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Open a project's built-in editor to create, edit, rename, and delete files without touching a terminal.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>
                <History className="w-3.5 h-3.5 inline -mt-0.5" /> Every save keeps the last 2 versions - open
                "History" in the editor to review or restore an earlier one.
              </span>
            </li>
            <li className="flex gap-2">
              <Users className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                As the owner of a project, invite teammates by email (with optional access limited to specific
                files). Your plan caps how many teammates fit in one project.
              </span>
            </li>
          </ul>
        </SectionCard>

        <SectionCard icon={Terminal} title="The CLI" description="Everything from the terminal, scriptable.">
          <p className="text-xs text-muted-foreground mb-4">
            <code className="text-primary">npm install -g konvoy-cli</code>, then <code className="text-primary">konvoy login</code> once per machine.
          </p>
          <div className="space-y-1.5">
            {CLI_COMMANDS.map((c) => (
              <div key={c.cmd} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 px-3 py-2 rounded-lg bg-background border border-border text-xs">
                <code className="text-primary shrink-0 sm:w-40">{c.cmd}</code>
                <span className="text-muted-foreground">{c.desc}</span>
              </div>
            ))}
          </div>
          <Link href="/documentation" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-4">
            Full documentation <ArrowUpRight className="w-3 h-3" />
          </Link>
        </SectionCard>

        <SectionCard icon={CreditCard} title="Your plan & limits" description="What your account is currently allowed.">
          {limits ? (
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-foreground">
              <li>Plan: <span className="font-medium">{planName}</span></li>
              <li>Up to {limits.maxProjectsPerUser} projects</li>
              <li>Up to {limits.maxMembersPerProject} teammates per project</li>
              <li>Up to {formatBytes(limits.maxFileSizeBytes)} per file</li>
              <li>Up to {formatBytes(limits.maxStorageBytes)} total storage</li>
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Loading your plan…</p>
          )}
          <Link href="/dashboard/plans" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-4">
            View plans & usage <ArrowUpRight className="w-3 h-3" />
          </Link>
        </SectionCard>

        {user?.role === "admin" && (
          <SectionCard icon={ShieldCheck} title="Admin panel" description="Platform-wide controls, only visible to you.">
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex gap-2"><span className="text-primary shrink-0">•</span>Manage every user - change roles, deactivate accounts, assign plans.</li>
              <li className="flex gap-2"><span className="text-primary shrink-0">•</span>Create and edit pricing plans, including hidden plans only you can assign.</li>
              <li className="flex gap-2"><span className="text-primary shrink-0">•</span>View or delete any project on the platform, not just your own.</li>
              <li className="flex gap-2"><span className="text-primary shrink-0">•</span>Review the activity log of every admin action, and export users/projects to CSV.</li>
            </ul>
            <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-4">
              Open admin panel <ArrowUpRight className="w-3 h-3" />
            </Link>
          </SectionCard>
        )}

        <SectionCard icon={BookOpen} title="Need more?" description="Reach out or read the full docs.">
          <div className="flex flex-wrap gap-3">
            <Link href="/documentation" className="text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition">
              Documentation
            </Link>
            <Link href="/contact" className="text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition">
              Contact us
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
