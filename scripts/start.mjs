import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.env.DATABASE_URL = "file:./dev.db";

const dbPath = join(root, "prisma", "dev.db");

function run(cmd) {
  const result = spawnSync(cmd, {
    stdio: "inherit",
    shell: true,
    env: process.env,
    cwd: root,
  });
  if (result.status) process.exit(result.status ?? 1);
}

const missing = !existsSync(dbPath);
const empty = !missing && statSync(dbPath).size < 1024;
if (missing || empty) {
  console.log("SQLite demo database missing — applying migrations and seed.");
  run("npx prisma migrate deploy");
  run("npx prisma db seed");
}

run("npx next start");
