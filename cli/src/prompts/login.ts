import { input, password } from "@inquirer/prompts";

export async function loginPrompt() {
  // const defaultDomain = "https://konvoy-backend.onrender.com/api/v1";
  const defaultDomain = " http://localhost:5000/api/v1";
  // const domain = await input({
  //   message: "API Domain",
  //   default: defaultDomain,
  // });

  const email = await input({
    message: "Email",
  });

  const pass = await password({
    message: "Password",
    mask: "*",
  });

  return {
    domain: defaultDomain,
    email,
    password: pass,
  };
}