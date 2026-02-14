import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import dotenv from "dotenv";

type TaskCommand = "reset" | "migrate" | "seed" | "rebuild";

const BACKEND_ROOT = path.resolve(__dirname, "..");

function resolveEnvFile(): string {
  const requestedEnv = (process.env.ROODI_ENV ?? process.env.NODE_ENV ?? "development")
    .trim()
    .toLowerCase();
  const envFileName = requestedEnv === "production" ? ".env.production" : ".env.development";
  const envPath = path.join(BACKEND_ROOT, envFileName);

  if (!fs.existsSync(envPath)) {
    throw new Error(`Arquivo de ambiente nao encontrado: ${envPath}`);
  }

  return envPath;
}

function loadEnvironment(): string {
  const envPath = resolveEnvFile();
  dotenv.config({ path: envPath, override: true });

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao definido apos carregamento do arquivo de ambiente.");
  }

  return envPath;
}

function runPrisma(args: string[]): void {
  const command = ["prisma", ...args].join(" ");
  console.info(`[db] Executando: npx ${command}`);

  const result = spawnSync("npx", ["prisma", ...args], {
    cwd: BACKEND_ROOT,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Falha ao executar: npx ${command}`);
  }
}

function executeCommand(command: TaskCommand): void {
  switch (command) {
    case "reset":
      runPrisma(["migrate", "reset", "--force", "--skip-generate", "--skip-seed"]);
      return;
    case "migrate":
      runPrisma(["migrate", "deploy"]);
      return;
    case "seed":
      runPrisma(["db", "seed"]);
      return;
    case "rebuild":
      runPrisma(["migrate", "reset", "--force", "--skip-generate", "--skip-seed"]);
      runPrisma(["migrate", "deploy"]);
      runPrisma(["db", "seed"]);
      return;
    default:
      throw new Error(`Comando de banco invalido: ${command}`);
  }
}

function parseCommand(argv: string[]): TaskCommand {
  const raw = argv[2];
  const validCommands: TaskCommand[] = ["reset", "migrate", "seed", "rebuild"];

  if (!raw || !validCommands.includes(raw as TaskCommand)) {
    throw new Error(`Uso: tsx scripts/prisma-task.ts <${validCommands.join("|")}>`);
  }

  return raw as TaskCommand;
}

function main(): void {
  const command = parseCommand(process.argv);
  const envPath = loadEnvironment();
  console.info(`[db] Ambiente carregado: ${path.basename(envPath)}`);
  executeCommand(command);
  console.info(`[db] Comando concluido com sucesso: ${command}`);
}

main();

