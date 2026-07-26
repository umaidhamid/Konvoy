import chalk from "chalk";

import { readLink } from "../services/link.js";
import { getLiveAccess } from "../services/projectLink.js";

export async function statusCommand() {
  const cwd = process.cwd();
  const link = readLink(cwd);

  if (!link) {
    console.log(chalk.yellow("This folder isn't linked to a project yet. Run `konvoy init` first."));
    return;
  }

  console.log(chalk.green(`Linked project: ${link.name}`));
  console.log(chalk.gray(`Slug: ${link.slug}`));
  console.log(chalk.gray(`Folder: ${cwd}`));

  const access = await getLiveAccess(link.projectId).catch(() => null);
  if (access) {
    console.log(chalk.gray(`Your access: ${access.role === "owner" ? "Owner" : "✓ You have access"}`));
    if (access.fileCount !== undefined) {
      console.log(chalk.gray(`Restricted to ${access.fileCount} file(s), not the whole project.`));
    }
  } else {
    console.log(chalk.yellow("Could not verify current access (offline, or access may have been removed)."));
  }
}
