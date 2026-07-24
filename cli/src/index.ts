#!/usr/bin/env node

import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { projectsCommand } from "./commands/projects.js";
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
  .command("projects")
  .description("List your projects")
  .action(projectsCommand);
program.parse(); 