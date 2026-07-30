import type { KeyboardEvent } from "react";

/** Strip non-numeric characters for dimension and money fields. */
export function sanitizeNumericInput(value: string, allowDecimal = true): string {
  const next = value.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
  if (!allowDecimal) return next;
  const parts = next.split(".");
  if (parts.length <= 1) return next;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

/** Block letter keys on numeric inputs (still allows navigation/editing keys). */
export function blockNonNumericKey(e: KeyboardEvent<HTMLInputElement>, allowDecimal = true) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const allowed = new Set([
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ]);
  if (allowed.has(e.key)) return;
  if (allowDecimal && e.key === ".") return;
  if (/^\d$/.test(e.key)) return;
  e.preventDefault();
}
