import chalk from "chalk";
import ora from "ora";
import confirm from "@inquirer/confirm";

import { selectTargetProject } from "../services/projectLink.js";
import { walkFiles } from "../services/walk.js";
import {
  getProjectFiles,
  createProjectFile,
  updateProjectFileContent,
} from "../services/project.js";

export async function pushCommand() {
  const cwd = process.cwd();

  try {
    const localFiles = walkFiles(cwd);

    if (!localFiles.length) {
      console.log(chalk.yellow("No files found to push."));
      return;
    }

    const project = await selectTargetProject(
      `Which project do you want to push these ${localFiles.length} file(s) to?`
    );

    const proceed = await confirm({
      message: `Push ${localFiles.length} file(s) to "${project.name}"?`,
      default: true,
    });
    if (!proceed) {
      console.log(chalk.yellow("Push cancelled."));
      return;
    }

    const spinner = ora(`Checking files already on "${project.name}"...`).start();

    let remoteByName: Map<string, string>;
    try {
      const { files: remoteFiles } = await getProjectFiles(project.slug);
      remoteByName = new Map(remoteFiles.map((file: any) => [file.name, file._id]));
      spinner.succeed(`Found ${remoteByName.size} existing file(s) on "${project.name}"`);
    } catch (error: any) {
      spinner.fail("Push failed");
      console.log(chalk.red(error.response?.data?.message || error.message));
      return;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let lastError = "";

    for (const file of localFiles) {
      const existingId = remoteByName.get(file.relativePath);

      if (existingId) {
        const overwrite = await confirm({
          message: `"${file.relativePath}" already exists on "${project.name}". Overwrite it with your local version?`,
          default: true,
        });

        if (!overwrite) {
          console.log(chalk.yellow(`- Skipped ${file.relativePath}`));
          skipped++;
          continue;
        }

        try {
          await updateProjectFileContent(existingId, file.content);
          updated++;
          console.log(chalk.green(`✓ Updated ${file.relativePath}`));
        } catch (err: any) {
          failed++;
          lastError = err?.response?.data?.message || err?.message || "Unknown error";
          console.log(chalk.red(`✗ Failed ${file.relativePath}: ${lastError}`));
        }
        continue;
      }

      try {
        const created_ = await createProjectFile(project.slug, file.relativePath);
        await updateProjectFileContent(created_._id, file.content);
        created++;
        console.log(chalk.green(`✓ Created ${file.relativePath}`));
      } catch (err: any) {
        failed++;
        lastError = err?.response?.data?.message || err?.message || "Unknown error";
        console.log(chalk.red(`✗ Failed ${file.relativePath}: ${lastError}`));
      }
    }

    console.log();
    if (created + updated === 0 && failed > 0) {
      console.log(chalk.red(`Push to "${project.name}" failed.`));
    } else if (failed > 0) {
      console.log(chalk.yellow(`Push to "${project.name}" finished with some failures.`));
    } else {
      console.log(chalk.green(`✓ Push to "${project.name}" complete.`));
    }

    console.log(chalk.green(`Created: ${created}`));
    console.log(chalk.blue(`Updated: ${updated}`));
    if (skipped) console.log(chalk.yellow(`Skipped: ${skipped}`));
    if (failed) {
      console.log(chalk.red(`Failed: ${failed}`));
      console.log(chalk.red(`Reason: ${lastError}`));
    }
  } catch (error: any) {
    console.log(chalk.red(error.response?.data?.message || error.message));
    process.exitCode = 1;
  }
}
