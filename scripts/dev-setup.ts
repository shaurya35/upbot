import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { connect } from "node:net";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const ENV_PATH = join(ROOT, ".env");
const EXAMPLE_PATH = join(ROOT, ".env.example");

const log = (message: string) => console.log(`\x1b[32m[setup]\x1b[0m ${message}`);
const fail = (message: string): never => {
  console.error(`\x1b[31m[setup]\x1b[0m ${message}`);
  process.exit(1);
};

function ensureEnvFile() {
  if (!existsSync(ENV_PATH)) {
    writeFileSync(ENV_PATH, readFileSync(EXAMPLE_PATH, "utf8"));
    log("Created .env from .env.example");
  }

  let contents = readFileSync(ENV_PATH, "utf8");
  const missing = readFileSync(EXAMPLE_PATH, "utf8")
    .split("\n")
    .filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
    .filter((line) => !new RegExp(`^${line.split("=")[0]}=`, "m").test(contents));
  if (missing.length) {
    contents = `${contents.trimEnd()}\n${missing.join("\n")}\n`;
    log(`Added ${missing.map((line) => line.split("=")[0]).join(", ")} to .env`);
  }
  for (const key of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) {
    const pattern = new RegExp(`^${key}=\\s*$`, "m");
    if (pattern.test(contents)) {
      contents = contents.replace(pattern, `${key}=${randomBytes(32).toString("hex")}`);
      log(`Generated ${key}`);
    }
  }
  writeFileSync(ENV_PATH, contents);
}

function loadEnv() {
  const env: Record<string, string> = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const isReachable = (url: string, defaultPort: number) =>
  new Promise<boolean>((resolve) => {
    const { hostname, port } = new URL(url);
    const socket = connect({ host: hostname, port: Number(port) || defaultPort });
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });

async function run(cmd: string[], options: { cwd?: string; env?: Record<string, string>; quiet?: boolean } = {}) {
  const proc = Bun.spawn(cmd, {
    cwd: options.cwd ?? ROOT,
    env: { ...process.env, ...options.env },
    stdout: options.quiet ? "pipe" : "inherit",
    stderr: options.quiet ? "pipe" : "inherit",
  });
  const exitCode = await proc.exited;
  const output = options.quiet ? (await new Response(proc.stdout).text()) + (await new Response(proc.stderr).text()) : "";
  return { exitCode, output };
}

async function ensureServices(env: Record<string, string>) {
  const [postgresUp, redisUp] = await Promise.all([
    isReachable(env.DATABASE_URL, 5432),
    isReachable(env.REDIS_URL, 6379),
  ]);
  if (postgresUp && redisUp) {
    log("Postgres and Redis are already running");
    return;
  }

  const docker = await run(["docker", "info"], { quiet: true }).catch(() => ({ exitCode: 1, output: "" }));
  if (docker.exitCode !== 0) {
    fail(
      `${[!postgresUp && "Postgres", !redisUp && "Redis"].filter(Boolean).join(" and ")} not reachable and Docker isn't running.\n` +
        "        Start Docker Desktop (or run your own Postgres/Redis and set DATABASE_URL/REDIS_URL in .env), then re-run `bun run dev`."
    );
  }

  log("Starting Postgres and Redis with docker compose...");
  const services = [!postgresUp && "postgres", !redisUp && "redis"].filter(Boolean) as string[];
  const { exitCode } = await run(["docker", "compose", "up", "-d", "--wait", ...services]);
  if (exitCode !== 0) fail("docker compose failed. Check the output above.");
}

async function ensureDatabase(env: Record<string, string>) {
  const store = join(ROOT, "packages/store");

  log("Generating Prisma client");
  if ((await run(["bunx", "prisma", "generate"], { cwd: store, env, quiet: true })).exitCode !== 0) {
    fail("prisma generate failed");
  }

  log("Syncing database schema");
  const push = await run(["bunx", "prisma", "db", "push", "--skip-generate"], { cwd: store, env, quiet: true });
  if (push.exitCode !== 0) {
    console.error(push.output);
    fail(
      "prisma db push failed. If it reports data loss, review the change, then run:\n" +
        "        bun --env-file=.env --cwd packages/store x prisma db push --accept-data-loss"
    );
  }

  if ((await run(["bun", "seed.ts"], { cwd: store, env, quiet: true })).exitCode !== 0) {
    fail("Region seed failed");
  }

  const web = join(ROOT, "apps/web");
  const webEnv = { ...env, DATABASE_URL: env.WEB_DATABASE_URL || env.DATABASE_URL };
  if ((await run(["bunx", "prisma", "generate"], { cwd: web, env: webEnv, quiet: true })).exitCode !== 0) {
    fail("prisma generate failed for apps/web");
  }
  const webPush = await run(["bunx", "prisma", "db", "push", "--skip-generate"], { cwd: web, env: webEnv, quiet: true });
  if (webPush.exitCode !== 0) {
    console.error(webPush.output);
    fail("prisma db push failed for the landing page database (WEB_DATABASE_URL)");
  }
  log("Database ready");
}

async function portOwner(port: number) {
  const { output } = await run(["lsof", "-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fpc"], { quiet: true });
  const pid = output.match(/^p(\d+)/m)?.[1];
  const command = output.match(/^c(.+)$/m)?.[1];
  return pid ? `${command ?? "unknown"} (pid ${pid})` : null;
}

async function ensurePortsFree(env: Record<string, string>) {
  const ports = [
    { port: 3000, name: "dashboard" },
    { port: 3001, name: "landing page" },
    { port: Number(env.PORT) || 8080, name: "API" },
    { port: 8787, name: "checker" },
  ];
  const busy: string[] = [];
  for (const { port, name } of ports) {
    if (await isReachable(`tcp://localhost:${port}`, port)) {
      busy.push(`  :${port} (${name}) is used by ${(await portOwner(port)) ?? "another process"}`);
    }
  }
  if (busy.length) {
    fail(`Ports needed by Upbot are already in use:\n${busy.join("\n")}\n        Stop those processes (e.g. a previous \`bun dev\`) and run it again.`);
  }
}

ensureEnvFile();
const env = loadEnv();
await ensurePortsFree(env);
await ensureServices(env);
await ensureDatabase(env);
log("Starting dashboard :3000, landing page :3001, API :8080, checker :8787, pusher and worker");
