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
const GALLERY_GAP = 10;
const GALLERY_CELL_HEIGHT = 198;
const GALLERY_GAP_AFTER = 8;
const PAGE1_HERO_HEIGHT = 292;
const PAGE1_HERO_GAP = 14;
const PAGE1_LEFT_COL_RATIO = 0.46;
const PAGE1_METRICS_ROW_HEIGHT = 56;
const PAGE1_METRICS_GAP = 18;
const PAGE1_BULLET_GAP = 6;
const PAGE4_SPECS_MAX_ROWS = 8;
const PAGE4_DETAILS_X = 50;
const PAGE4_CONTACT_X = 320;
const PAGE4_COL_WIDTH = 235;
const PAGE4_FLOOR_PLAN_PLACEHOLDER = "Floor Plan Available Upon Request";
const MAX_PDF_PAGES = 4;
const CONTACT_BORDER = rgb(0.886, 0.91, 0.941);
const METRICS_FILL = rgb(0.973, 0.98, 0.988);
const METRICS_BORDER = rgb(0.886, 0.91, 0.941);
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
  return text;
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

type ImageFit = "contain" | "cover";

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
    // Non-fatal
  }

  if (label && font) {
    const labelLines = wrapText(label, font, 9, width - 24);
    let labelY = y + height / 2 + (labelLines.length - 1) * 5;
    for (const line of labelLines) {
      drawTextSafe(page, line, {
        x: x + 12,
        y: labelY,
        size: 9,
        font,
        color: rgb(0.55, 0.55, 0.58),
        maxWidth: width - 24,
      });
      labelY -= 11;
    }
  }
}

