import chalk from "chalk";
import ora from "ora";
import confirm from "@inquirer/confirm";

import { readLink, removeLink } from "../services/link.js";
import { getLiveAccess } from "../services/projectLink.js";
import { leaveProject } from "../services/project.js";

export async function leaveCommand() {
  const cwd = process.cwd();
  const link = readLink(cwd);

  if (!link) {
    console.log(chalk.yellow("This folder isn't linked to a project."));
    return;
  }

  const access = await getLiveAccess(link.projectId).catch(() => null);
  if (access?.role === "owner") {
    console.log(chalk.yellow('You own this project — run "konvoy delete-project" instead of leaving it.'));
    return;
  }

  const shouldLeave = await confirm({
    message: `Leave "${link.name}"? You'll lose access unless invited again.`,
  });

  if (!shouldLeave) {
    console.log(chalk.yellow("Cancelled."));
    return;
  }

  const spinner = ora("Leaving project...").start();

  try {
    await leaveProject(link.projectId);
    removeLink(cwd);
    spinner.succeed(`Left "${link.name}"`);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    spinner.fail(chalk.red(message));
    process.exitCode = 1;
  }
}
