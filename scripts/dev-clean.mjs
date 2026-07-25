import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

await import("./clean-next.mjs");

console.log("Waiting for filesystem locks to release…");
await sleep(1200);

const nextBin = path.join(
  root,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

/** Turbopack avoids multi-minute webpack middleware compiles on OneDrive/Windows. */
const devArgs = ["dev", "--turbopack", "-H", "localhost", "-p", "3000"];

const child = spawn(process.execPath, [nextBin, ...devArgs], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
