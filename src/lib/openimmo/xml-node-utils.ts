/** Utilities for reading values from fast-xml-parser output (tags + @_ attributes). */

export function getValue(node: unknown, key: string): unknown {
  if (!node || typeof node !== "object") return undefined;
  const record = node as Record<string, unknown>;
  return (
    record[key] ??
    record[`@_${key}`] ??
    record[`@_${key.toLowerCase()}`] ??
    record[`@_${key.toUpperCase()}`] ??
    record[key.toLowerCase()] ??
    record[key.toUpperCase()]
  );
}

export function isTrueAttribute(node: unknown, key: string): boolean {
  const val = getValue(node, key);
  return val === true || val === "true" || val === 1 || val === "1";
}

/** True when a child tag exists or a boolean-ish attribute is set (OpenImmo flags). */
export function isPresentFlag(node: unknown, key: string): boolean {
  if (isTrueAttribute(node, key)) return true;
  const val = getValue(node, key);
  if (val === undefined || val === false || val === "false" || val === 0 || val === "0") {
    return false;
  }
  if (val === "" || val === true) return true;
  if (val && typeof val === "object") return true;
  return Boolean(textValue(val));
}

export function textValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (typeof value === "object" && value !== null && "#text" in value) {
    return textValue((value as { "#text": unknown })["#text"]);
  }
  return "";
}

export function getText(node: unknown, key: string): string {
  return textValue(getValue(node, key));
}

export function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return "";
}

export function firstTextFromNode(node: unknown, ...keys: string[]): string {
  for (const key of keys) {
    const text = getText(node, key);
    if (text) return text;
  }
  return "";
}

export function pickNode(root: unknown, ...paths: string[]): unknown {
  let current: unknown = root;
  for (const segment of paths) {
    current = getValue(current, segment);
    if (current === undefined) return undefined;
  }
  return current;
}

export function getChildNode(node: unknown, ...keys: string[]): Record<string, unknown> | undefined {
  for (const key of keys) {
    const value = getValue(node, key);
    if (value && typeof value === "object") {
      return value as Record<string, unknown>;
    }
  }
  return undefined;
}

const DEEP_FIND_SKIP_KEYS = new Set([
  "anhaenge",
  "anhang",
  "bild",
  "bilder",
  "video",
  "link",
  "links",
  "daten",
  "datei",
]);

/** Walk the subtree and return the first non-empty text for any of the given tag names. */
export function deepFindText(node: unknown, keys: readonly string[], maxDepth = 10): string {
  if (maxDepth <= 0 || node == null || typeof node !== "object") return "";

  const record = node as Record<string, unknown>;
  for (const key of keys) {
    const text = getText(record, key);
    if (text) return text;
  }

  for (const [childKey, value] of Object.entries(record)) {
    if (childKey.startsWith("@_") || childKey === "#text") continue;
    if (DEEP_FIND_SKIP_KEYS.has(childKey.toLowerCase())) continue;

    const children = Array.isArray(value) ? value : [value];
    for (const child of children) {
      if (child == null || typeof child !== "object") continue;
      const found = deepFindText(child, keys, maxDepth - 1);
      if (found) return found;
    }
  }

  return "";
}
