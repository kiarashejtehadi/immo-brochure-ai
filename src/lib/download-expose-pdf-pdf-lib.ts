import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFPage,
  type PDFFont,
  type RGB,
} from "pdf-lib";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { PDF_WATERMARK_TEXT } from "@/lib/branding/constants";
import { sanitizePdfImageSrc } from "@/lib/pdf-image-data-url";
import { formatPriceAmount } from "@/lib/currency";
import { splitPdfParagraphs } from "@/lib/pdf-text-format";
import { filterPdfTableRows } from "@/lib/pdf-table-rows";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const MAP_HEIGHT = 220;
const FLOOR_PLAN_HEIGHT = 220;
const GALLERY_GAP_AFTER = 16;
const PAGE1_METRICS_ROW_HEIGHT = 56;
const PAGE1_METRICS_RESERVED = PAGE1_METRICS_ROW_HEIGHT + 24;
const PAGE1_CONTENT_FLOOR = MARGIN + PAGE1_METRICS_RESERVED;
const PAGE4_SPECS_MAX_ROWS = 8;
const PAGE4_CONTACT_X = 50;
const PAGE4_DETAILS_X = 300;
const PAGE4_CONTACT_WIDTH = PAGE4_DETAILS_X - PAGE4_CONTACT_X - 16;
const PAGE4_DETAILS_WIDTH = PAGE_WIDTH - PAGE4_DETAILS_X - MARGIN;
const MAX_PDF_PAGES = 4;
const CONTACT_BORDER = rgb(0.886, 0.91, 0.941);
const PLACEHOLDER_BORDER = rgb(0.82, 0.82, 0.85);
const PLACEHOLDER_FILL = rgb(0.97, 0.97, 0.98);
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const MIN_IMAGE_BYTES = 16;

let pageCount = 0;

function safeCoord(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  const text = String(value).replace(/\0/g, "").trim();
  return text || fallback;
}

function toDrawableText(value: unknown, fallback = ""): string {
  const text = safeText(value, fallback);
  if (!text) return fallback;
  try {
    return text;
  } catch {
    return text.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "") || fallback;
  }
}

function hexToRgb(hex: string | undefined): RGB {
  const value = (hex ?? "#1E3A8A").replace("#", "");
  if (value.length !== 6) return rgb(0.12, 0.23, 0.54);
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return rgb(0.12, 0.23, 0.54);
  }
  return rgb(r, g, b);
}

function isValidImageBytes(bytes: Uint8Array | null | undefined): bytes is Uint8Array {
  return bytes instanceof Uint8Array && bytes.byteLength >= MIN_IMAGE_BYTES;
}

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1]! : dataUrl;
    if (!base64?.trim()) return null;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return isValidImageBytes(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

async function embedDataUrlImage(
  doc: PDFDocument,
  dataUrl: string | undefined,
): Promise<PDFImage | null> {
  const safe = sanitizePdfImageSrc(dataUrl);
  if (!safe) return null;

  try {
    const bytes = dataUrlToBytes(safe);
    if (!bytes) return null;

    if (/^data:image\/png/i.test(safe)) {
      try {
        return await doc.embedPng(bytes);
      } catch {
        return null;
      }
    }

    try {
      return await doc.embedJpg(bytes);
    } catch {
      try {
        return await doc.embedPng(bytes);
      } catch {
        return null;
      }
    }
  } catch {
    return null;
  }
}

type ImageBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function drawImagePlaceholder(page: PDFPage, box: ImageBox, label?: string, font?: PDFFont): void {
  const x = safeCoord(box.x, MARGIN);
  const y = safeCoord(box.y, MARGIN);
  const width = safeCoord(box.width, 120);
  const height = safeCoord(box.height, 80);

  try {
    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: PLACEHOLDER_FILL,
      borderColor: PLACEHOLDER_BORDER,
      borderWidth: 1,
    });
  } catch {
    // Non-fatal — placeholder frame only
  }

  if (label && font) {
    drawTextSafe(page, label, {
      x: x + 12,
      y: y + height / 2 - 4,
      size: 8,
      font,
      color: rgb(0.55, 0.55, 0.58),
      maxWidth: width - 24,
    });
  }
}

