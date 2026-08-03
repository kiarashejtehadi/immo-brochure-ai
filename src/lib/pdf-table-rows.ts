export type PdfTableRow = { label: string; value: string };

const EMPTY_PDF_VALUES = new Set([
  "",
  "—",
  "-",
  "na",
  "n/a",
  "not applicable",
  "not specified",
]);

/** True when a PDF table cell should be omitted (null, blank, em dash, N/A, etc.). */
export function isPdfTableValueEmpty(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return true;
  return EMPTY_PDF_VALUES.has(normalized);
}

/** OCR / serialized metadata that must not appear in PDF tables. */
export function isLikelyRawPdfMetadata(value: string | null | undefined): boolean {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return true;
  if (/^\[[\s\S]*\]$/.test(trimmed)) return true;
  if (/^\{[\s\S]*\}$/.test(trimmed)) return true;
  if (/^(object|array|\[object)/i.test(trimmed)) return true;
  if (/^"[a-zA-Z0-9]{2,12}"(,\s*"[a-zA-Z0-9]{2,12}")+$/i.test(trimmed)) return true;
  if (trimmed.length > 160) return true;
  return false;
}

export function filterPdfTableRows(rows: PdfTableRow[]): PdfTableRow[] {
  return rows.filter(
    (row) =>
      !isPdfTableValueEmpty(row.value) &&
      !isLikelyRawPdfMetadata(row.value) &&
      !isLikelyRawPdfMetadata(row.label),
  );
}
