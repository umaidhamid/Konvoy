import React from 'react';
import Link from 'next/link';
import { Folder, FileText, ArrowUpRight, Plus } from 'lucide-react';

export default function DashboardPage() {
  // Stat Card Config
  const stats = [
    { title: 'Projects', value: '8', icon: Folder },
    { title: 'Files', value: '42', icon: FileText },
    { title: 'Favorites', value: '5', icon: null, badge: 'Later' },
    { title: 'Last Updated', value: 'Today', icon: null, subtext: 'via Web UI' },
  ];

  // Mock Data arrays strictly following your provided project schema
  const recentFiles = [
    { name: '.env', project: 'Portfolio' },
    { name: 'docker-compose.yml', project: 'Node API' },
    { name: 'next.config.js', project: 'Portfolio' },
    { name: 'README.md', project: 'SaaS Starter' },
  ];

  const recentProjects = [
    { name: 'Portfolio', files: 3 },
    { name: 'Node API', files: 2 },
    { name: 'SaaS Starter', files: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* Upper Banner Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-secondary">Manage your system configurations and micro-environments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/projects" 
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-3 h-9 rounded-radius hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-card border border-border p-5 rounded-radius relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{stat.title}</span>
                {Icon && <Icon className="w-4 h-4 text-muted/70" />}
                {stat.badge && (
                  <span className="text-[10px] font-mono bg-warning/10 text-warning px-1.5 py-0.5 rounded border border-warning/20">
                    {stat.badge}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
                {stat.subtext && <span className="text-[11px] text-muted font-normal">{stat.subtext}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Data Split Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Recent Files Panel */}
        <div className="bg-card border border-border rounded-radius flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Recent Files</h2>
              <p className="text-xs text-muted">Quick access to context configurations.</p>
            </div>
            <Link href="/dashboard/files" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border font-mono text-xs">
            {recentFiles.map((file, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-card-hover transition-colors">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-muted" />
                  <span className="font-medium text-foreground">{file.name}</span>
                </div>
                <span className="text-[10px] text-muted bg-background px-2 py-0.5 rounded border border-border">
                  {file.project}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects Panel */}
        <div className="bg-card border border-border rounded-radius flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Recent Projects</h2>
              <p className="text-xs text-muted">Logical storage vaults currently active.</p>
            </div>
            <Link href="/dashboard/projects" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border text-xs">
            {recentProjects.map((proj, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-card-hover transition-colors">
                <span className="font-medium font-mono text-foreground">{proj.name}</span>
                <span className="text-xs text-secondary font-sans">
                  {proj.files} {proj.files === 1 ? 'file' : 'files'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}