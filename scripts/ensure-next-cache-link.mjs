import { execSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cwd = process.cwd();

function isOneDriveProject() {
  return process.platform === "win32" && /OneDrive/i.test(cwd);
}

function cacheTarget() {
  return path.join(os.tmpdir(), "immo-brochure-ai-next");
}

function nextLinkPath() {
  return path.join(cwd, ".next");
}

function isNextCacheLink(p) {
  if (!existsSync(p)) return false;
  try {
    if (lstatSync(p).isSymbolicLink()) return true;
  } catch {
    return false;
  }
  if (process.platform === "win32") {
    try {
      execSync(`fsutil reparsepoint query "${p}"`, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function ensureNextCacheLink() {
  if (!isOneDriveProject()) {
    return { linked: false, path: nextLinkPath() };
  }

  const link = nextLinkPath();
  const target = cacheTarget();
  mkdirSync(target, { recursive: true });

  if (existsSync(link)) {
    if (isNextCacheLink(link)) {
      return { linked: true, path: link, target };
    }
    console.warn(
      "[dev] .next exists as a normal folder on OneDrive (may cause EBUSY). Run: npm run dev:clean",
    );
    return { linked: false, path: link };
  }

  try {
    execSync(`cmd /c mklink /J "${link}" "${target}"`, { stdio: "pipe" });
    console.log(`[dev] Linked .next → ${target}`);
    return { linked: true, path: link, target };
  } catch (error) {
    console.warn(
      "[dev] Could not create .next junction (run terminal as user, not elevated mismatch):",
      error,
    );
    return { linked: false, path: link };
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensureNextCacheLink();
}
