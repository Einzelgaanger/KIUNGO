import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL?.startsWith("file:")
  ? process.env.DATABASE_URL
  : "file:./dev.db";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: node scripts/with-sqlite.mjs <command> [...args]");
  process.exit(1);
}

const result = spawnSync(args[0], args.slice(1), {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
  shell: true,
});

process.exit(result.status ?? 1);
