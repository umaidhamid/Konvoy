import chalk from "chalk";
import ora from "ora";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";
import fs from "fs";
import path from "path";
import config from "../services/config.js";
import {
  getProjects,
  getProjectFiles,
  getProjectFileContent,
} from "../services/project.js";

export async function projectsCommand() {
  const spinner = ora("Fetching projects...").start();

  try {
    const projects = await getProjects();

    spinner.succeed("Projects fetched");

    if (!projects.length) {
      console.log(chalk.yellow("No projects found."));
      return;
    }

    const selectedProject = await select({
      message: "Select a project",
      choices: projects.map((project: any) => ({
        name: project.name,
        value: project,
      })),
    });

    config.set("projectId", (selectedProject as any)._id);
    config.set("projectName", (selectedProject as any).name);

    const connectSpinner = ora("Connecting project...").start();

    const project = await getProjectFiles((selectedProject as any).slug);

    connectSpinner.succeed("Project selected");

    if (!project.files.length) {
      console.log(chalk.yellow("No files found in this project."));
      return;
    }

    const mode = await select({
      message: "What do you want to create?",
      choices: [
        { name: "Entire project", value: "project" },
        { name: "A particular file", value: "file" },
      ],
    });

    const cwd = process.cwd();

    if (mode === "project") {
      const shouldCreate = await confirm({
        message: `Create all ${project.files.length} file(s) at ${cwd}?`,
      });

      if (!shouldCreate) {
        console.log(chalk.yellow("Cancelled."));
        return;
      }

      const writeSpinner = ora("Writing files...").start();

      for (const file of project.files) {
        const fileContent = await getProjectFileContent(file._id);
        fs.writeFileSync(path.join(cwd, fileContent.name), fileContent.content ?? "");
      }

      writeSpinner.succeed(`Wrote ${project.files.length} file(s)`);

      console.log();
      console.log(chalk.green(`Project: ${project.project.name}`));
      console.log(chalk.gray(cwd));
      return;
    }

    const selectedFile = await select({
      message: "Select a file",
      choices: project.files.map((file: any) => ({
        name: file.name,
        value: file,
      })),
    });

    const filePath = path.join(cwd, (selectedFile as any).name);

    const shouldCreate = await confirm({
      message: `Create file "${(selectedFile as any).name}" at ${filePath}?`,
    });

    if (!shouldCreate) {
      console.log(chalk.yellow("Cancelled."));
      return;
    }

    const writeSpinner = ora("Writing file...").start();

    const fileContent = await getProjectFileContent((selectedFile as any)._id);
    fs.writeFileSync(filePath, fileContent.content ?? "");

    writeSpinner.succeed("File created");

    console.log();
    console.log(chalk.green(`File: ${fileContent.name}`));
    console.log(chalk.gray(filePath));
  } catch (error: any) {
    console.log();

    if (error.response?.data?.message) {
      console.log(chalk.red(error.response.data.message));
    } else {
      console.log(chalk.red(error.message));
    }
  }
}