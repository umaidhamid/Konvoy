import ora from "ora";
import select from "@inquirer/select";
import { input } from "@inquirer/prompts";

import { readLink, writeLink, ProjectLink } from "./link.js";
import { createProject, getProjects } from "./project.js";

export async function ensureProjectLink(cwd: string): Promise<ProjectLink> {
  const existing = readLink(cwd);
  if (existing) return existing;

  const mode = await select({
    message: "This folder isn't linked to a project yet. What do you want to do?",
    choices: [
      { name: "Create a new project", value: "create" },
      { name: "Link an existing project", value: "link" },
    ],
  });

  if (mode === "create") {
    const name = await input({ message: "Project name" });
    const description = await input({ message: "Description (optional)" });

    const spinner = ora("Creating project...").start();
    let project;
    try {
      project = await createProject(name, description || undefined);
    } catch (error) {
      spinner.fail("Failed to create project");
      throw error;
    }
    spinner.succeed(`Project "${project.name}" created`);

    const link: ProjectLink = {
      projectId: project._id,
      slug: project.slug,
      name: project.name,
    };
    writeLink(cwd, link);
    return link;
  }

  const spinner = ora("Fetching projects...").start();
  let projects;
  try {
    projects = await getProjects();
  } catch (error) {
    spinner.fail("Failed to fetch projects");
    throw error;
  }
  spinner.succeed("Projects fetched");

  if (!projects.length) {
    throw new Error("No projects found. Choose 'Create a new project' instead.");
  }

  const selectedProject = await select({
    message: "Select a project to link",
    choices: projects.map((project: any) => ({
      name: project.name,
      value: project,
    })),
  });

  const link: ProjectLink = {
    projectId: (selectedProject as any)._id,
    slug: (selectedProject as any).slug,
    name: (selectedProject as any).name,
  };
  writeLink(cwd, link);
  return link;
}

const CREATE_NEW = "__create_new__";

// Always asks which project to target - used by push/add so every run picks
// (or creates) a destination instead of relying on a cached folder link.
export async function selectTargetProject(
  promptMessage: string
): Promise<{ _id: string; slug: string; name: string }> {
  const spinner = ora("Fetching your projects...").start();
  let projects: any[];
  try {
    projects = await getProjects();
  } catch (error) {
    spinner.fail("Failed to fetch projects");
    throw error;
  }
  spinner.succeed(projects.length ? `Found ${projects.length} project(s)` : "No projects yet");

  const choice = await select({
    message: promptMessage,
    choices: [
      ...projects.map((project: any) => ({ name: project.name, value: project })),
      { name: "+ Create a new project", value: CREATE_NEW },
    ],
  });

  if (choice !== CREATE_NEW) return choice as any;

  const name = await input({ message: "Project name" });
  const description = await input({ message: "Description (optional)" });

  const createSpinner = ora("Creating project...").start();
  let project;
  try {
    project = await createProject(name, description || undefined);
  } catch (error) {
    createSpinner.fail("Failed to create project");
    throw error;
  }
  createSpinner.succeed(`Project "${project.name}" created`);

  return project;
}

// Looks up the caller's current access on a project straight from the server.
// Never cached to disk - a local file can be hand-edited, so it's not a
// trustworthy source for anything access-related.
export async function getLiveAccess(
  projectId: string
): Promise<{ role: "owner" | "member"; fileCount?: number } | null> {
  const projects = await getProjects();
  const match = projects.find((project: any) => project._id === projectId);
  if (!match) return null;

  return { role: match.myRole, fileCount: match.myFileIds?.length };
}
