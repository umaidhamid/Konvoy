"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { AdminUser, Pagination } from "@/types/admin.types";

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

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function memberLabel(m: { _id: string; fullname?: string; email?: string } | string | null | undefined) {
  if (!m) return "Deleted user";
  if (typeof m === "string") return m;
  return m.fullname || m.email || m._id;
}

const ROLES: AdminUser["role"][] = ["user", "moderator", "admin"];

function Pager({ pagination, onPage }: { pagination: Pagination | null; onPage: (page: number) => void }) {
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
          className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/70 transition"
        >
          Prev
        </button>
        <button
          onClick={() => onPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
          className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/70 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"overview" | "users" | "projects" | "logs">("overview");

  const [usersPage, setUsersPage] = useState(1);
  const [usersSearchInput, setUsersSearchInput] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsSearchInput, setProjectsSearchInput] = useState("");
  const [projectsSearch, setProjectsSearch] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);

  // Debounce search inputs -> committed search terms, resetting to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setUsersSearch(usersSearchInput);
      setUsersPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [usersSearchInput]);

  useEffect(() => {
    const t = setTimeout(() => {
      setProjectsSearch(projectsSearchInput);
      setProjectsPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [projectsSearchInput]);

  const canLoad = !authLoading && !!user && user.role === "admin";

  const statsQuery = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => adminService.getStats(),
    enabled: canLoad,
  });

  const usersQuery = useQuery({
    queryKey: ["adminUsers", usersPage, usersSearch],
    queryFn: () => adminService.getAllUsers(usersPage, 20, usersSearch),
    enabled: canLoad,
    placeholderData: keepPreviousData,
  });

  const projectsQuery = useQuery({
    queryKey: ["adminProjects", projectsPage, projectsSearch],
    queryFn: () => adminService.getAllProjects(projectsPage, 20, projectsSearch),
    enabled: canLoad,
    placeholderData: keepPreviousData,
  });

  const logsQuery = useQuery({
    queryKey: ["adminLogs"],
    queryFn: () => adminService.getLogs(),
    enabled: canLoad,
  });

  const users = usersQuery.data?.data ?? [];
  const usersPagination = usersQuery.data?.pagination ?? null;
  const projects = projectsQuery.data?.data ?? [];
  const projectsPagination = projectsQuery.data?.pagination ?? null;
  const logs = logsQuery.data?.data ?? [];
  const stats = statsQuery.data?.data ?? null;

  // Reset row selection whenever the underlying page/search changes
  useEffect(() => setSelectedUserIds(new Set()), [usersPage, usersSearch]);
  useEffect(() => setSelectedProjectIds(new Set()), [projectsPage, projectsSearch]);

  const invalidateAfterUserChange = () => {
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    queryClient.invalidateQueries({ queryKey: ["adminLogs"] });
  };
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

  const deactivateMutation = useMutation({
    mutationFn: ({ userId, deactivated, note }: { userId: string; deactivated: boolean; note?: string }) =>
      adminService.setUserDeactivation(userId, deactivated, note),
    onSuccess: (_res, vars) => {
      invalidateAfterUserChange();
      toast.success(`User ${vars.deactivated ? "deactivated" : "reactivated"}`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not update user."),
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: ({ userIds, deactivated, note }: { userIds: string[]; deactivated: boolean; note?: string }) =>
      adminService.bulkSetUserDeactivation(userIds, deactivated, note),
    onSuccess: (res) => {
      setSelectedUserIds(new Set());
      invalidateAfterUserChange();
      toast.success(res.message || "Users updated");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not update selected users."),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AdminUser["role"] }) =>
      adminService.setUserRole(userId, role),
    onSuccess: () => {
      invalidateAfterUserChange();
      toast.success("Role updated");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not update role."),
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

  const handleToggleDeactivate = (u: AdminUser) => {
    const deactivating = !u.isDeactivated;
    const note = deactivating ? window.prompt(`Reason for deactivating ${u.email} (optional):`) || "" : "";
    if (deactivating && note === null) return;
    if (!confirm(`${deactivating ? "Deactivate" : "Reactivate"} ${u.email}?`)) return;
    deactivateMutation.mutate({ userId: u._id, deactivated: deactivating, note });
  };

  const handleBulkDeactivate = (deactivated: boolean) => {
    const ids = Array.from(selectedUserIds);
    if (!ids.length) return;
    const note = deactivated ? window.prompt(`Reason for deactivating ${ids.length} user(s) (optional):`) || "" : "";
    if (deactivated && note === null) return;
    if (!confirm(`${deactivated ? "Deactivate" : "Reactivate"} ${ids.length} selected user(s)?`)) return;
    bulkDeactivateMutation.mutate({ userIds: ids, deactivated, note });
  };

  const handleRoleChange = (u: AdminUser, role: AdminUser["role"]) => {
    if (role === u.role) return;
    if (!confirm(`Change ${u.email}'s role from "${u.role}" to "${role}"?`)) return;
    roleMutation.mutate({ userId: u._id, role });
  };

  const toggleUserSelected = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllUsersOnPage = () => {
    const selectableIds = users.filter((u) => u._id !== user?.id).map((u) => u._id);
    const allSelected = selectableIds.every((id) => selectedUserIds.has(id));
    setSelectedUserIds(allSelected ? new Set() : new Set(selectableIds));
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

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const dataLoading =
    (tab === "overview" && statsQuery.isLoading) ||
    (tab === "users" && usersQuery.isLoading) ||
    (tab === "projects" && projectsQuery.isLoading) ||
    (tab === "logs" && logsQuery.isLoading);

  const error =
    (usersQuery.error as any)?.response?.data?.message ||
    (projectsQuery.error as any)?.response?.data?.message ||
    (statsQuery.error as any)?.response?.data?.message ||
    "";

  const bulkBusy = bulkDeactivateMutation.isPending || bulkDeleteProjectsMutation.isPending;

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Site Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every user and every project on the platform, not just yours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setTab("overview")}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition ${
              tab === "overview"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab("users")}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition ${
              tab === "users"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            Users {usersPagination ? `(${usersPagination.total})` : ""}
          </button>
          <button
            onClick={() => setTab("projects")}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition ${
              tab === "projects"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            Projects {projectsPagination ? `(${projectsPagination.total})` : ""}
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition ${
              tab === "logs"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            Activity Log
          </button>

          <div className="flex-1" />

          {tab === "users" && (
            <>
              <button
                onClick={() => window.open(adminService.usersExportUrl(usersSearch), "_blank")}
                className="text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition"
              >
                Export CSV
              </button>
              <input
                value={usersSearchInput}
                onChange={(e) => setUsersSearchInput(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full sm:w-64 px-3 py-2 bg-background border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
            </>
          )}
          {tab === "projects" && (
            <>
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
            </>
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        {dataLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : tab === "overview" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats?.totalUsers ?? "—" },
                { label: "Total Projects", value: stats?.totalProjects ?? "—" },
                { label: "Total Files", value: stats?.totalFiles ?? "—" },
                { label: "Storage Used", value: stats ? formatBytes(stats.totalSizeBytes) : "—" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-card border border-border p-5 rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Top Projects by Storage</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-card text-xs text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Project</th>
                    <th className="text-left font-medium px-4 py-3">Owner</th>
                    <th className="text-left font-medium px-4 py-3">Files</th>
                    <th className="text-left font-medium px-4 py-3">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {!stats?.topProjects.length ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No files uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    stats.topProjects.map((p) => (
                      <tr key={p.projectId}>
                        <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{memberLabel(p.owner)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.fileCount}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatBytes(p.sizeBytes)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === "users" ? (
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            {selectedUserIds.size > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-border text-xs">
                <span className="font-medium">{selectedUserIds.size} selected</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkDeactivate(true)}
                    disabled={bulkBusy}
                    className="px-3 py-1.5 rounded bg-destructive/5 text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
                  >
                    Deactivate Selected
                  </button>
                  <button
                    onClick={() => handleBulkDeactivate(false)}
                    disabled={bulkBusy}
                    className="px-3 py-1.5 rounded bg-success/5 text-success hover:bg-success/10 transition disabled:opacity-50"
                  >
                    Reactivate Selected
                  </button>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead className="bg-card text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && users.filter((u) => u._id !== user.id).every((u) => selectedUserIds.has(u._id))}
                      onChange={toggleAllUsersOnPage}
                    />
                  </th>
                  <th className="text-left font-medium px-4 py-3">User</th>
                  <th className="text-left font-medium px-4 py-3">Role</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Last login</th>
                  <th className="text-left font-medium px-4 py-3">Joined</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = u._id === user.id;
                    const busy =
                      (deactivateMutation.isPending && deactivateMutation.variables?.userId === u._id) ||
                      (roleMutation.isPending && roleMutation.variables?.userId === u._id);
                    return (
                      <tr key={u._id} className="hover:bg-card-hover transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            disabled={isSelf}
                            checked={selectedUserIds.has(u._id)}
                            onChange={() => toggleUserSelected(u._id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">
                            {u.fullname || "—"} {isSelf && <span className="text-[10px] text-muted-foreground">(you)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={isSelf || busy}
                            onChange={(e) => handleRoleChange(u, e.target.value as AdminUser["role"])}
                            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {u.isDeactivated ? (
                            <span className="text-xs text-destructive">Deactivated</span>
                          ) : u.isVerified ? (
                            <span className="text-xs text-success">Active</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unverified</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(u.lastLoginAt) || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(u.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleDeactivate(u)}
                            disabled={isSelf || busy}
                            className={`text-xs font-medium px-3 py-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${
                              u.isDeactivated
                                ? "text-success hover:opacity-80 bg-success/5 hover:bg-success/10"
                                : "text-destructive hover:opacity-80 bg-destructive/5 hover:bg-destructive/10"
                            }`}
                          >
                            {u.isDeactivated ? "Reactivate" : "Deactivate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <Pager pagination={usersPagination} onPage={setUsersPage} />
          </div>
        ) : tab === "projects" ? (
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
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border">
            {logs.length === 0 ? (
              <p className="px-4 py-8 text-center text-muted-foreground text-sm">No admin actions yet.</p>
            ) : (
              logs.map((l) => (
                <div key={l._id} className="px-4 py-3 flex items-start justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium text-foreground">{memberLabel(l.actorId)}</span>{" "}
                    <span className="text-muted-foreground">{l.details}</span>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(l.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
