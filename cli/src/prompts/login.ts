import { input, password } from "@inquirer/prompts";

export async function loginPrompt() {
  const domain = await input({
    message: "API Domain",
    default: "http://localhost:5000/api/v1",
  });

  const email = await input({
    message: "Email",
  });

  const pass = await input({
    message: "Password",
  });

  return {
    domain,
    email,
    password: pass,
  };
}