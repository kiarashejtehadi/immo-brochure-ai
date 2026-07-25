import { existsSync, lstatSync, rmSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";

const cwd = process.cwd();
const nextDir = path.join(cwd, ".next");

function removeNextDirOnce() {
  const stat = lstatSync(nextDir);
  // OneDrive folders can be reparse points; always use recursive delete for directories.
  if (stat.isSymbolicLink() && !stat.isDirectory()) {
    rmSync(nextDir, { force: true });
    return;
  }
  rmSync(nextDir, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 500,
  });
}

async function removeNextDir() {
  if (!existsSync(nextDir)) return;

  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      removeNextDirOnce();
      console.log(`Removed ${nextDir}`);
      return;
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error ? error.code : "";
      if (attempt >= 5) {
        console.warn(`Could not remove ${nextDir} (${code}):`, error);
        console.warn(
          "Tip: stop dev servers (Ctrl+C), pause OneDrive, then retry.",
        );
        return;
      }
      await sleep(500 * (attempt + 1));
    }
  }
}

await removeNextDir();

const legacyTemp = path.join(
  process.env.TEMP || process.env.TMP || "",
  "immo-brochure-ai-next",
);
if (legacyTemp && existsSync(legacyTemp)) {
  try {
    rmSync(legacyTemp, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    console.log(`Removed legacy temp cache ${legacyTemp}`);
  } catch {
    console.warn(`Could not remove legacy temp cache ${legacyTemp}`);
  }
}
