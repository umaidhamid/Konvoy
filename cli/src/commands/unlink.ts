import chalk from "chalk";

import { readLink, removeLink } from "../services/link.js";

export function unlinkCommand() {
  const cwd = process.cwd();
  const link = readLink(cwd);

  if (!link) {
    console.log(chalk.yellow("This folder isn't linked to a project."));
    return;
  }

  removeLink(cwd);

  console.log(chalk.green(`Unlinked from "${link.name}".`));
  console.log(chalk.gray("Run `konvoy init` to link a new or existing project."));
}
