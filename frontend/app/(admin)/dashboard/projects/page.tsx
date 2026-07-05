// app/dashboard/projects/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {projectsService } from "@/services/projects.service";
import { Project } from "@/types/project.types";
import { Link } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Track active project info for create/edit operations
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");

  // Fetch initial project dataset
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsService.getProjects();

      setProjects(response.data);
      
    } catch (err: any) {
      console.error("Failed to load projects:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Open modal configuration helper
  const openModal = (project: ProjectData | null = null) => {
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
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setFormError("Project name is required.");

    try {
      if (editingProject) {
        const res = await projectsService.updateProject(editingProject._id, formData.name, formData.description);
        if (res.success) {
          setProjects(projects.map(p => p._id === editingProject._id ? res.data : p));
        }
      } else {
        const res = await projectsService.createProject(formData.name, formData.description);
        if (res.success) setProjects([res.data, ...projects]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "An unexpected error occurred.");
    }
  };

  // Handle deletion sequence
  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await projectsService.deleteProject(projectId);
      if (res.success) {
        setProjects(projects.filter(p => p._id !== projectId));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not delete project.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Your Projects</h1>
            <p className="text-sm text-gray-400 mt-1">Manage, update, or launch your development workspaces.</p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-indigo-600/20 transition-all duration-200"
          >
            Create New Project
          </button>
        </div>

        {/* Content Display Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
            <p className="text-gray-400 font-medium">No projects found</p>
            <p className="text-xs text-gray-500 mt-1">Get started by building your very first dashboard setup.</p>
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
                  className="flex flex-col justify-between p-6 rounded-xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-sm hover:border-gray-700/80 transition-colors duration-200"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide truncate">{project.name}</h3>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-3 leading-relaxed min-h-[60px]">
                      {project.description || "No description provided for this project."}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800/60">
                  <button onClick={() => window.location.href = `/dashboard/projects/${project.slug}`}>
                    {project.slug ? "Open Project" : "Project not ready"}
                  </button>
                    <button
                      onClick={() => openModal(project)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded bg-indigo-500/5 hover:bg-indigo-500/10 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="text-xs font-medium text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded bg-rose-500/5 hover:bg-rose-500/10 transition"
                    >
                      Delete
                    </button>
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
                className="relative w-full max-w-md p-6 rounded-xl bg-gray-900/95 border border-gray-800 shadow-2xl z-10"
              >
                <h2 className="text-xl font-bold text-white mb-4">
                  {editingProject ? "Modify Workspace" : "Launch New Project"}
                </h2>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1.5">Project Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Mango Review Dashboard"
                      className="w-full px-3.5 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1.5">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Give a quick summary of what this project tackles..."
                      className="w-full px-3.5 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-lg">
                      {formError}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-md transition"
                    >
                      {editingProject ? "Save Changes" : "Create"}
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