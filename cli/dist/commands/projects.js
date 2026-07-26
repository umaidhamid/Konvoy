import chalk from "chalk";
import ora from "ora";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";
import path from "path";
import config from "../services/config.js";
import { getProjects, getProjectFiles, getProjectFileContent, } from "../services/project.js";
import { getUniqueFilePath, writeFileEnsuringDir } from "../services/fsutil.js";
export async function projectsCommand() {
    let activeSpinner = ora("Fetching projects...").start();
    try {
        const projects = await getProjects();
        activeSpinner.succeed("Projects fetched");
        if (!projects.length) {
            console.log(chalk.yellow("No projects found."));
            return;
        }
        const selectedProject = await select({
            message: "Select a project",
            choices: projects.map((project) => ({
                name: project.name,
                value: project,
            })),
        });
        config.set("projectId", selectedProject._id);
        config.set("projectName", selectedProject.name);
        activeSpinner = ora("Connecting project...").start();
        const project = await getProjectFiles(selectedProject.slug);
        activeSpinner.succeed("Project selected");
        if (project.project.myRole) {
            console.log(chalk.gray(`Your access: ${project.project.myRole === "owner" ? "Owner" : "✓ You have access"}`));
            if (project.project.myFileIds) {
                console.log(chalk.gray(`Restricted to ${project.project.myFileIds.length} file(s) — showing only what you have access to.`));
            }
        }
        if (!project.files.length) {
            console.log(chalk.yellow("No files found in this project (or none you have access to)."));
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
            activeSpinner = ora("Writing files...").start();
            for (const file of project.files) {
                const fileContent = await getProjectFileContent(file._id);
                const uniqueName = getUniqueFilePath(cwd, fileContent.name);
                writeFileEnsuringDir(path.join(cwd, uniqueName), fileContent.content ?? "");
            }
            activeSpinner.succeed(`Wrote ${project.files.length} file(s)`);
            console.log();
            console.log(chalk.green(`Project: ${project.project.name}`));
            console.log(chalk.gray(cwd));
            return;
        }
        const selectedFile = await select({
            message: "Select a file",
            choices: project.files.map((file) => ({
                name: file.name,
                value: file,
            })),
        });
        const uniqueName = getUniqueFilePath(cwd, selectedFile.name);
        const filePath = path.join(cwd, uniqueName);
        const shouldCreate = await confirm({
            message: `Create file "${uniqueName}" at ${filePath}?`,
        });
        if (!shouldCreate) {
            console.log(chalk.yellow("Cancelled."));
            return;
        }
        activeSpinner = ora("Writing file...").start();
        const fileContent = await getProjectFileContent(selectedFile._id);
        writeFileEnsuringDir(filePath, fileContent.content ?? "");
        activeSpinner.succeed("File created");
        console.log();
        console.log(chalk.green(`File: ${uniqueName}`));
        console.log(chalk.gray(filePath));
    }
    catch (error) {
        const message = error.response?.data?.message || error.message;
        if (activeSpinner.isSpinning) {
            activeSpinner.fail(chalk.red(message));
        }
        else {
            console.log();
            console.log(chalk.red(message));
        }
        process.exitCode = 1;
    }
}
//# sourceMappingURL=projects.js.map