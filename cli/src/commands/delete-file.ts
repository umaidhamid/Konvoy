import chalk from "chalk";
import ora from "ora";
import select from "@inquirer/select";
import checkbox from "@inquirer/checkbox";
import confirm from "@inquirer/confirm";

import { getProjects, getProjectFiles, deleteProjectFile } from "../services/project.js";

export async function deleteFileCommand() {
  let activeSpinner = ora("Fetching your projects...").start();

  try {
    const projects = await getProjects();
    activeSpinner.succeed("Projects fetched");

    if (!projects.length) {
      console.log(chalk.yellow("No projects found."));
      return;
    }

    const project = await select({
      message: "Which project do you want to delete file(s) from?",
      choices: projects.map((p: any) => ({ name: p.name, value: p })),
    });

    activeSpinner = ora("Fetching files...").start();
    const { files } = await getProjectFiles((project as any).slug);
    activeSpinner.succeed(`Found ${files.length} file(s)`);

    if (!files.length) {
      console.log(chalk.yellow("No files to delete in this project."));
      return;
    }

    const selected = await checkbox<any>({
      message: `Select file(s) to delete from "${(project as any).name}"`,
      choices: files.map((file: any) => ({ name: file.name, value: file })),
    });

    if (!selected.length) {
      console.log(chalk.yellow("Nothing selected."));
      return;
    }

    const confirmed = await confirm({
      message: `Delete ${selected.length} file(s) from "${(project as any).name}"? This cannot be undone.`,
      default: false,
    });

    if (!confirmed) {
      console.log(chalk.yellow("Cancelled."));
      return;
    }

    let deleted = 0;
    let failed = 0;
    let lastError = "";

    for (const file of selected) {
      try {
        await deleteProjectFile(file._id);
        deleted++;
        console.log(chalk.green(`✓ Deleted ${file.name}`));
      } catch (err: any) {
        failed++;
        lastError = err?.response?.data?.message || err?.message || "Unknown error";
        console.log(chalk.red(`✗ Failed ${file.name}: ${lastError}`));
      }
    }

    console.log();
    if (deleted === 0 && failed > 0) {
      console.log(chalk.red("Delete failed."));
    } else if (failed > 0) {
      console.log(chalk.yellow("Delete finished with some failures."));
    } else {
      console.log(chalk.green("✓ Delete complete."));
    }
    console.log(chalk.green(`Deleted: ${deleted}`));
    if (failed) {
      console.log(chalk.red(`Failed: ${failed}`));
      console.log(chalk.red(`Reason: ${lastError}`));
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
