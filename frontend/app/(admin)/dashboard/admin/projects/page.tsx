"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { Pager } from "@/components/admin/dashboard/Pager";
import { timeAgo, memberLabel } from "@/lib/adminFormat";

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsSearchInput, setProjectsSearchInput] = useState("");
  const [projectsSearch, setProjectsSearch] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      setProjectsSearch(projectsSearchInput);
      setProjectsPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [projectsSearchInput]);

  const canLoad = !!user && user.role === "admin";

  const projectsQuery = useQuery({
    queryKey: ["adminProjects", projectsPage, projectsSearch],
    queryFn: () => adminService.getAllProjects(projectsPage, 20, projectsSearch),
    enabled: canLoad,
    placeholderData: keepPreviousData,
  });

  const projects = projectsQuery.data?.data ?? [];
  const projectsPagination = projectsQuery.data?.pagination ?? null;
  const error = (projectsQuery.error as any)?.response?.data?.message || "";

  useEffect(() => setSelectedProjectIds(new Set()), [projectsPage, projectsSearch]);

  const invalidateAfterProjectChange = () => {
    queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
    queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    queryClient.invalidateQueries({ queryKey: ["adminLogs"] });
  };

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => adminService.deleteProject(projectId),
    onSuccess: () => {
      invalidateAfterProjectChange();
      toast.success("Project deleted");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not delete project."),
  });

  const bulkDeleteProjectsMutation = useMutation({
    mutationFn: (projectIds: string[]) => adminService.bulkDeleteProjects(projectIds),
    onSuccess: (res) => {
      setSelectedProjectIds(new Set());
      invalidateAfterProjectChange();
      toast.success(res.message || "Projects deleted");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not delete selected projects."),
  });

  const handleDeleteProject = (projectId: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This removes it and all its files for every user.`)) return;
    deleteProjectMutation.mutate(projectId);
  };

  const handleBulkDeleteProjects = () => {
    const ids = Array.from(selectedProjectIds);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} selected project(s)? This removes them and all their files.`)) return;
    bulkDeleteProjectsMutation.mutate(ids);
  };

  const toggleProjectSelected = (id: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllProjectsOnPage = () => {
    const ids = projects.map((p) => p._id);
    const allSelected = ids.every((id) => selectedProjectIds.has(id));
    setSelectedProjectIds(allSelected ? new Set() : new Set(ids));
  };

  const bulkBusy = bulkDeleteProjectsMutation.isPending;

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => window.open(adminService.projectsExportUrl(projectsSearch), "_blank")}
          className="text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition"
        >
          Export CSV
        </button>
        <input
          value={projectsSearchInput}
          onChange={(e) => setProjectsSearchInput(e.target.value)}
          placeholder="Search projects by name..."
          className="w-full sm:w-64 px-3 py-2 bg-background border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {projectsQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
          {selectedProjectIds.size > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-border text-xs">
              <span className="font-medium">{selectedProjectIds.size} selected</span>
              <button
                onClick={handleBulkDeleteProjects}
                disabled={bulkBusy}
                className="px-3 py-1.5 rounded bg-destructive/5 text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="bg-card text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={projects.length > 0 && projects.every((p) => selectedProjectIds.has(p._id))}
                    onChange={toggleAllProjectsOnPage}
                  />
                </th>
                <th className="text-left font-medium px-4 py-3">Project</th>
                <th className="text-left font-medium px-4 py-3">Owner</th>
                <th className="text-left font-medium px-4 py-3">Members</th>
                <th className="text-left font-medium px-4 py-3">Files</th>
                <th className="text-left font-medium px-4 py-3">Updated</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p._id} className="hover:bg-card-hover transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.has(p._id)}
                        onChange={() => toggleProjectSelected(p._id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{memberLabel(p.userId)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.members?.length || 0}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.fileCount}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(p.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteProject(p._id, p.name)}
                        className="text-xs font-medium text-destructive hover:opacity-80 px-3 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pager pagination={projectsPagination} onPage={setProjectsPage} />
        </div>
      )}
    </div>
  );
}
