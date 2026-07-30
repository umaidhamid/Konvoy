// app/dashboard/projects/page.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsService } from "@/services/projects.service";
import { Project } from "@/types/project.types";

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track active project info for create/edit operations
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");

  // Share/invite modal state
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsService.getProjects(),
  });
  const projects = projectsQuery.data?.data ?? [];
  const loading = projectsQuery.isLoading;

  // Full detail (with populated members) for whichever project the share modal is open on
  const shareProjectQuery = useQuery({
    queryKey: ["project", shareProjectId],
    queryFn: () => projectsService.getProject(shareProjectId as string),
    enabled: !!shareProjectId,
  });
  const shareProject = shareProjectQuery.data?.data ?? projects.find((p) => p._id === shareProjectId) ?? null;
  const membersLoading = shareProjectQuery.isLoading;

  const invalidateProjects = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const createMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description: string }) =>
      projectsService.createProject(name, description),
    onSuccess: () => {
      invalidateProjects();
      setIsModalOpen(false);
      toast.success("Project created");
    },
    onError: (err: any) => setFormError(err?.response?.data?.message || "An unexpected error occurred."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, description }: { id: string; name: string; description: string }) =>
      projectsService.updateProject(id, name, description),
    onSuccess: () => {
      invalidateProjects();
      setIsModalOpen(false);
      toast.success("Project updated");
    },
    onError: (err: any) => setFormError(err?.response?.data?.message || "An unexpected error occurred."),
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.deleteProject(projectId),
    onSuccess: () => {
      invalidateProjects();
      toast.success("Project deleted");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not delete project."),
  });

  const leaveMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.leaveProject(projectId),
    onSuccess: () => {
      invalidateProjects();
      toast.success("Left project");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not leave project."),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, email }: { projectId: string; email: string }) =>
      projectsService.addMember(projectId, email),
    onSuccess: (res) => {
      setShareSuccess(`${shareEmail} now has access. They'll get an email and see the project in their dashboard.`);
      setShareEmail("");
      queryClient.setQueryData(["project", shareProjectId], res);
      invalidateProjects();
    },
    onError: (err: any) => setShareError(err?.response?.data?.message || "Could not add member."),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      projectsService.removeMember(projectId, memberId),
    onSuccess: (res) => {
      queryClient.setQueryData(["project", shareProjectId], res);
      invalidateProjects();
    },
    onError: (err: any) => setShareError(err?.response?.data?.message || "Could not remove member."),
  });

  // Open modal configuration helper
  const openModal = (project: Project | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ name: project.name, description: project.description });
    } else {
      setEditingProject(null);
      setFormData({ name: "", description: "" });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  // Handle Form submission logic (Create / Update split)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setFormError("Project name is required.");
    setFormError("");

    if (editingProject) {
      updateMutation.mutate({ id: editingProject._id, name: formData.name, description: formData.description });
    } else {
      createMutation.mutate({ name: formData.name, description: formData.description });
    }
  };

  const openShareModal = (project: Project) => {
    setShareEmail("");
    setShareError("");
    setShareSuccess("");
    setShareProjectId(project._id);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareProjectId || addMemberMutation.isPending) return;
    if (!shareEmail.trim()) return setShareError("Email is required.");
    setShareError("");
    setShareSuccess("");
    addMemberMutation.mutate({ projectId: shareProjectId, email: shareEmail.trim() });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!shareProjectId) return;
    if (!confirm("Remove this member from the project?")) return;
    setShareError("");
    setShareSuccess("");
    removeMemberMutation.mutate({ projectId: shareProjectId, memberId });
  };

  const handleLeaveProject = (projectId: string) => {
    if (!confirm("Leave this project? You'll lose access unless invited again.")) return;
    leaveMutation.mutate(projectId);
  };

  const handleDelete = (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    deleteMutation.mutate(projectId);
  };

  const formSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage, update, or launch your development workspaces.</p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200"
          >
            Create New Project
          </button>
        </div>

        {/* Content Display Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
            <p className="text-muted-foreground font-medium">No projects found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Get started by building your very first dashboard setup.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col justify-between p-6 rounded-xl bg-card border border-border backdrop-blur-sm hover:border-primary/30 transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-wide truncate">{project.name}</h3>
                      {project.myRole && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                          {project.myRole === "owner" ? "Owner" : "✓ You have access"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed min-h-[60px]">
                      {project.description || "No description provided for this project."}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => window.location.href = `/dashboard/projects/${project.slug}`}
                    className="text-xs font-medium text-foreground hover:opacity-80 px-3 py-1.5 rounded bg-secondary hover:bg-secondary/70 transition"
                  >
                    {project.slug ? "Open Project" : "Project not ready"}
                  </button>
                    {project.myRole === "owner" && (
                      <button
                        onClick={() => openShareModal(project)}
                        className="text-xs font-medium text-success hover:opacity-80 px-3 py-1.5 rounded bg-success/5 hover:bg-success/10 transition"
                      >
                        Share
                      </button>
                    )}
                    {project.myRole === "owner" && (
                      <button
                        onClick={() => openModal(project)}
                        className="text-xs font-medium text-primary hover:opacity-80 px-3 py-1.5 rounded bg-primary/5 hover:bg-primary/10 transition"
                      >
                        Edit
                      </button>
                    )}
                    {project.myRole === "owner" && (
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="text-xs font-medium text-destructive hover:opacity-80 px-3 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 transition"
                      >
                        Delete
                      </button>
                    )}
                    {project.myRole && project.myRole !== "owner" && (
                      <button
                        onClick={() => handleLeaveProject(project._id)}
                        className="text-xs font-medium text-destructive hover:opacity-80 px-3 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 transition"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Floating Backdrop Glassmorphic Form Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Form Window Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md p-6 rounded-xl bg-popover border border-border shadow-2xl z-10"
              >
                <h2 className="text-xl font-bold mb-4">
                  {editingProject ? "Modify Workspace" : "Launch New Project"}
                </h2>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1.5">Project Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Mango Review Dashboard"
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1.5">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Give a quick summary of what this project tackles..."
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition resize-none"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                      {formError}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50 font-medium text-sm rounded-lg shadow-md hover:opacity-90 transition"
                    >
                      {formSubmitting ? "Saving..." : editingProject ? "Save Changes" : "Create"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share/Invite Modal */}
        <AnimatePresence>
          {shareProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShareProjectId(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md p-6 rounded-xl bg-popover border border-border shadow-2xl z-10"
              >
                <h2 className="text-xl font-bold mb-1">Share "{shareProject.name}"</h2>
                <p className="text-xs text-muted-foreground mb-4">Invite a teammate by email to collaborate on this project.</p>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1.5">
                    Members
                  </label>
                  {membersLoading ? (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  ) : shareProject.members?.length ? (
                    <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                      {shareProject.members.map((m) => {
                        const memberUser = typeof m.userId === "string" ? { _id: m.userId } : m.userId;
                        return (
                          <li
                            key={memberUser._id}
                            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-sm"
                          >
                            <span className="truncate">
                              {memberUser.fullname || memberUser.email || memberUser._id}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-success">
                                ✓ Has access
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(memberUser._id)}
                                disabled={removeMemberMutation.isPending}
                                className="text-xs text-destructive hover:opacity-80 transition disabled:opacity-40"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No members invited yet.</p>
                  )}
                </div>

                <form onSubmit={handleShareSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1.5">Email</label>
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="teammate@example.com"
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  {shareError && (
                    <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                      {shareError}
                    </p>
                  )}
                  {shareSuccess && (
                    <p className="text-xs text-success bg-success/5 border border-success/20 px-3 py-2 rounded-lg">
                      {shareSuccess}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShareProjectId(null)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={addMemberMutation.isPending}
                      className="px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm rounded-lg shadow-md hover:opacity-90 transition flex items-center gap-2"
                    >
                      {addMemberMutation.isPending && (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                      )}
                      {addMemberMutation.isPending ? "Inviting..." : "Invite"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
