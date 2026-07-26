import chalk from "chalk";
import ora from "ora";
import select from "@inquirer/select";
import checkbox from "@inquirer/checkbox";
import { input } from "@inquirer/prompts";

import { getProjects, getProjectFiles, addProjectMember } from "../services/project.js";

export async function shareCommand() {
  let activeSpinner = ora("Fetching your projects...").start();

  try {
    const projects = await getProjects();
    const ownedProjects = projects.filter((p: any) => p.myRole === "owner");

    activeSpinner.succeed("Projects fetched");

    if (!ownedProjects.length) {
      console.log(chalk.yellow("You don't own any projects to share. Only the owner can invite members."));
      return;
    }

    const selectedProject = await select({
      message: "Which project do you want to share?",
      choices: ownedProjects.map((p: any) => ({ name: p.name, value: p })),
    });

    activeSpinner = ora("Fetching project files...").start();
    const { files } = await getProjectFiles((selectedProject as any).slug);
    activeSpinner.succeed(`Found ${files.length} file(s)`);

    let fileIds: string[] | undefined;

    if (files.length) {
      const scope = await select({
        message: "Grant access to",
        choices: [
          { name: "All files in the project", value: "all" },
          { name: "Specific file(s) only", value: "specific" },
        ],
      });

      if (scope === "specific") {
        const selectedFiles = await checkbox<string>({
          message: "Select file(s) to grant access to",
          choices: files.map((file: any) => ({ name: file.name, value: file._id as string })),
        });

        if (!selectedFiles.length) {
          console.log(chalk.yellow("No files selected. Cancelled."));
          return;
        }

        fileIds = selectedFiles;
      }
    }

    const email = await input({ message: `Invite to "${(selectedProject as any).name}" (email)` });

    activeSpinner = ora("Adding member...").start();

    const scopeLabel = fileIds ? `${fileIds.length} file(s)` : "all files";
    await addProjectMember((selectedProject as any)._id, email, fileIds);
    activeSpinner.succeed(`${email} now has access to "${(selectedProject as any).name}" (${scopeLabel})`);
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