function drawImageSafe(
  page: PDFPage,
  image: PDFImage | null | undefined,
  box: ImageBox,
  font?: PDFFont,
  placeholderLabel = "Image unavailable",
  fit: ImageFit = "contain",
): boolean {
  const x = safeCoord(box.x, MARGIN);
  const y = safeCoord(box.y, MARGIN);
  const width = safeCoord(box.width, 120);
  const height = safeCoord(box.height, 80);

  const imgW = image?.width ?? 0;
  const imgH = image?.height ?? 0;
  if (!image || !Number.isFinite(imgW) || !Number.isFinite(imgH) || imgW <= 0 || imgH <= 0) {
    if (placeholderLabel) {
      drawImagePlaceholder(page, { x, y, width, height }, placeholderLabel, font);
    }
    return false;
  }

  try {
    const aspect = imgW / imgH;
    let drawWidth = width;
    let drawHeight = height;

    if (Number.isFinite(aspect) && aspect > 0) {
      if (fit === "cover") {
        const scale = Math.max(width / imgW, height / imgH);
        drawWidth = imgW * scale;
        drawHeight = imgH * scale;
      } else if (width / height > aspect) {
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
    if (placeholderLabel) {
      drawImagePlaceholder(page, { x, y, width, height }, placeholderLabel, font);
    }
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
      // Skip unsupported glyphs
    }
  }
}

function isLikelyRawMetadata(value: string): boolean {
  const trimmed = safeText(value);
  if (!trimmed) return true;
  if (/^\[[\s\S]*\]$/.test(trimmed)) return true;
  if (/^\{[\s\S]*\}$/.test(trimmed)) return true;
  if (/^(object|array|\[object)/i.test(trimmed)) return true;
  if (/^"[a-zA-Z0-9]{2,12}"(,\s*"[a-zA-Z0-9]{2,12}")+$/i.test(trimmed)) return true;
  if (trimmed.length > 160) return true;
  return false;
}

function sanitizeSpecRows(rows: { label: string; value: string }[]): { label: string; value: string }[] {
  return rows
    .filter((row) => !isLikelyRawMetadata(row.value) && !isLikelyRawMetadata(row.label))
    .map((row) => ({
      label: safeText(row.label, "—") || "—",
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
  return safeText(rooms) || "—";
}

function formatPriceCallout(props: BrochurePdfProps, priceDisplay: string): string {
  const display = safeText(priceDisplay, "Price on request");
  if (!safeText(props.priceAmount)) return display;
  if (props.transactionType === "rent") return `${display} / month`;
  return display;
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

  try {
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 8,
      width: PAGE_WIDTH,
      height: 8,
      color: ctx.primary,
    });
  } catch {
    // Accent bar optional
  }

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
    next = ensureSpace(next, safeSize * lineHeight + 4, "ImmoCaption AI");
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

function drawHeading(ctx: PageContext, text: string, compact = false): PageContext {
  const next = ensureSpace(ctx, compact ? 22 : 28, "ImmoCaption AI");
  drawTextSafe(next.page, text, {
    x: MARGIN,
    y: next.y,
    size: compact ? 13 : 14,
    font: next.bold,
    color: next.primary,
  });
  return { ...next, y: next.y - (compact ? 16 : 22) };
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
    next = { ...next, y: next.y - 15 };
  }
  return { ...next, y: next.y - 6 };
}

function drawTransactionBadge(ctx: PageContext, badge: string): void {
  const badgeText = safeText(badge, "Listing");
  const badgeFontSize = 9;
  const badgePadding = 8;
  const headerTop = PAGE_HEIGHT - MARGIN - 12;

  try {
    const badgeTextWidth = ctx.bold.widthOfTextAtSize(badgeText, badgeFontSize);
    const badgeWidth = safeCoord(badgeTextWidth + badgePadding * 2, 80);
    const badgeHeight = 18;
    const badgeX = safeCoord(PAGE_WIDTH - MARGIN - badgeWidth, PAGE_WIDTH - MARGIN - 80);
    const badgeY = headerTop - badgeHeight + 4;

    ctx.page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeWidth,
      height: badgeHeight,
      color: ctx.primary,
    });

    drawTextSafe(ctx.page, badgeText, {
      x: badgeX + badgePadding,
      y: badgeY + 5,
      size: badgeFontSize,
      font: ctx.bold,
      color: rgb(1, 1, 1),
    });
  } catch {
    // Badge optional
  }
}

function drawPage1MetricsRow(
  ctx: PageContext,
  metrics: readonly (readonly [string, string])[],
  accent: RGB,
): PageContext {
  const safeMetrics = metrics
    .map(([label, value]) => [safeText(label, "—"), safeText(value, "—") || "—"] as const)
    .filter(([, value]) => value !== "" && !isLikelyRawMetadata(value));

  if (safeMetrics.length === 0) return ctx;

  const colWidth = CONTENT_WIDTH / safeMetrics.length;
  const boxTop = safeCoord(ctx.y, MARGIN + PAGE1_METRICS_ROW_HEIGHT);
  const boxBottom = boxTop - PAGE1_METRICS_ROW_HEIGHT;
  const baseY = boxBottom + 10;

  try {
    ctx.page.drawRectangle({
      x: MARGIN,
      y: boxBottom,
      width: CONTENT_WIDTH,
      height: PAGE1_METRICS_ROW_HEIGHT,
      borderColor: METRICS_BORDER,
      borderWidth: 1,
      color: METRICS_FILL,
    });
  } catch {
    // Frame optional
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

  return { ...ctx, y: boxBottom - PAGE1_METRICS_GAP };
}

function drawPage1CoverLayout(
  ctx: PageContext,
  props: BrochurePdfProps,
  logoImage: PDFImage | null,
  heroImage: PDFImage | null,
  priceDisplay: string,
  accent: RGB,
): PageContext {
  drawTransactionBadge(ctx, props.transactionBadge);

  const heroTop = safeCoord(ctx.y, PAGE_HEIGHT - MARGIN - 40);
  const heroBottom = heroTop - PAGE1_HERO_HEIGHT;
  const leftWidth = Math.floor(CONTENT_WIDTH * PAGE1_LEFT_COL_RATIO);
  const rightWidth = CONTENT_WIDTH - leftWidth - PAGE1_HERO_GAP;
  const leftX = MARGIN;
  const rightX = MARGIN + leftWidth + PAGE1_HERO_GAP;

  let leftY = heroTop;

  if (logoImage) {
    drawImageSafe(
      ctx.page,
      logoImage,
      { x: leftX, y: leftY - 38, width: 148, height: 38 },
      ctx.regular,
      "",
      "contain",
    );
    leftY -= 50;
  }

  const titleLines = wrapText(
    safeText(props.title, "Property listing"),
    ctx.bold,
    17,
    leftWidth,
  );
  for (const line of titleLines.slice(0, 3)) {
    drawTextSafe(ctx.page, line, {
      x: leftX,
      y: leftY,
      size: 17,
      font: ctx.bold,
      color: ctx.primary,
      maxWidth: leftWidth,
    });
    leftY -= 21;
  }

  const priceCallout = formatPriceCallout(props, priceDisplay);
  drawTextSafe(ctx.page, priceCallout, {
    x: leftX,
    y: leftY,
    size: 22,
    font: ctx.bold,
    color: accent,
    maxWidth: leftWidth,
  });
  leftY -= 30;

  const address = safeText(props.address);
  if (address) {
    const addressLines = wrapText(address, ctx.regular, 10, leftWidth);
    for (const line of addressLines.slice(0, 3)) {
      drawTextSafe(ctx.page, line, {
        x: leftX,
        y: leftY,
        size: 10,
        font: ctx.regular,
        color: rgb(0.4, 0.4, 0.45),
        maxWidth: leftWidth,
      });
      leftY -= 13;
    }
  }

  drawImageSafe(
    ctx.page,
    heroImage,
    { x: rightX, y: heroBottom, width: rightWidth, height: PAGE1_HERO_HEIGHT },
    ctx.regular,
    "Photo unavailable",
    "cover",
  );

  let next = { ...ctx, y: heroBottom - PAGE1_METRICS_GAP };

  const metrics = [
    [safeText(props.priceLabel, "Rent"), priceDisplay],
    ["Size", formatSizeMetric(props.size)],
    ["Rooms", formatRoomsMetric(props.rooms)],
  ] as const;
  next = drawPage1MetricsRow(next, metrics, accent);

  const bullets = (props.summary ?? [])
    .map((line) => safeText(line))
    .filter((line) => line && !isLikelyRawMetadata(line));

  if (bullets.length > 0) {
    next = { ...next, y: next.y - 4 };
    const minY = MARGIN + 36;
    for (const line of bullets.slice(0, 8)) {
      if (next.y < minY) break;
      drawTextSafe(next.page, `• ${line}`, {
        x: MARGIN,
        y: next.y,
        size: 10,
        font: next.regular,
        color: rgb(0.15, 0.15, 0.18),
        maxWidth: CONTENT_WIDTH,
      });
      next = { ...next, y: next.y - 13 - PAGE1_BULLET_GAP };
    }
  }

  return next;
}

function drawGalleryGrid(ctx: PageContext, images: PDFImage[]): PageContext {
  if (images.length === 0) return ctx;

  const cols = 2;
  const cellWidth = (CONTENT_WIDTH - GALLERY_GAP) / cols;
  const rows = Math.ceil(Math.min(images.length, 4) / cols);
  const gridHeight = rows * GALLERY_CELL_HEIGHT + (rows - 1) * GALLERY_GAP;

  const next = ensureSpace(ctx, gridHeight, "ImmoCaption AI · Page 2 — Details");
  const topY = next.y;

  images.slice(0, 4).forEach((image, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cellX = MARGIN + col * (cellWidth + GALLERY_GAP);
    const cellY = topY - row * (GALLERY_CELL_HEIGHT + GALLERY_GAP) - GALLERY_CELL_HEIGHT;

    drawImageSafe(
      next.page,
      image,
      { x: cellX, y: cellY, width: cellWidth, height: GALLERY_CELL_HEIGHT },
      next.regular,
      "Photo unavailable",
      "cover",
    );
  });

  return { ...next, y: topY - gridHeight - GALLERY_GAP_AFTER };
}

function drawCompactParagraphs(ctx: PageContext, text: string, size = 9): PageContext {
  let next = ctx;
  const paragraphs = splitPdfParagraphs(safeText(text)).slice(0, 6);

  for (const paragraph of paragraphs) {
    next = drawLines(
      next,
      wrapText(paragraph, next.regular, size, CONTENT_WIDTH),
      size,
      next.regular,
      rgb(0.1, 0.1, 0.12),
      1.28,
    );
    next = { ...next, y: next.y - 3 };
  }
  return next;
}

function drawContactBox(
  ctx: PageContext,
  lines: string[],
  avatarImage: PDFImage | null,
  logoImage: PDFImage | null,
  options?: { x?: number; width?: number; skipEnsure?: boolean },
): PageContext {
  const padding = 12;
  const lineHeight = 13;
  const avatarSize = 44;
  const logoHeight = 24;
  const safeLines = lines.map((line) => safeText(line)).filter(Boolean);
  const hasLogo = logoImage !== null;
  const hasAvatar = avatarImage !== null;

  let innerHeight = safeLines.length * lineHeight;
  if (hasLogo) innerHeight += logoHeight + 8;
  if (hasAvatar) innerHeight = Math.max(innerHeight, avatarSize);

  const boxHeight = innerHeight + padding * 2;
  const x = safeCoord(options?.x ?? MARGIN, MARGIN);
  const width = safeCoord(options?.width ?? CONTENT_WIDTH, CONTENT_WIDTH);
  const boxTop = ctx.y;

  try {
    ctx.page.drawRectangle({
      x,
      y: boxTop - boxHeight,
      width,
      height: boxHeight,
      borderColor: CONTACT_BORDER,
      borderWidth: 1,
    });
  } catch {
    // Frame optional
  }

  let cursorY = boxTop - padding - 10;
  const innerX = x + padding;

  if (hasLogo) {
    drawImageSafe(
      ctx.page,
      logoImage,
      { x: innerX, y: cursorY - logoHeight, width: 100, height: logoHeight },
      ctx.regular,
      "",
      "contain",
    );
    cursorY -= logoHeight + 10;
  }

  const textX = hasAvatar ? innerX + avatarSize + 10 : innerX;
  let textY = cursorY;

  if (hasAvatar) {
    drawImageSafe(
      ctx.page,
      avatarImage,
      { x: innerX, y: cursorY - avatarSize, width: avatarSize, height: avatarSize },
      ctx.regular,
      "",
      "cover",
    );
    textY = cursorY - 10;
  }

  for (const line of safeLines) {
    drawTextSafe(ctx.page, line, {
      x: textX,
      y: textY,
      size: 9,
      font: ctx.regular,
      maxWidth: width - (textX - x) - padding,
    });
    textY -= lineHeight;
  }

  return { ...ctx, y: boxTop - boxHeight - 10 };
}

function drawPage4Layout(
  ctx: PageContext,
  floorPlanImage: PDFImage | null,
  contactLines: string[],
  avatarImage: PDFImage | null,
  logoImage: PDFImage | null,
  specsRows: { label: string; value: string }[],
  legalText: string,
): PageContext {
  const contentTop = safeCoord(ctx.y, PAGE_HEIGHT - MARGIN - 40);
  const contentBottom = MARGIN + 36;
  const usableHeight = Math.max(320, contentTop - contentBottom);
  const planSectionHeight = usableHeight * 0.6;
  const bottomSectionTop = contentTop - planSectionHeight - 8;
  const planBoxHeight = planSectionHeight - 28;
  const planBoxY = bottomSectionTop - planBoxHeight + 8;

  drawTextSafe(ctx.page, "Floor plan", {
    x: MARGIN,
    y: bottomSectionTop + 16,
    size: 14,
    font: ctx.bold,
    color: ctx.primary,
  });

  drawImageSafe(
    ctx.page,
    floorPlanImage,
    { x: MARGIN, y: planBoxY, width: CONTENT_WIDTH, height: planBoxHeight },
    ctx.regular,
    PAGE4_FLOOR_PLAN_PLACEHOLDER,
    "contain",
  );

  const columnTop = planBoxY - 22;
  let columnBottom = columnTop;

  drawTextSafe(ctx.page, "Listing details", {
    x: PAGE4_DETAILS_X,
    y: columnTop,
    size: 13,
    font: ctx.bold,
    color: ctx.primary,
  });

  if (specsRows.length > 0) {
    const specsEnd = drawTable(
      { ...ctx, y: columnTop - 18 },
      specsRows.slice(0, PAGE4_SPECS_MAX_ROWS),
      {
        x: PAGE4_DETAILS_X,
        width: PAGE4_COL_WIDTH,
        labelWidth: PAGE4_COL_WIDTH * 0.44,
        skipEnsure: true,
      },
    );
    columnBottom = Math.min(columnBottom, specsEnd.y);
  } else {
    columnBottom = columnTop - 18;
  }

  drawTextSafe(ctx.page, "Your contact", {
    x: PAGE4_CONTACT_X,
    y: columnTop,
    size: 13,
    font: ctx.bold,
    color: ctx.primary,
  });

  if (contactLines.length > 0 || avatarImage || logoImage) {
    const contactEnd = drawContactBox(
      { ...ctx, y: columnTop - 18 },
      contactLines,
      avatarImage,
      logoImage,
      { x: PAGE4_CONTACT_X, width: PAGE4_COL_WIDTH, skipEnsure: true },
    );
    columnBottom = Math.min(columnBottom, contactEnd.y);
  }

  const legalLines = wrapText(
    safeText(legalText, "All information is provided without guarantee."),
    ctx.regular,
    7,
    CONTENT_WIDTH,
  ).slice(0, 3);
  let legalY = Math.min(columnBottom, contentBottom + 40) - 6;

  for (const line of legalLines) {
    if (legalY < contentBottom) break;
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

  return { ...ctx, y: legalY };
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
  try {
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

    const address = safeText(props.address);

    pageCount = 0;

    let ctx = addPage(
      { doc, regular, bold, primary, accent, showWatermark },
      "ImmoCaption AI · Page 1 — Cover",
    );

    ctx = drawPage1CoverLayout(ctx, props, logoImage, heroImage, priceDisplay, accent);

    ctx = addPage(ctx, "ImmoCaption AI · Page 2 — Details");
    ctx = drawHeading(ctx, "Property story", true);
    ctx = drawGalleryGrid(ctx, galleryImages);
    ctx = drawCompactParagraphs(ctx, props.fullDescription);

    if ((props.energyLines ?? []).length > 0) {
      ctx = drawHeading(ctx, "Energy certificate", true);
      ctx = drawTable(ctx, sanitizeSpecRows(props.energyLines));
    }

    ctx = addPage(ctx, "ImmoCaption AI · Page 3 — Location");
    ctx = drawHeading(ctx, "Location & neighborhood");

    ctx = ensureSpace(ctx, MAP_HEIGHT + 16, "ImmoCaption AI · Page 3 — Location");
    drawImageSafe(
      ctx.page,
      mapImage,
      { x: MARGIN, y: ctx.y - MAP_HEIGHT, width: CONTENT_WIDTH, height: MAP_HEIGHT },
      regular,
      "Map unavailable",
      "cover",
    );
    ctx = { ...ctx, y: ctx.y - MAP_HEIGHT - 16 };

    ctx = drawCompactParagraphs(ctx, props.locationDescription);

    const stagingDisclaimer = safeText(props.stagingDisclaimer);
    if (stagingDisclaimer) {
      ctx = drawLines(
        ctx,
        wrapText(stagingDisclaimer, regular, 8, CONTENT_WIDTH),
        8,
        regular,
        rgb(0.45, 0.45, 0.5),
        1.25,
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
      logoImage,
      visibleSpecs,
      legalText,
    );

    const bytes = await doc.save();
    triggerPdfDownload(bytes, address);
  } catch (err) {
    console.error("[download-expose-pdf-pdf-lib]", err);
  }
}
