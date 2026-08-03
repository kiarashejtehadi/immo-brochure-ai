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
const PAGE1_METRICS_ROW_Y = MARGIN + 82;
const PAGE1_CONTENT_FLOOR = PAGE1_METRICS_ROW_Y + 58;
const PAGE4_SPECS_MAX_ROWS = 8;
const MAX_PDF_PAGES = 4;
const CONTACT_BORDER = rgb(0.886, 0.91, 0.941);
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

let pageCount = 0;

function hexToRgb(hex: string | undefined): RGB {
  const value = (hex ?? "#1E3A8A").replace("#", "");
  if (value.length !== 6) return rgb(0.12, 0.23, 0.54);
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1]! : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function embedDataUrlImage(
  doc: PDFDocument,
  dataUrl: string | undefined,
): Promise<PDFImage | null> {
  const safe = sanitizePdfImageSrc(dataUrl);
  if (!safe) return null;
  try {
    const bytes = dataUrlToBytes(safe);
    if (/^data:image\/png/i.test(safe)) return doc.embedPng(bytes);
    return doc.embedJpg(bytes);
  } catch {
    return null;
  }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  if (words.length === 0 || words[0] === "") return [];

  const lines: string[] = [];
  let current = words[0]!;

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]!}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
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
  page.drawText(pageLabel, {
    x: MARGIN,
    y: 28,
    size: 8,
    font: ctx.regular,
    color: rgb(0.45, 0.45, 0.5),
  });

  if (ctx.showWatermark) {
    page.drawText(PDF_WATERMARK_TEXT, {
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
  if (ctx.y - needed >= MARGIN + 24) return ctx;
  if (pageCount >= MAX_PDF_PAGES) {
    return { ...ctx, y: Math.max(MARGIN + needed + 16, ctx.y - needed) };
  }
  return addPage(ctx, pageLabel);
}

function ensurePage1Space(ctx: PageContext, needed: number): PageContext {
  if (ctx.y - needed >= PAGE1_CONTENT_FLOOR) return ctx;
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
  for (const line of lines) {
    if (pageCount === 1) {
      next = ensurePage1Space(next, size * lineHeight + 4);
    } else {
      next = ensureSpace(next, size * lineHeight + 4, "ImmoCaption AI");
    }
    if (next.y < minY) break;
    next.page.drawText(line, {
      x: MARGIN,
      y: next.y,
      size,
      font,
      color,
      maxWidth: CONTENT_WIDTH,
    });
    next = { ...next, y: next.y - size * lineHeight };
  }
  return next;
}

function drawHeading(ctx: PageContext, text: string): PageContext {
  const next = ensureSpace(ctx, 28, "ImmoCaption AI");
  next.page.drawText(text, {
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
  const x = options?.x ?? MARGIN;
  const width = options?.width ?? CONTENT_WIDTH;
  const labelWidth = options?.labelWidth ?? 180;
  const valueX = x + labelWidth;
  const valueWidth = width - labelWidth;

  let next = ctx;
  for (const row of rows) {
    if (!options?.skipEnsure) {
      next = ensureSpace(next, 18, "ImmoCaption AI · Details");
    }
    next.page.drawText(row.label, {
      x,
      y: next.y,
      size: 9,
      font: next.bold,
      color: rgb(0.35, 0.35, 0.4),
      maxWidth: labelWidth - 8,
    });
    next.page.drawText(row.value, {
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

/** Up to 4 additional photos in a 2-column grid (matches react-pdf layout). */
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

    const scale = Math.max(cellWidth / image.width, cellHeight / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = cellX + (cellWidth - drawWidth) / 2;
    const y = cellTop - cellHeight + (cellHeight - drawHeight) / 2;

    next.page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
  });

  return { ...next, y: topY - gridHeight - GALLERY_GAP_AFTER };
}

function drawPageHeader(
  ctx: PageContext,
  badge: string,
  logoImage: PDFImage | null,
): PageContext {
  const headerTop = PAGE_HEIGHT - MARGIN - 12;

  if (logoImage) {
    const logoHeight = 28;
    const logoWidth = Math.min(120, (logoImage.width / logoImage.height) * logoHeight);
    ctx.page.drawImage(logoImage, {
      x: MARGIN,
      y: headerTop - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
  }

  const badgeFontSize = 9;
  const badgePadding = 8;
  const badgeTextWidth = ctx.bold.widthOfTextAtSize(badge, badgeFontSize);
  const badgeWidth = badgeTextWidth + badgePadding * 2;
  const badgeHeight = 18;
  const badgeX = PAGE_WIDTH - MARGIN - badgeWidth;
  const badgeY = headerTop - badgeHeight + 4;

  ctx.page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: badgeHeight,
    color: ctx.primary,
  });
  ctx.page.drawText(badge, {
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
  const colWidth = CONTENT_WIDTH / metrics.length;
  const baseY = PAGE1_METRICS_ROW_Y;

  metrics.forEach(([label, value], index) => {
    const x = MARGIN + index * colWidth + 6;
    ctx.page.drawText(label.toUpperCase(), {
      x,
      y: baseY + 14,
      size: 7,
      font: ctx.bold,
      color: rgb(0.45, 0.45, 0.5),
    });
    ctx.page.drawText(value, {
      x,
      y: baseY,
      size: 11,
      font: ctx.bold,
      color: index === 0 ? accent : rgb(0.1, 0.1, 0.12),
      maxWidth: colWidth - 12,
    });
  });

  return { ...ctx, y: baseY - 10 };
}

function drawParagraphs(ctx: PageContext, text: string, size = 10): PageContext {
  let next = ctx;
  for (const paragraph of splitPdfParagraphs(text)) {
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
  const hasAvatar = avatarImage !== null;
  const contentHeight = Math.max(hasAvatar ? avatarSize : 0, lines.length * lineHeight);
  const boxHeight = contentHeight + padding * 2;
  const x = options?.x ?? MARGIN;
  const width = options?.width ?? CONTENT_WIDTH;

  const next = options?.skipEnsure
    ? ctx
    : pageCount >= MAX_PDF_PAGES
      ? ctx
      : ensureSpace(ctx, boxHeight + 16, "ImmoCaption AI · Page 4 — Contact");
  const boxTop = next.y;

  next.page.drawRectangle({
    x,
    y: boxTop - boxHeight,
    width,
    height: boxHeight,
    borderColor: CONTACT_BORDER,
    borderWidth: 1,
  });

  const textX = hasAvatar ? x + padding + avatarSize + 12 : x + padding;
  let textY = boxTop - padding - 10;

  if (avatarImage) {
    next.page.drawImage(avatarImage, {
      x: x + padding,
      y: boxTop - padding - avatarSize,
      width: avatarSize,
      height: avatarSize,
    });
  }

  for (const line of lines) {
    next.page.drawText(line, {
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
  let y = ctx.y;
  const colGap = 12;
  const colWidth = (CONTENT_WIDTH - colGap) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colWidth + colGap;

  if (floorPlanImage) {
    ctx.page.drawText("Floor plan", {
      x: MARGIN,
      y,
      size: 14,
      font: ctx.bold,
      color: ctx.primary,
    });
    y -= 24;

    const planHeight = FLOOR_PLAN_HEIGHT;
    const planWidth = Math.min(
      CONTENT_WIDTH,
      (floorPlanImage.width / floorPlanImage.height) * planHeight,
    );
    const planX = MARGIN + (CONTENT_WIDTH - planWidth) / 2;
    ctx.page.drawImage(floorPlanImage, {
      x: planX,
      y: y - planHeight,
      width: planWidth,
      height: planHeight,
    });
    y -= planHeight + 16;
  }

  const bottomRowTop = y;
  let leftBottom = bottomRowTop;

  if (contactLines.length > 0 || avatarImage) {
    ctx.page.drawText("Your contact", {
      x: leftX,
      y: bottomRowTop,
      size: 14,
      font: ctx.bold,
      color: ctx.primary,
    });
    leftBottom = bottomRowTop - 24;
    const contactEnd = drawContactBox(
      { ...ctx, y: leftBottom },
      contactLines,
      avatarImage,
      { x: leftX, width: colWidth, skipEnsure: true },
    );
    leftBottom = contactEnd.y;
  }

  if (specsRows.length > 0) {
    ctx.page.drawText("Listing details", {
      x: rightX,
      y: bottomRowTop,
      size: 14,
      font: ctx.bold,
      color: ctx.primary,
    });
    const specsEnd = drawTable(
      { ...ctx, y: bottomRowTop - 24 },
      specsRows,
      { x: rightX, width: colWidth, labelWidth: colWidth * 0.42, skipEnsure: true },
    );
    leftBottom = Math.min(leftBottom, specsEnd.y);
  }

  const legalTop = MARGIN + 52;

  ctx.page.drawText("Legal notice", {
    x: MARGIN,
    y: legalTop + 24,
    size: 14,
    font: ctx.bold,
    color: ctx.primary,
  });

  const legalLines = wrapText(legalText, ctx.regular, 7, CONTENT_WIDTH).slice(0, 4);
  let legalY = legalTop + 4;
  for (const line of legalLines) {
    ctx.page.drawText(line, {
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
    address
      .trim()
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

  const priceDisplay = props.priceAmount.trim()
    ? formatPriceAmount(props.priceAmount, props.currency)
    : props.priceOnRequestLabel;

  pageCount = 0;

  let ctx = addPage(
    { doc, regular, bold, primary, accent, showWatermark },
    "ImmoCaption AI · Page 1 — Cover",
  );

  ctx = drawPageHeader(ctx, props.transactionBadge, logoImage);

  if (heroImage) {
    ctx = ensurePage1Space(ctx, 160 + 18);
    const imageHeight = 160;
    const imageWidth = Math.min(CONTENT_WIDTH, (heroImage.width / heroImage.height) * imageHeight);
    ctx.page.drawImage(heroImage, {
      x: MARGIN,
      y: ctx.y - imageHeight,
      width: imageWidth,
      height: imageHeight,
    });
    ctx = { ...ctx, y: ctx.y - imageHeight - 18 };
  }

  ctx = ensurePage1Space(ctx, 40);
  ctx = drawLines(ctx, wrapText(props.title, bold, 18, CONTENT_WIDTH), 18, bold, primary, 1.25);
  if (props.address.trim()) {
    ctx = drawLines(ctx, [props.address], 10, regular, rgb(0.4, 0.4, 0.45));
  }

  for (const line of props.summary) {
    ctx = ensurePage1Space(ctx, 14);
    ctx = drawLines(ctx, [`• ${line}`], 10, regular);
  }

  const metrics = [
    [props.priceLabel, priceDisplay],
    ["Size", props.size.trim() ? `${props.size} m²` : "—"],
    ["Rooms", props.rooms.trim() || "—"],
  ] as const;
  ctx = drawPage1MetricsRow(ctx, metrics, accent);

  ctx = addPage(ctx, "ImmoCaption AI · Page 2 — Details");
  ctx = drawHeading(ctx, "Property story");
  ctx = drawGalleryGrid(ctx, galleryImages);
  ctx = drawParagraphs(ctx, props.fullDescription);

  if (props.energyLines.length > 0) {
    ctx = drawHeading(ctx, "Energy certificate");
    ctx = drawTable(ctx, props.energyLines);
  }

  ctx = addPage(ctx, "ImmoCaption AI · Page 3 — Location");
  ctx = drawHeading(ctx, "Location & neighborhood");

  if (mapImage) {
    ctx = ensureSpace(ctx, MAP_HEIGHT + 16, "ImmoCaption AI · Page 3 — Location");
    ctx.page.drawImage(mapImage, {
      x: MARGIN,
      y: ctx.y - MAP_HEIGHT,
      width: CONTENT_WIDTH,
      height: MAP_HEIGHT,
    });
    ctx = { ...ctx, y: ctx.y - MAP_HEIGHT - 16 };
  }

  ctx = drawParagraphs(ctx, props.locationDescription);

  if (props.stagingDisclaimer?.trim()) {
    ctx = drawLines(
      ctx,
      wrapText(props.stagingDisclaimer, regular, 8, CONTENT_WIDTH),
      8,
      regular,
      rgb(0.45, 0.45, 0.5),
    );
  }

  ctx = addPage(ctx, "ImmoCaption AI · Page 4 — Floor plan & contact");
  const visibleSpecs = filterPdfTableRows(props.specsTable).slice(0, PAGE4_SPECS_MAX_ROWS);
  const contactLines = [
    props.agent.name.trim(),
    props.agent.agency.trim(),
    props.agent.phone.trim(),
    props.agent.email.trim(),
    props.website?.trim() ?? "",
  ].filter(Boolean);

  ctx = drawPage4Layout(
    ctx,
    floorPlanImage,
    contactLines,
    avatarImage,
    visibleSpecs,
    props.agent.legalDisclaimer.trim() || props.legalDisclaimerFallback,
  );

  const bytes = await doc.save();
  triggerPdfDownload(bytes, props.address);
}
