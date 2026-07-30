import chalk from "chalk";

import config from "../services/config.js";
import { whoAmI } from "../services/auth.js";

export async function statusCommand() {
  const domain = config.get("domain") as string | undefined;
  const accessToken = config.get("accessToken") as string | undefined;

  if (!domain || !accessToken) {
    console.log(chalk.yellow("Not logged in. Run `konvoy login` first."));
    return;
  }

  console.log(chalk.gray(`Domain: ${domain}`));

  try {
    const user = await whoAmI();
    console.log(chalk.green("✓ Online"));
    console.log(chalk.green(`✓ Logged in as ${user.email}`));
    console.log(chalk.green("✓ Access token valid"));
  } catch (error: any) {
    if (!error.response) {
      console.log(chalk.red(`✗ Offline — could not reach ${domain}`));
      return;
    }

    if (error.response.status === 401) {
      console.log(chalk.red("✗ Access token expired or invalid. Run `konvoy login` again."));
      return;
    }

    console.log(chalk.red(error.response?.data?.message || error.message));
  }
}