/** Draw image inside a box with contain fit; falls back to bordered placeholder on failure. */
function drawImageSafe(
  page: PDFPage,
  image: PDFImage | null | undefined,
  box: ImageBox,
  font?: PDFFont,
  placeholderLabel = "Image unavailable",
): boolean {
  const x = safeCoord(box.x, MARGIN);
  const y = safeCoord(box.y, MARGIN);
  const width = safeCoord(box.width, 120);
  const height = safeCoord(box.height, 80);

  const imgW = image?.width ?? 0;
  const imgH = image?.height ?? 0;
  if (!image || !Number.isFinite(imgW) || !Number.isFinite(imgH) || imgW <= 0 || imgH <= 0) {
    drawImagePlaceholder(page, { x, y, width, height }, placeholderLabel, font);
    return false;
  }

  try {
    const aspect = imgW / imgH;
    let drawWidth = width;
    let drawHeight = height;

    if (Number.isFinite(aspect) && aspect > 0) {
      if (width / height > aspect) {
        drawWidth = height * aspect;
      } else {
        drawHeight = width / aspect;
      }
    }

    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;

    page.drawImage(image, {
      x: safeCoord(drawX, x),
      y: safeCoord(drawY, y),
      width: safeCoord(drawWidth, width),
      height: safeCoord(drawHeight, height),
    });
    return true;
  } catch {
    drawImagePlaceholder(page, { x, y, width, height }, placeholderLabel, font);
    return false;
  }
}

function drawTextSafe(
  page: PDFPage,
  text: unknown,
  options: {
    x: number;
    y: number;
    size: number;
    font: PDFFont;
    color?: RGB;
    maxWidth?: number;
  },
  fallback = "",
): void {
  let content = toDrawableText(text, fallback);
  if (!content) return;

  const x = safeCoord(options.x, MARGIN);
  const y = safeCoord(options.y, MARGIN + 24);
  const size = safeCoord(options.size, 10);

  const drawOpts = {
    x,
    y,
    size,
    font: options.font,
    color: options.color ?? rgb(0.1, 0.1, 0.12),
    ...(options.maxWidth != null && Number.isFinite(options.maxWidth)
      ? { maxWidth: options.maxWidth }
      : {}),
  };

  try {
    page.drawText(content, drawOpts);
    return;
  } catch {
    content = content.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "").trim();
    if (!content) return;
    try {
      page.drawText(content, drawOpts);
    } catch {
      // Skip unsupported glyphs rather than abort PDF generation
    }
  }
}

