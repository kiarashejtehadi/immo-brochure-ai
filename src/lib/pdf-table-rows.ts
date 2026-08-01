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

export function filterPdfTableRows(rows: PdfTableRow[]): PdfTableRow[] {
  return rows.filter((row) => !isPdfTableValueEmpty(row.value));
}
