import chalk from "chalk";
import ora from "ora";
import { input } from "@inquirer/prompts";

import { createProject } from "../services/project.js";

export async function initCommand() {
  const name = await input({ message: "Project name" });
  const description = await input({ message: "Description (optional)" });

  const spinner = ora("Creating project...").start();

  try {
    const project = await createProject(name, description || undefined);
    spinner.succeed(`Project "${project.name}" created`);
  } catch (error: any) {
    spinner.fail("Failed to create project");
    console.log(chalk.red(error.response?.data?.message || error.message));
    process.exitCode = 1;
  }
}
