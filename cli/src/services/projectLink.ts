import ora from "ora";
import select from "@inquirer/select";
import { input } from "@inquirer/prompts";

import { createProject, getProjects } from "./project.js";

const CREATE_NEW = "__create_new__";

// Always asks which project to target - every push/add/share/etc. run picks
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
