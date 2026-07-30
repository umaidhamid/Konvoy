import chalk from "chalk";
import ora from "ora";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";

import { getProjects, leaveProject } from "../services/project.js";

export async function leaveCommand() {
  let activeSpinner = ora("Fetching your projects...").start();

  try {
    const projects = await getProjects();
    const memberProjects = projects.filter((p: any) => p.myRole !== "owner");

    activeSpinner.succeed("Projects fetched");

    if (!memberProjects.length) {
      console.log(chalk.yellow("You're not a member of any project you don't own. Nothing to leave."));
      return;
    }

    const project = await select({
      message: "Which project do you want to leave?",
      choices: memberProjects.map((p: any) => ({ name: p.name, value: p })),
    });

    const shouldLeave = await confirm({
      message: `Leave "${(project as any).name}"? You'll lose access unless invited again.`,
    });

    if (!shouldLeave) {
      console.log(chalk.yellow("Cancelled."));
      return;
    }

    activeSpinner = ora("Leaving project...").start();
    await leaveProject((project as any)._id);
    activeSpinner.succeed(`Left "${(project as any).name}"`);
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
