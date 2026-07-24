import { rmSync } from "node:fs";

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("Removed .next cache");
} catch (error) {
  console.warn("Could not remove .next:", error);
}
