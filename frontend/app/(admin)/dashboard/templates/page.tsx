"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileCode2, LayoutTemplate, Loader2, X } from "lucide-react";
import { projectsService } from "@/services/projects.service";
import { projectfilesService } from "@/services/projectfiles.service";
import { PROJECT_TEMPLATES, ProjectTemplate } from "@/Data/projectTemplates";

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTemplate, setActiveTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const openModal = (template: ProjectTemplate) => {
    setActiveTemplate(template);
    setProjectName(template.name);
    setFormError("");
  };

  const closeModal = () => {
    if (creating) return;
    setActiveTemplate(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;
    if (!projectName.trim()) return setFormError("Project name is required.");

    setFormError("");
    setCreating(true);
    setProgress({ done: 0, total: activeTemplate.files.length });

    try {
      const projectRes = await projectsService.createProject(
        projectName.trim(),
        `Created from the "${activeTemplate.name}" template.`
      );
      const slug = projectRes.data.slug;
      if (!slug) throw new Error("Project was created but has no slug yet - try opening it from Projects.");

      for (const file of activeTemplate.files) {
        const created = await projectfilesService.createProjectFile(slug, file.name);
        await projectfilesService.updateProjectFile(created._id, file.content);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      toast.success(`"${projectName.trim()}" created with ${activeTemplate.files.length} file(s).`);
      router.push(`/dashboard/projects/${slug}`);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Could not create the project from this template.");
      setCreating(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start a project pre-filled with the config files you'd otherwise write by hand every time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECT_TEMPLATES.map((template, i) => {
            const Icon = template.icon;
            return (
              <motion.button
                key={template.id}
                onClick={() => openModal(template)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="text-left flex flex-col p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{template.name}</h2>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed flex-1">{template.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {template.files.map((f) => (
                    <span
                      key={f.name}
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                    >
                      <FileCode2 className="w-2.5 h-2.5" />
                      {f.name}
                    </span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <LayoutTemplate className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Use "{activeTemplate.name}"</h2>
              </div>
              <button onClick={closeModal} disabled={creating} className="text-muted-foreground hover:text-foreground transition disabled:opacity-40">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">
                  Project name
                </label>
                <input
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition disabled:opacity-60"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">
                  Includes {activeTemplate.files.length} file(s)
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {activeTemplate.files.map((f) => (
                    <li key={f.name} className="flex items-center gap-1.5">
                      <FileCode2 className="w-3 h-3 shrink-0" /> {f.name}
                    </li>
                  ))}
                </ul>
              </div>

              {formError && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="px-4 py-2 bg-secondary text-secondary-foreground font-medium text-sm rounded-lg hover:bg-secondary/70 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !projectName.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {creating ? `Creating files ${progress.done}/${progress.total}...` : "Create project"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
