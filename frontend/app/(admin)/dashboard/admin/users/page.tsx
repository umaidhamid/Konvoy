"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { AdminUser } from "@/types/admin.types";
import { Pager } from "@/components/admin/dashboard/Pager";
import { PlanAssignmentCell } from "@/components/admin/dashboard/PlanAssignmentCell";
import { timeAgo, isExpired } from "@/lib/adminFormat";

const ROLES: AdminUser["role"][] = ["user", "moderator", "admin"];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [usersPage, setUsersPage] = useState(1);
  const [usersSearchInput, setUsersSearchInput] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPlanStatus, setUsersPlanStatus] = useState<"" | "active" | "expired">("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      setUsersSearch(usersSearchInput);
      setUsersPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [usersSearchInput]);

  const canLoad = !!user && user.role === "admin";

  const usersQuery = useQuery({
    queryKey: ["adminUsers", usersPage, usersSearch, usersPlanStatus],
    queryFn: () => adminService.getAllUsers(usersPage, 20, usersSearch, usersPlanStatus),
    enabled: canLoad,
    placeholderData: keepPreviousData,
  });
  const plansQuery = useQuery({
    queryKey: ["adminPlans"],
    queryFn: () => adminService.getAllPlans(),
    enabled: canLoad,
  });

  const users = usersQuery.data?.data ?? [];
  const usersPagination = usersQuery.data?.pagination ?? null;
  const plans = plansQuery.data?.data ?? [];
  const error = (usersQuery.error as any)?.response?.data?.message || "";

  useEffect(() => setSelectedUserIds(new Set()), [usersPage, usersSearch]);

  const invalidateAfterUserChange = () => {
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    queryClient.invalidateQueries({ queryKey: ["adminLogs"] });
  };

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

  const planMutation = useMutation({
    mutationFn: ({ userId, planId, durationMonths }: { userId: string; planId: string | null; durationMonths?: number }) =>
      adminService.setUserPlan(userId, planId, durationMonths),
    onSuccess: () => {
      invalidateAfterUserChange();
      toast.success("Plan updated");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not update plan."),
  });

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

  const handlePlanChange = (u: AdminUser, planId: string | null, durationMonths?: number) => {
    if (planId === (u.planId?._id ?? null) && durationMonths === undefined) return;
    planMutation.mutate({ userId: u._id, planId, durationMonths });
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

  const bulkBusy = bulkDeactivateMutation.isPending;

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => window.open(adminService.usersExportUrl(usersSearch), "_blank")}
          className="text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition"
        >
          Export CSV
        </button>
        <select
          value={usersPlanStatus}
          onChange={(e) => {
            setUsersPlanStatus(e.target.value as "" | "active" | "expired");
            setUsersPage(1);
          }}
          className="px-2.5 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary transition"
        >
          <option value="">All plans</option>
          <option value="active">Active plan</option>
          <option value="expired">Expired plan</option>
        </select>
        <input
          value={usersSearchInput}
          onChange={(e) => setUsersSearchInput(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full sm:w-64 px-3 py-2 bg-background border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {usersQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
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
                <th className="text-left font-medium px-4 py-3">Plan</th>
                <th className="text-left font-medium px-4 py-3">Plan expires</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Last login</th>
                <th className="text-left font-medium px-4 py-3">Joined</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
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
                        <PlanAssignmentCell
                          user={u}
                          plans={plans}
                          busy={planMutation.isPending && planMutation.variables?.userId === u._id}
                          onAssign={(planId, durationMonths) => handlePlanChange(u, planId, durationMonths)}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {!u.planExpiresAt ? (
                          <span className="text-muted-foreground">—</span>
                        ) : isExpired(u.planExpiresAt) ? (
                          <span className="text-destructive">Expired {timeAgo(u.planExpiresAt)}</span>
                        ) : (
                          <span className="text-muted-foreground">{new Date(u.planExpiresAt).toLocaleDateString()}</span>
                        )}
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
      )}
    </div>
  );
}
