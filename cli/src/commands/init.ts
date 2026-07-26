import chalk from "chalk";

import { readLink } from "../services/link.js";
import { ensureProjectLink } from "../services/projectLink.js";

export async function initCommand() {
  const cwd = process.cwd();

  const existingLink = readLink(cwd);
  if (existingLink) {
    console.log(chalk.yellow(`This folder is already linked to "${existingLink.name}".`));
    return;
  }

  try {
    const link = await ensureProjectLink(cwd);
    console.log(chalk.green(`Linked ${cwd} -> ${link.name}`));
  } catch (error: any) {
    console.log();

    if (error.response?.data?.message) {
      console.log(chalk.red(error.response.data.message));
    } else {
      console.log(chalk.red(error.message));
    }

    process.exitCode = 1;
  }
}
