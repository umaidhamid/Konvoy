"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import { AdminPlan, PlanFormValues } from "@/types/plan.types";
import { PlanFormModal } from "@/components/admin/dashboard/PlanFormModal";
import { formatBytes } from "@/lib/formatBytes";

export default function AdminPlansPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);

  const canLoad = !!user && user.role === "admin";

  const plansQuery = useQuery({
    queryKey: ["adminPlans"],
    queryFn: () => adminService.getAllPlans(),
    enabled: canLoad,
  });
  const plans = plansQuery.data?.data ?? [];
  const error = (plansQuery.error as any)?.response?.data?.message || "";

  const invalidateAfterPlanChange = () => {
    queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
    queryClient.invalidateQueries({ queryKey: ["adminLogs"] });
  };

  const createPlanMutation = useMutation({
    mutationFn: (values: PlanFormValues) => adminService.createPlan(values),
    onSuccess: () => {
      invalidateAfterPlanChange();
      setPlanModalOpen(false);
      toast.success("Plan created");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not create plan."),
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, values }: { planId: string; values: PlanFormValues }) =>
      adminService.updatePlan(planId, values),
    onSuccess: () => {
      invalidateAfterPlanChange();
      setPlanModalOpen(false);
      toast.success("Plan updated");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not update plan."),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => adminService.deletePlan(planId),
    onSuccess: () => {
      invalidateAfterPlanChange();
      toast.success("Plan deleted");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not delete plan."),
  });

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: AdminPlan) => {
    setEditingPlan(plan);
    setPlanModalOpen(true);
  };

  const handlePlanFormSubmit = (values: PlanFormValues) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ planId: editingPlan._id, values });
    } else {
      createPlanMutation.mutate(values);
    }
  };

  const handleDeletePlan = (plan: AdminPlan) => {
    if (!confirm(`Delete plan "${plan.name}"? This can't be undone.`)) return;
    deletePlanMutation.mutate(plan._id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreatePlan}
          className="text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          New plan
        </button>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {plansQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium px-4 py-3">Plan</th>
                <th className="text-left font-medium px-4 py-3">Price</th>
                <th className="text-left font-medium px-4 py-3">Limits</th>
                <th className="text-left font-medium px-4 py-3">Users</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No plans yet. Users fall back to a built-in default (2MB files, 20 files/project, 5
                    members/project, 20 projects, 500MB storage).
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p._id} className="hover:bg-card-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {p.name}
                        {p.isDefault && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            Default
                          </span>
                        )}
                        {p.isHidden && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>
                        {p.priceLabel || "—"} {p.priceSuffix}
                      </div>
                      {p.pricingOptions.length > 0 && (
                        <div className="text-[10px] mt-0.5">
                          {p.pricingOptions.map((o) => `${o.durationMonths}mo/${o.priceLabel}`).join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatBytes(p.maxFileSizeBytes)}/file · {p.maxFilesPerProject} files/project ·{" "}
                      {p.maxMembersPerProject} members/project · {p.maxProjectsPerUser} projects ·{" "}
                      {formatBytes(p.maxStorageBytes)} storage
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.userCount}</td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <span className="text-xs text-success">Active</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditPlan(p)}
                        className="text-xs font-medium text-foreground hover:opacity-80 px-3 py-1.5 rounded bg-secondary hover:bg-secondary/70 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(p)}
                        disabled={deletePlanMutation.isPending}
                        className="text-xs font-medium text-destructive hover:opacity-80 px-3 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 transition disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {planModalOpen && (
        <PlanFormModal
          plan={editingPlan}
          submitting={createPlanMutation.isPending || updatePlanMutation.isPending}
          onSubmit={handlePlanFormSubmit}
          onClose={() => setPlanModalOpen(false)}
        />
      )}
    </div>
  );
}