function isLikelyRawMetadata(value: string): boolean {
  const trimmed = safeText(value);
  if (!trimmed) return true;
  if (/^\[[\s\S]*\]$/.test(trimmed)) return true;
  if (/^\{[\s\S]*\}$/.test(trimmed)) return true;
  if (/^(object|array|\[object)/i.test(trimmed)) return true;
  if (trimmed.length > 160) return true;
  return false;
}

function sanitizeSpecRows(rows: { label: string; value: string }[]): { label: string; value: string }[] {
  return rows
    .filter((row) => !isLikelyRawMetadata(row.value))
    .map((row) => ({
      label: safeText(row.label, "—"),
      value: safeText(row.value, "—") || "—",
    }));
}

function formatSizeMetric(size: string | undefined): string {
  const raw = safeText(size);
  if (!raw) return "—";
  const normalized = raw.replace(",", ".");
  const num = parseFloat(normalized);
  if (!Number.isFinite(num) || num <= 0) return "—";
  return `${raw} m²`;
}

function formatRoomsMetric(rooms: string | undefined): string {
  const raw = safeText(rooms);
  if (!raw) return "—";
  return raw;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const normalized = safeText(text);
  if (!normalized) return [];

  const words = normalized.replace(/\s+/g, " ").split(" ");
  if (words.length === 0 || words[0] === "") return [];

  const safeMaxWidth = safeCoord(maxWidth, CONTENT_WIDTH);
  const lines: string[] = [];
  let current = words[0]!;

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]!}`;
    if (font.widthOfTextAtSize(next, size) <= safeMaxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i]!;
    }
  }
  lines.push(current);
  return lines;
}

type PageContext = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  primary: RGB;
  accent: RGB;
  showWatermark: boolean;
};

function addPage(ctx: Omit<PageContext, "page" | "y">, pageLabel: string): PageContext {
  pageCount += 1;
  const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 8,
    width: PAGE_WIDTH,
    height: 8,
    color: ctx.primary,
  });

  const y = PAGE_HEIGHT - MARGIN - 12;
  drawTextSafe(page, pageLabel, {
    x: MARGIN,
    y: 28,
    size: 8,
    font: ctx.regular,
    color: rgb(0.45, 0.45, 0.5),
    maxWidth: CONTENT_WIDTH,
  });

  if (ctx.showWatermark) {
    drawTextSafe(page, PDF_WATERMARK_TEXT, {
      x: MARGIN,
      y: 14,
      size: 7,
      font: ctx.bold,
      color: rgb(0.39, 0.4, 0.95),
      maxWidth: CONTENT_WIDTH,
    });
  }

  return { ...ctx, page, y };
}

function ensureSpace(ctx: PageContext, needed: number, pageLabel: string): PageContext {
  const safeNeeded = safeCoord(needed, 24);
  if (ctx.y - safeNeeded >= MARGIN + 24) return ctx;
  if (pageCount >= MAX_PDF_PAGES) {
    return { ...ctx, y: Math.max(MARGIN + safeNeeded + 16, ctx.y - safeNeeded) };
  }
  return addPage(ctx, pageLabel);
}

function ensurePage1Space(ctx: PageContext, needed: number): PageContext {
  const safeNeeded = safeCoord(needed, 24);
  if (ctx.y - safeNeeded >= PAGE1_CONTENT_FLOOR) return ctx;
  return { ...ctx, y: PAGE1_CONTENT_FLOOR };
}

function drawLines(
  ctx: PageContext,
  lines: string[],
  size: number,
  font: PDFFont,
  color = rgb(0.1, 0.1, 0.12),
  lineHeight = 1.35,
  minY = MARGIN + 24,
): PageContext {
  let next = ctx;
  const safeSize = safeCoord(size, 10);

  for (const line of lines) {
    if (pageCount === 1) {
      next = ensurePage1Space(next, safeSize * lineHeight + 4);
    } else {
      next = ensureSpace(next, safeSize * lineHeight + 4, "ImmoCaption AI");
    }
    if (next.y < minY) break;

    drawTextSafe(next.page, line, {
      x: MARGIN,
      y: next.y,
      size: safeSize,
      font,
      color,
      maxWidth: CONTENT_WIDTH,
    });
    next = { ...next, y: next.y - safeSize * lineHeight };
  }
  return next;
}

function drawHeading(ctx: PageContext, text: string): PageContext {
  const next = ensureSpace(ctx, 28, "ImmoCaption AI");
  drawTextSafe(next.page, text, {
    x: MARGIN,
    y: next.y,
    size: 14,
    font: next.bold,
    color: next.primary,
  });
  return { ...next, y: next.y - 22 };
}

function drawTable(
  ctx: PageContext,
  rows: { label: string; value: string }[],
  options?: { x?: number; width?: number; labelWidth?: number; skipEnsure?: boolean },
): PageContext {
  const x = safeCoord(options?.x ?? MARGIN, MARGIN);
  const width = safeCoord(options?.width ?? CONTENT_WIDTH, CONTENT_WIDTH);
  const labelWidth = safeCoord(options?.labelWidth ?? 180, 180);
  const valueX = x + labelWidth;
  const valueWidth = Math.max(40, width - labelWidth);

  let next = ctx;
  for (const row of rows) {
    if (!options?.skipEnsure) {
      next = ensureSpace(next, 18, "ImmoCaption AI · Details");
    }

    drawTextSafe(next.page, row.label, {
      x,
      y: next.y,
      size: 9,
      font: next.bold,
      color: rgb(0.35, 0.35, 0.4),
      maxWidth: labelWidth - 8,
    });
    drawTextSafe(next.page, row.value, {
      x: valueX,
      y: next.y,
      size: 9,
      font: next.regular,
      color: rgb(0.1, 0.1, 0.12),
      maxWidth: valueWidth,
    });
    next = { ...next, y: next.y - 16 };
  }
  return { ...next, y: next.y - 8 };
}

/** Up to 4 additional photos in a 2-column grid. */
function drawGalleryGrid(ctx: PageContext, images: PDFImage[]): PageContext {
  if (images.length === 0) return ctx;

  const gap = 8;
  const cols = 2;
  const cellWidth = (CONTENT_WIDTH - gap) / cols;
  const cellHeight = 120;
  const rows = Math.ceil(images.length / cols);
  const gridHeight = rows * cellHeight + (rows - 1) * gap + 12;

  const next = ensureSpace(ctx, gridHeight, "ImmoCaption AI · Page 2 — Details");
  const topY = next.y;

  images.forEach((image, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cellX = MARGIN + col * (cellWidth + gap);
    const cellTop = topY - row * (cellHeight + gap);

    drawImageSafe(
      next.page,
      image,
      {
        x: cellX,
        y: cellTop - cellHeight,
        width: cellWidth,
        height: cellHeight,
      },
      next.regular,
      "Photo unavailable",
    );
  });

  return { ...next, y: topY - gridHeight - GALLERY_GAP_AFTER };
}

function drawPageHeader(
  ctx: PageContext,
  badge: string,
  logoImage: PDFImage | null,
): PageContext {
  const headerTop = PAGE_HEIGHT - MARGIN - 12;
  const logoHeight = 28;
  const logoWidth = 120;

  if (logoImage) {
    drawImageSafe(
      ctx.page,
      logoImage,
      {
        x: MARGIN,
        y: headerTop - logoHeight,
        width: logoWidth,
        height: logoHeight,
      },
      ctx.regular,
    );
  }

  const badgeText = safeText(badge, "Listing");
  const badgeFontSize = 9;
  const badgePadding = 8;
  const badgeTextWidth = ctx.bold.widthOfTextAtSize(badgeText, badgeFontSize);
  const badgeWidth = safeCoord(badgeTextWidth + badgePadding * 2, 80);
  const badgeHeight = 18;
  const badgeX = safeCoord(PAGE_WIDTH - MARGIN - badgeWidth, PAGE_WIDTH - MARGIN - 80);
  const badgeY = headerTop - badgeHeight + 4;

  try {
    ctx.page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeWidth,
      height: badgeHeight,
      color: ctx.primary,
    });
  } catch {
    // Badge background is optional
  }

  drawTextSafe(ctx.page, badgeText, {
    x: badgeX + badgePadding,
    y: badgeY + 5,
    size: badgeFontSize,
    font: ctx.bold,
    color: rgb(1, 1, 1),
  });

  return { ...ctx, y: headerTop - 40 };
}

function drawPage1MetricsRow(
  ctx: PageContext,
  metrics: readonly (readonly [string, string])[],
  accent: RGB,
): PageContext {
  const safeMetrics = metrics
    .map(([label, value]) => [safeText(label, "—"), safeText(value, "—") || "—"] as const)
    .filter(([, value]) => value !== "" && !isLikelyRawMetadata(value));

  if (safeMetrics.length === 0) {
    return ctx;
  }

  const colWidth = CONTENT_WIDTH / safeMetrics.length;
  const boxTop = MARGIN + PAGE1_METRICS_ROW_HEIGHT + 12;
  const baseY = boxTop - PAGE1_METRICS_ROW_HEIGHT + 10;

  try {
    ctx.page.drawRectangle({
      x: MARGIN,
      y: boxTop - PAGE1_METRICS_ROW_HEIGHT,
      width: CONTENT_WIDTH,
      height: PAGE1_METRICS_ROW_HEIGHT,
      borderColor: rgb(0.886, 0.91, 0.941),
      borderWidth: 1,
      color: rgb(0.973, 0.98, 0.988),
    });
  } catch {
    // Metrics frame is optional
  }

  safeMetrics.forEach(([label, value], index) => {
    const x = safeCoord(MARGIN + index * colWidth + 10, MARGIN + 10);
    drawTextSafe(ctx.page, label.toUpperCase(), {
      x,
      y: baseY + 14,
      size: 7,
      font: ctx.bold,
      color: rgb(0.45, 0.45, 0.5),
      maxWidth: colWidth - 20,
    });
    drawTextSafe(ctx.page, value, {
      x,
      y: baseY,
      size: 11,
      font: ctx.bold,
      color: index === 0 ? accent : rgb(0.1, 0.1, 0.12),
      maxWidth: colWidth - 20,
    });
  });

  return { ...ctx, y: boxTop - PAGE1_METRICS_ROW_HEIGHT - 16 };
}

function drawParagraphs(ctx: PageContext, text: string, size = 10): PageContext {
  let next = ctx;
  for (const paragraph of splitPdfParagraphs(safeText(text))) {
    next = drawLines(next, wrapText(paragraph, next.regular, size, CONTENT_WIDTH), size, next.regular);
    next = { ...next, y: next.y - 6 };
  }
  return next;
}

function drawContactBox(
  ctx: PageContext,
  lines: string[],
  avatarImage: PDFImage | null,
  options?: { x?: number; width?: number; skipEnsure?: boolean },
): PageContext {
  const padding = 12;
  const lineHeight = 14;
  const avatarSize = 48;
  const safeLines = lines.map((line) => safeText(line)).filter(Boolean);
  const hasAvatar = avatarImage !== null;
  const contentHeight = Math.max(hasAvatar ? avatarSize : 0, safeLines.length * lineHeight);
  const boxHeight = contentHeight + padding * 2;
  const x = safeCoord(options?.x ?? MARGIN, MARGIN);
  const width = safeCoord(options?.width ?? CONTENT_WIDTH, CONTENT_WIDTH);

  const next = options?.skipEnsure
    ? ctx
    : pageCount >= MAX_PDF_PAGES
      ? ctx
      : ensureSpace(ctx, boxHeight + 16, "ImmoCaption AI · Page 4 — Contact");
  const boxTop = next.y;

  try {
    next.page.drawRectangle({
      x,
      y: boxTop - boxHeight,
      width,
      height: boxHeight,
      borderColor: CONTACT_BORDER,
      borderWidth: 1,
    });
  } catch {
    // Contact frame is optional
  }

  const textX = hasAvatar ? x + padding + avatarSize + 12 : x + padding;
  let textY = boxTop - padding - 10;

  if (avatarImage) {
    drawImageSafe(
      next.page,
      avatarImage,
      {
        x: x + padding,
        y: boxTop - padding - avatarSize,
        width: avatarSize,
        height: avatarSize,
      },
      next.regular,
    );
  }

  for (const line of safeLines) {
    drawTextSafe(next.page, line, {
      x: textX,
      y: textY,
      size: 10,
      font: next.regular,
      maxWidth: width - (textX - x) - padding,
    });
    textY -= lineHeight;
  }

  return { ...next, y: boxTop - boxHeight - 16 };
}

function drawPage4Layout(
  ctx: PageContext,
  floorPlanImage: PDFImage | null,
  contactLines: string[],
  avatarImage: PDFImage | null,
  specsRows: { label: string; value: string }[],
  legalText: string,
): PageContext {
  let y = safeCoord(ctx.y, PAGE_HEIGHT - MARGIN - 40);

  drawTextSafe(ctx.page, "Floor plan", {
    x: MARGIN,
    y,
    size: 14,
    font: ctx.bold,
    color: ctx.primary,
  });
  y -= 24;

  const planBoxY = y - FLOOR_PLAN_HEIGHT;
  drawImageSafe(
    ctx.page,
    floorPlanImage,
    {
      x: MARGIN,
      y: planBoxY,
      width: CONTENT_WIDTH,
      height: FLOOR_PLAN_HEIGHT,
    },
    ctx.regular,
    "Floor plan unavailable",
  );
  y = planBoxY - 20;

  const bottomRowTop = y;
  let leftBottom = bottomRowTop;

  drawTextSafe(ctx.page, "Your contact", {
    x: PAGE4_CONTACT_X,
    y: bottomRowTop,
    size: 14,
    font: ctx.bold,
    color: ctx.primary,
  });

  if (contactLines.length > 0 || avatarImage) {
    const contactEnd = drawContactBox(
      { ...ctx, y: bottomRowTop - 24 },
      contactLines,
      avatarImage,
      { x: PAGE4_CONTACT_X, width: PAGE4_CONTACT_WIDTH, skipEnsure: true },
    );
    leftBottom = contactEnd.y;
  } else {
    leftBottom = bottomRowTop - 24;
  }

  if (specsRows.length > 0) {
    drawTextSafe(ctx.page, "Listing details", {
      x: PAGE4_DETAILS_X,
      y: bottomRowTop,
      size: 14,
      font: ctx.bold,
      color: ctx.primary,
    });
    const specsEnd = drawTable(
      { ...ctx, y: bottomRowTop - 24 },
      specsRows,
      {
        x: PAGE4_DETAILS_X,
        width: PAGE4_DETAILS_WIDTH,
        labelWidth: PAGE4_DETAILS_WIDTH * 0.42,
        skipEnsure: true,
      },
    );
    leftBottom = Math.min(leftBottom, specsEnd.y);
  }

  const legalTop = MARGIN + 52;

  drawTextSafe(ctx.page, "Legal notice", {
    x: MARGIN,
    y: legalTop + 24,
    size: 14,
    font: ctx.bold,
    color: ctx.primary,
  });

  const legalLines = wrapText(
    safeText(legalText, "All information is provided without guarantee."),
    ctx.regular,
    7,
    CONTENT_WIDTH,
  ).slice(0, 4);
  let legalY = legalTop + 4;
  for (const line of legalLines) {
    drawTextSafe(ctx.page, line, {
      x: MARGIN,
      y: legalY,
      size: 7,
      font: ctx.regular,
      color: rgb(0.35, 0.35, 0.4),
      maxWidth: CONTENT_WIDTH,
    });
    legalY -= 9;
  }

  return { ...ctx, y: Math.min(leftBottom, legalY) };
}

function triggerPdfDownload(bytes: Uint8Array, address: string) {
  const slug =
    safeText(address)
      .slice(0, 40)
      .replace(/[^\wäöüÄÖÜß\-]+/gi, "-")
      .replace(/-+/g, "-") || "expose";

  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expose-${slug}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/** Reliable browser PDF export — no React reconciler, works without listing photos. */
export async function downloadExposePdfWithPdfLib(props: BrochurePdfProps): Promise<void> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const primary = hexToRgb(props.primaryColor ?? props.brandColor);
  const accent = hexToRgb(props.accentColor);
  const showWatermark = props.showWatermark === true;

  const hero = sanitizePdfImageSrc(props.photoDataUrls[0]);
  const heroImage = await embedDataUrlImage(doc, hero);
  const galleryUrls = props.photoDataUrls
    .slice(1, 5)
    .map((src) => sanitizePdfImageSrc(src))
    .filter((src): src is string => Boolean(src));
  const galleryImages = (
    await Promise.all(galleryUrls.map((url) => embedDataUrlImage(doc, url)))
  ).filter((image): image is PDFImage => image !== null);
  const mapImage = await embedDataUrlImage(doc, props.mapDataUrl);
  const floorPlanImage = await embedDataUrlImage(doc, props.floorPlanDataUrl);
  const logoImage = await embedDataUrlImage(doc, props.logoDataUrl);
  const avatarImage = await embedDataUrlImage(doc, props.avatarDataUrl);

  const priceDisplay = safeText(props.priceAmount)
    ? formatPriceAmount(props.priceAmount, props.currency)
    : safeText(props.priceOnRequestLabel, "Price on request");

  pageCount = 0;

  let ctx = addPage(
    { doc, regular, bold, primary, accent, showWatermark },
    "ImmoCaption AI · Page 1 — Cover",
  );

  ctx = drawPageHeader(ctx, props.transactionBadge, logoImage);

  const heroHeight = 160;
  ctx = ensurePage1Space(ctx, heroHeight + 18);
  drawImageSafe(
    ctx.page,
    heroImage,
    {
      x: MARGIN,
      y: ctx.y - heroHeight,
      width: CONTENT_WIDTH,
      height: heroHeight,
    },
    regular,
    "Cover photo unavailable",
  );
  ctx = { ...ctx, y: ctx.y - heroHeight - 18 };

  ctx = ensurePage1Space(ctx, 40);
  ctx = drawLines(
    ctx,
    wrapText(safeText(props.title, "Property listing"), bold, 18, CONTENT_WIDTH),
    18,
    bold,
    primary,
    1.25,
  );

  const address = safeText(props.address);
  if (address) {
    ctx = drawLines(ctx, [address], 10, regular, rgb(0.4, 0.4, 0.45));
  }

  for (const line of props.summary ?? []) {
    const summaryLine = safeText(line);
    if (!summaryLine || isLikelyRawMetadata(summaryLine)) continue;
    ctx = ensurePage1Space(ctx, 14);
    ctx = drawLines(ctx, [`• ${summaryLine}`], 10, regular);
  }

  const metrics = [
    [safeText(props.priceLabel, "Price"), priceDisplay],
    ["Size", formatSizeMetric(props.size)],
    ["Rooms", formatRoomsMetric(props.rooms)],
  ] as const;
  ctx = drawPage1MetricsRow(ctx, metrics, accent);

  ctx = addPage(ctx, "ImmoCaption AI · Page 2 — Details");
  ctx = drawHeading(ctx, "Property story");
  ctx = drawGalleryGrid(ctx, galleryImages);
  ctx = drawParagraphs(ctx, props.fullDescription);

  if ((props.energyLines ?? []).length > 0) {
    ctx = drawHeading(ctx, "Energy certificate");
    ctx = drawTable(ctx, sanitizeSpecRows(props.energyLines));
  }

  ctx = addPage(ctx, "ImmoCaption AI · Page 3 — Location");
  ctx = drawHeading(ctx, "Location & neighborhood");

  ctx = ensureSpace(ctx, MAP_HEIGHT + 16, "ImmoCaption AI · Page 3 — Location");
  drawImageSafe(
    ctx.page,
    mapImage,
    {
      x: MARGIN,
      y: ctx.y - MAP_HEIGHT,
      width: CONTENT_WIDTH,
      height: MAP_HEIGHT,
    },
    regular,
    "Map unavailable",
  );
  ctx = { ...ctx, y: ctx.y - MAP_HEIGHT - 16 };

  ctx = drawParagraphs(ctx, props.locationDescription);

  const stagingDisclaimer = safeText(props.stagingDisclaimer);
  if (stagingDisclaimer) {
    ctx = drawLines(
      ctx,
      wrapText(stagingDisclaimer, regular, 8, CONTENT_WIDTH),
      8,
      regular,
      rgb(0.45, 0.45, 0.5),
    );
  }

  ctx = addPage(ctx, "ImmoCaption AI · Page 4 — Floor plan & contact");
  const visibleSpecs = sanitizeSpecRows(
    filterPdfTableRows(props.specsTable).slice(0, PAGE4_SPECS_MAX_ROWS),
  );
  const contactLines = [
    safeText(props.agent?.name),
    safeText(props.agent?.agency),
    safeText(props.agent?.phone),
    safeText(props.agent?.email),
    safeText(props.website),
  ].filter(Boolean);

  const legalText =
    safeText(props.agent?.legalDisclaimer) ||
    safeText(props.legalDisclaimerFallback, "All information is provided without guarantee.");

  ctx = drawPage4Layout(
    ctx,
    floorPlanImage,
    contactLines,
    avatarImage,
    visibleSpecs,
    legalText,
  );

  const bytes = await doc.save();
  triggerPdfDownload(bytes, address);
}
