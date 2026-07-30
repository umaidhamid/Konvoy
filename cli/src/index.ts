#!/usr/bin/env node

import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { projectsCommand } from "./commands/projects.js";
import { initCommand } from "./commands/init.js";
import { pushCommand } from "./commands/push.js";
import { statusCommand } from "./commands/status.js";
import { addCommand } from "./commands/add.js";
import { shareCommand } from "./commands/share.js";
import { leaveCommand } from "./commands/leave.js";
import { deleteProjectCommand } from "./commands/delete-project.js";
import { deleteFileCommand } from "./commands/delete-file.js";
const program = new Command();

program
  .name("konvoy")
  .description("Konvoy CLI")
  .version("1.0.0");

program
  .command("login")
  .description("Login to Konvoy")
  .action(loginCommand);
program
  .command("pull")
  .description("List your projects")
  .action(projectsCommand);
program
  .command("init")
  .description("Create a new project")
  .action(initCommand);
program
  .command("push")
  .description("Push all local files in the current folder to a project you choose")
  .action(pushCommand);
program
  .command("status")
  .description("Show whether you're online and logged in")
  .action(statusCommand);
program
  .command("add")
  .description("Pick specific file(s) to upload to a project you choose")
  .action(addCommand);
program
  .command("share")
  .description("Invite a teammate (by email) to a project you own")
  .action(shareCommand);
program
  .command("leave")
  .description("Leave a project you're a member of (removes your access, doesn't delete the project)")
  .action(leaveCommand);
program
  .command("delete-project")
  .description("Permanently delete a project you own")
  .action(deleteProjectCommand);
program
  .command("delete-file")
  .description("Permanently delete file(s) from a project")
  .action(deleteFileCommand);
program.parse();
