#!/usr/bin/env node
import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
const program = new Command();
program
    .name("konvoy")
    .description("Konvoy CLI")
    .version("1.0.0");
program
    .command("login")
    .description("Login to Konvoy")
    .action(loginCommand);
program.parse();
//# sourceMappingURL=index.js.map