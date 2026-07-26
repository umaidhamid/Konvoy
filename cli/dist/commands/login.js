import chalk from "chalk";
import ora from "ora";
import { loginPrompt } from "../prompts/login.js";
import { login } from "../services/auth.js";
export async function loginCommand() {
    const credentials = await loginPrompt();
    const spinner = ora("Logging in...").start();
    try {
        const user = await login(credentials.domain, credentials.email, credentials.password);
        spinner.succeed("Logged in successfully");
        console.log();
        console.log(chalk.green(`Welcome ${user.fullname}`));
        console.log(chalk.gray(user.email));
    }
    catch (error) {
        const message = error.response?.data?.message || error.message;
        spinner.fail(chalk.red(message));
        process.exitCode = 1;
    }
}
//# sourceMappingURL=login.js.map