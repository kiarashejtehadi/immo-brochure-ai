/** Trim and normalize AI body copy before PDF layout. */
export function formatPdfBodyText(text: string): string {
  return text
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\b(\d+)-roompartment\b/gi, "$1-room apartment")
    .replace(/\b(\d+)-room([a-zA-Z])/g, "$1-room $2")
    .replace(/\broompartment\b/gi, "room apartment");
}

export function splitPdfParagraphs(text: string): string[] {
  const normalized = formatPdfBodyText(text);
  if (!normalized) return [];
  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Normalize address for PDF display (title case, not forced uppercase). */
export function formatPdfDisplayAddress(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (/^\d+[a-zA-Z]?[-/]?\d*$/.test(word)) return word;
      if (word.length <= 2 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
