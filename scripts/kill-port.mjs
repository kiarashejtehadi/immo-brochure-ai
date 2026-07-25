import { execSync } from "node:child_process";

const port = process.argv[2] || "3000";

if (process.platform !== "win32") {
  console.log("kill-port script is Windows-only; use: npx kill-port", port);
  process.exit(0);
}

try {
  const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
  const pids = new Set(
    out
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/).pop())
      .filter((pid) => pid && /^\d+$/.test(pid)),
  );
  if (pids.size === 0) {
    console.log(`No process listening on port ${port}.`);
    process.exit(0);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "pipe" });
      console.log(`Stopped PID ${pid} on port ${port}`);
    } catch {
      console.warn(`Could not stop PID ${pid}`);
    }
  }
} catch {
  console.log(`No process listening on port ${port}.`);
}
