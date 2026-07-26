#!/usr/bin/env node
import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { projectsCommand } from "./commands/projects.js";
import { initCommand } from "./commands/init.js";
import { pushCommand } from "./commands/push.js";
import { statusCommand } from "./commands/status.js";
import { addCommand } from "./commands/add.js";
import { unlinkCommand } from "./commands/unlink.js";
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
    .description("Create or link a project in the current folder")
    .action(initCommand);
program
    .command("push")
    .description("Push all local files in the current folder to a project you choose")
    .action(pushCommand);
program
    .command("status")
    .description("Show which project the current folder is linked to")
    .action(statusCommand);
program
    .command("add")
    .description("Pick specific file(s) to upload to a project you choose")
    .action(addCommand);
program
    .command("unlink")
    .description("Unlink the current folder from its project")
    .action(unlinkCommand);
program
    .command("share")
    .description("Invite a teammate (by email) to the linked project")
    .action(shareCommand);
program
    .command("leave")
    .description("Leave the linked project (removes your access, doesn't delete the project)")
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
//# sourceMappingURL=index.js.map