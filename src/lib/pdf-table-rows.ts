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
  if (isBlueprintOcrToken(trimmed)) return true;
  return false;
}

/** Blueprint / floor-plan OCR noise (e.g. HUQ, Haus 2, Wfinemheit). */
export function isBlueprintOcrToken(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^wfinemheit$/i.test(trimmed)) return true;
  if (/^huq$/i.test(trimmed)) return true;
  if (/^haus\s*\d+$/i.test(trimmed)) return true;
  if (/^[A-Z]{2,4}$/.test(trimmed) && !/^(NA|HOA)$/i.test(trimmed)) return true;
  if (/^[A-Za-z]{1,3}\s*\d{1,2}$/.test(trimmed) && trimmed.length <= 10) return true;
  if (/^[0-9]{1,2}\s*[A-Za-z]{1,4}$/.test(trimmed) && trimmed.length <= 8) return true;
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

/** Page 4 listing details — property fields only, no blueprint OCR dump. */
export function filterPdfListingDetailRows(rows: PdfTableRow[]): PdfTableRow[] {
  return filterPdfTableRows(rows).filter((row) => {
    const label = row.label.trim().toLowerCase();
    const value = row.value.trim();
    if (isBlueprintOcrToken(row.label) || isBlueprintOcrToken(value)) return false;
    if (label.length <= 2 && !/^(ho|tv)$/i.test(label)) return false;
    if (value.length <= 2 && !/^\d+$/.test(value)) return false;
    return true;
  });
}
