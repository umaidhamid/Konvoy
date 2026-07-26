import chalk from "chalk";
import ora from "ora";
import checkbox from "@inquirer/checkbox";
import confirm from "@inquirer/confirm";
import fs from "fs";
import path from "path";

import { selectTargetProject } from "../services/projectLink.js";
import { listFiles } from "../services/walk.js";
import {
  getProjectFiles,
  createProjectFile,
  updateProjectFileContent,
} from "../services/project.js";

export async function addCommand() {
  const cwd = process.cwd();
  let activeSpinner: ReturnType<typeof ora> | undefined;

  try {
    const files = listFiles(cwd);
    if (!files.length) {
      console.log(chalk.yellow("No files found in this folder."));
      return;
    }

    const selected = await checkbox({
      message: "Select file(s) to upload",
      choices: files.map((relativePath) => ({
        name: relativePath,
        value: relativePath,
      })),
    });

    if (!selected.length) {
      console.log(chalk.yellow("Nothing selected."));
      return;
    }

    const project = await selectTargetProject(
      `Which project do you want to drop these ${selected.length} file(s) into?`
    );

    const proceed = await confirm({
      message: `Upload ${selected.length} file(s) to "${project.name}"?`,
      default: true,
    });
    if (!proceed) {
      console.log(chalk.yellow("Upload cancelled."));
      return;
    }

    const spinner = ora(`Checking files already on "${project.name}"...`).start();
    activeSpinner = spinner;

    const { files: remoteFiles } = await getProjectFiles(project.slug);
    const remoteByName = new Map<string, string>(
      remoteFiles.map((file: any) => [file.name, file._id])
    );
    spinner.succeed(`Found ${remoteByName.size} existing file(s) on "${project.name}"`);
    activeSpinner = undefined;

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let lastError = "";

    for (const relativePath of selected) {
      const existingId = remoteByName.get(relativePath);

      if (existingId) {
        const overwrite = await confirm({
          message: `"${relativePath}" already exists on "${project.name}". Overwrite it with your local version?`,
          default: true,
        });

        if (!overwrite) {
          console.log(chalk.yellow(`- Skipped ${relativePath}`));
          skipped++;
          continue;
        }

        try {
          const content = fs.readFileSync(path.join(cwd, relativePath), "utf8");
          await updateProjectFileContent(existingId, content);
          updated++;
          console.log(chalk.green(`✓ Updated ${relativePath}`));
        } catch (err: any) {
          failed++;
          lastError = err?.response?.data?.message || err?.message || "Unknown error";
          console.log(chalk.red(`✗ Failed ${relativePath}: ${lastError}`));
        }
        continue;
      }

      try {
        const content = fs.readFileSync(path.join(cwd, relativePath), "utf8");
        const file = await createProjectFile(project.slug, relativePath);
        await updateProjectFileContent(file._id, content);
        created++;
        console.log(chalk.green(`✓ Created ${relativePath}`));
      } catch (err: any) {
        failed++;
        lastError = err?.response?.data?.message || err?.message || "Unknown error";
        console.log(chalk.red(`✗ Failed ${relativePath}: ${lastError}`));
      }
    }

    console.log();
    if (created + updated === 0 && failed > 0) {
      console.log(chalk.red(`Upload to "${project.name}" failed.`));
    } else if (failed > 0) {
      console.log(chalk.yellow(`Upload to "${project.name}" finished with some failures.`));
    } else {
      console.log(chalk.green(`✓ Upload to "${project.name}" complete.`));
    }

    console.log(chalk.green(`Created: ${created}`));
    console.log(chalk.blue(`Updated: ${updated}`));
    if (skipped) console.log(chalk.yellow(`Skipped: ${skipped}`));
    if (failed) {
      console.log(chalk.red(`Failed: ${failed}`));
      console.log(chalk.red(`Reason: ${lastError}`));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;

    if (activeSpinner?.isSpinning) {
      activeSpinner.fail(chalk.red(message));
    } else {
      console.log();
      console.log(chalk.red(message));
    }

    process.exitCode = 1;
  }
}
