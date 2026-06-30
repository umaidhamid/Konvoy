"use client";
import React, { useState, useEffect } from "react";

export interface ProjectFormData {
  name: string;
  description: string;
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  // Populate form if initialData is provided (Update Mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-xl mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {initialData ? "Update Project Details" : "Create New Project"}
      </h2>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Oasis Ascend Dashboard"
          className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm transition-all focus:outline-none focus:ring-2 ${
            errors.name
              ? "border-red-500 focus:ring-red-500/20"
              : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500/10"
          }`}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <span className="text-xs text-zinc-400">{formData.description.length}/500</span>
        </div>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your project goals, stack, or milestones..."
          className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
            errors.description
              ? "border-red-500 focus:ring-red-500/20"
              : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500/10"
          }`}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-sm font-medium text-white bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 hover:opacity-90 rounded-xl transition disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Project"}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;