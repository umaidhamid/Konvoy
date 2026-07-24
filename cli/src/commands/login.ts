import chalk from "chalk";
import ora from "ora";

import { loginPrompt } from "../prompts/login.js";
import { login } from "../services/auth.js";

export async function loginCommand() {
  try {
    const credentials = await loginPrompt();

    const spinner = ora("Logging in...").start();

    const user = await login(
      credentials.domain,
      credentials.email,
      credentials.password
    );

    spinner.succeed("Logged in successfully");

    console.log();
    console.log(chalk.green(`Welcome ${user.fullname}`));
    console.log(chalk.gray(user.email));
  } catch (error: any) {
    console.log();

    if (error.response?.data?.message) {
      console.log(chalk.red(error.response.data.message));
    } else {
      console.log(chalk.red(error.message));
    }
  }
}