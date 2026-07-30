"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Folder, Users, Bell, ArrowUpRight, Plus, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { projectsService } from '@/services/projects.service';
import { notificationsService } from '@/services/notifications.service';
import { planService } from '@/services/plan.service';
import { PlanStatusCard } from '@/components/dashboard/PlanStatusCard';

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getProjects(),
    enabled: !!user,
  });
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
    enabled: !!user,
  });
  const myPlanQuery = useQuery({
    queryKey: ['myPlan'],
    queryFn: () => planService.getMyPlan(),
    enabled: !!user,
  });

  const projects = projectsQuery.data?.data ?? [];
  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const dataLoading = projectsQuery.isLoading || notificationsQuery.isLoading;

  if (loading) {
    return <h1>Loading...</h1>;
  }

  const ownedCount = projects.filter((p) => p.myRole === "owner").length;
  const sharedCount = projects.length - ownedCount;

  const collaboratorIds = new Set<string>();
  for (const project of projects) {
    if (project.myRole !== "owner" || !project.members) continue;
    for (const member of project.members) {
      const id = typeof member.userId === "string" ? member.userId : member.userId._id;
      collaboratorIds.add(id);
    }
  }

  const stats = [
    { title: 'Total Projects', value: String(projects.length), icon: Folder },
    { title: 'Owned by You', value: String(ownedCount), icon: Crown },
    { title: 'Shared with You', value: String(sharedCount), icon: Users },
    { title: 'Unread Notifications', value: String(unreadCount), icon: Bell },
  ];

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, 5);

  const recentActivity = notifications.slice(0, 5);

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Upper Banner Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            {user ? `Welcome back, ${user.fullname || user.email}.` : "Manage your projects and team access."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-3 h-9 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </Link>
        </div>
      </div>

      {/* Plan status */}
      {myPlanQuery.data?.data && <PlanStatusCard myPlan={myPlanQuery.data.data} />}

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-card border border-border p-5 rounded-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                <Icon className="w-4 h-4 text-muted-foreground/70" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight">
                  {dataLoading ? "—" : stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Data Split Panels */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Projects Panel */}
        <div className="bg-card border border-border rounded-lg flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Recent Projects</h2>
              <p className="text-xs text-muted-foreground">Your most recently updated projects.</p>
            </div>
            <Link href="/dashboard/projects" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border text-xs">
            {dataLoading ? (
              <p className="p-4 text-muted-foreground">Loading...</p>
            ) : recentProjects.length === 0 ? (
              <p className="p-4 text-muted-foreground">No projects yet. Create your first one to get started.</p>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project.slug}`}
                  className="p-4 flex items-center justify-between hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{project.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                    {project.myRole === "owner" ? "Owner" : "Member"} · {timeAgo(project.updatedAt || project.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-card border border-border rounded-lg flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Recent Activity</h2>
              <p className="text-xs text-muted-foreground">Updates across your projects.</p>
            </div>
          </div>
          <div className="divide-y divide-border text-xs">
            {dataLoading ? (
              <p className="p-4 text-muted-foreground">Loading...</p>
            ) : recentActivity.length === 0 ? (
              <p className="p-4 text-muted-foreground">No activity yet.</p>
            ) : (
              recentActivity.map((n) => (
                <div key={n._id} className="p-4 flex items-start justify-between gap-3">
                  <span className={n.read ? "text-muted-foreground" : "text-foreground font-medium"}>
                    {n.message}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
