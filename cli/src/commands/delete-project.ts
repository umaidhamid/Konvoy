import chalk from "chalk";
import ora from "ora";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";

import { getProjects, deleteProject } from "../services/project.js";
import { readLink, removeLink } from "../services/link.js";

export async function deleteProjectCommand() {
  let activeSpinner = ora("Fetching your projects...").start();

  try {
    const projects = await getProjects();
    const ownedProjects = projects.filter((p: any) => p.myRole === "owner");

    activeSpinner.succeed("Projects fetched");

    if (!ownedProjects.length) {
      console.log(chalk.yellow("You don't own any projects to delete. Only the owner can delete a project."));
      return;
    }

    const project = await select({
      message: "Which project do you want to delete?",
      choices: ownedProjects.map((p: any) => ({ name: p.name, value: p })),
    });

    console.log(chalk.red(`This permanently deletes "${(project as any).name}" and every file in it, for every member.`));

    const confirmed = await confirm({
      message: `Delete "${(project as any).name}"? This cannot be undone.`,
      default: false,
    });

    if (!confirmed) {
      console.log(chalk.yellow("Cancelled."));
      return;
    }

    activeSpinner = ora("Deleting project...").start();
    await deleteProject((project as any)._id);
    activeSpinner.succeed(`Deleted "${(project as any).name}"`);

    const cwd = process.cwd();
    const link = readLink(cwd);
    if (link && link.projectId === (project as any)._id) {
      removeLink(cwd);
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;

    if (activeSpinner.isSpinning) {
      activeSpinner.fail(chalk.red(message));
    } else {
      console.log();
      console.log(chalk.red(message));
    }

    process.exitCode = 1;
  }
}
