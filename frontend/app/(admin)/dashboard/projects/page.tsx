"use client";
import React, { useState } from "react";
import ProjectForm, { ProjectFormData } from "@/components/admin/projects/ProjectForm";

// Local Mock Data conforming to your Mongoose Schema structure
interface ProjectItem {
  _id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const initialProjects: ProjectItem[] = [
  {
    _id: "p1",
    userId: "u123",
    name: "GoFixy Service Platform",
    description: "Appliance booking and instant repair management architecture with modern layouts.",
    createdAt: "2026-04-10T14:32:00.000Z",
    updatedAt: "2026-04-12T09:15:00.000Z",
  },
  {
    _id: "p2",
    userId: "u123",
    name: "Mango Review QR",
    description: "Elegant, customized micro-review system utilizing beautifully branded dynamic QR codes.",
    createdAt: "2026-05-01T11:00:00.000Z",
    updatedAt: "2026-05-01T11:00:00.000Z",
  },
];

type ViewState = "LIST" | "CREATE" | "DETAILS" | "EDIT";

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [view, setView] = useState<ViewState>("LIST");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle Form Submission for both CREATE and EDIT modes
  const handleFormSubmit = async (formData: ProjectFormData) => {
    setLoading(true);
    // Simulate API Latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (view === "EDIT" && selectedProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p._id === selectedProject._id
            ? { ...p, ...formData, updatedAt: new Date().toISOString() }
            : p
        )
      );
      // Synchronize details view state if editing from inside details
      setSelectedProject((prev) =>
        prev ? { ...prev, ...formData, updatedAt: new Date().toISOString() } : null
      );
    } else {
      const newProject: ProjectItem = {
        _id: `p_${Date.now()}`,
        userId: "u123",
        name: formData.name,
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProject, ...prev]);
    }

    setLoading(false);
    setView("LIST");
  };

  const handleSelectDetails = (project: ProjectItem) => {
    setSelectedProject(project);
    setView("DETAILS");
  };

  const handleSelectEdit = (project: ProjectItem) => {
    setSelectedProject(project);
    setView("EDIT");
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Dynamic Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {view === "LIST" && "Projects Workspace"}
              {view === "CREATE" && "New Project"}
              {view === "DETAILS" && selectedProject?.name}
              {view === "EDIT" && "Modify Project"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {view === "LIST" && "Manage, organize, and inspect your ongoing product deployments."}
              {view === "CREATE" && "Set up parameters to provision your brand-new system node."}
              {view === "DETAILS" && "Complete project configuration profiles and timestamps."}
              {view === "EDIT" && `Updating structural values for ${selectedProject?.name}`}
            </p>
          </div>

          {view === "LIST" && (
            <button
              onClick={() => setView("CREATE")}
              className="px-4 py-2.5 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-sm font-medium rounded-xl hover:opacity-90 transition shadow-sm w-full sm:w-auto text-center"
            >
              + Create Project
            </button>
          )}

          {view !== "LIST" && (
            <button
              onClick={() => setView("LIST")}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              &larr; Back to List
            </button>
          )}
        </div>

        {/* VIEW 1: PROJECT LIST GRID */}
        {view === "LIST" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group flex flex-col justify-between p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3">
                    {project.description || "No description provided for this project workspace."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleSelectDetails(project)}
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:underline"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleSelectEdit(project)}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: CREATE PROJECT */}
        {view === "CREATE" && (
          <ProjectForm
            onSubmit={handleFormSubmit}
            onCancel={() => setView("LIST")}
            isSubmitting={loading}
          />
        )}

        {/* VIEW 3: PROJECT DETAILS */}
        {view === "DETAILS" && selectedProject && (
          <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-mono px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                  ID: {selectedProject._id}
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-3">
                  {selectedProject.name}
                </h2>
              </div>
              <button
                onClick={() => setView("EDIT")}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-sm font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Edit Details
              </button>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedProject.description || "No description provided."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div>
                <p className="text-zinc-400">Created At</p>
                <p className="font-medium mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {new Date(selectedProject.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Last Modified</p>
                <p className="font-medium mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {new Date(selectedProject.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: EDIT PROJECT (Uses the shared form component) */}
        {view === "EDIT" && selectedProject && (
          <ProjectForm
            initialData={{
              name: selectedProject.name,
              description: selectedProject.description,
            }}
            onSubmit={handleFormSubmit}
            onCancel={() => setView("LIST")}
            isSubmitting={loading}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;