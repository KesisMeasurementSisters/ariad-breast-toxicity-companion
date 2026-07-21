import { existsSync, renameSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const allowedCommands = new Set(["build", "preview", "deploy"]);
const command = process.argv[2];

if (!allowedCommands.has(command)) {
  throw new Error("Expected one of: build, preview, deploy");
}

const repositoryRoot = process.cwd();
const localEnvPath = path.join(repositoryRoot, ".env.local");
const heldEnvPath = path.join(repositoryRoot, ".env.local.cloudflare-held");

if (existsSync(heldEnvPath)) {
  if (existsSync(localEnvPath)) {
    throw new Error("Both the local env file and its Cloudflare hold file exist");
  }
  renameSync(heldEnvPath, localEnvPath);
}

let envHeld = false;

function restoreLocalEnv() {
  if (envHeld && existsSync(heldEnvPath)) {
    renameSync(heldEnvPath, localEnvPath);
    envHeld = false;
  }
}

try {
  if (existsSync(localEnvPath)) {
    renameSync(localEnvPath, heldEnvPath);
    envHeld = true;
  }

  const childEnvironment = {
    ...process.env,
    NEXT_PUBLIC_DEMO_MODE: "true",
    NEXT_PUBLIC_ENABLE_TREATMENT_SAVING: "false",
  };
  delete childEnvironment.OPENAI_API_KEY;

  const child = spawn(
    "pnpm",
    ["--filter", "@ariad/web", `cloudflare:${command}`],
    {
      cwd: repositoryRoot,
      env: childEnvironment,
      stdio: "inherit",
    },
  );

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) reject(new Error(`Cloudflare command ended with ${signal}`));
      else resolve(code ?? 1);
    });
  });

  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  restoreLocalEnv();
}
