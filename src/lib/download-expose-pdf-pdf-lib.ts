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

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

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
  return addPage(ctx, pageLabel);
}

function drawLines(
  ctx: PageContext,
  lines: string[],
  size: number,
  font: PDFFont,
  color = rgb(0.1, 0.1, 0.12),
  lineHeight = 1.35,
): PageContext {
  let next = ctx;
  for (const line of lines) {
    next = ensureSpace(next, size * lineHeight + 4, "ImmoCaption AI");
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
): PageContext {
  let next = ctx;
  for (const row of rows) {
    next = ensureSpace(next, 18, "ImmoCaption AI · Details");
    next.page.drawText(row.label, {
      x: MARGIN,
      y: next.y,
      size: 9,
      font: next.bold,
      color: rgb(0.35, 0.35, 0.4),
    });
    next.page.drawText(row.value, {
      x: MARGIN + 180,
      y: next.y,
      size: 9,
      font: next.regular,
      color: rgb(0.1, 0.1, 0.12),
      maxWidth: CONTENT_WIDTH - 180,
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

  return { ...next, y: topY - gridHeight };
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

  let ctx = addPage(
    { doc, regular, bold, primary, accent, showWatermark },
    "ImmoCaption AI · Page 1 — Cover",
  );

  if (logoImage) {
    const logoHeight = 28;
    const logoWidth = Math.min(120, (logoImage.width / logoImage.height) * logoHeight);
    ctx.page.drawImage(logoImage, {
      x: MARGIN,
      y: ctx.y - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
    ctx = { ...ctx, y: ctx.y - logoHeight - 16 };
  }

  ctx.page.drawRectangle({
    x: PAGE_WIDTH - MARGIN - 86,
    y: PAGE_HEIGHT - MARGIN - 12,
    width: 86,
    height: 18,
    color: primary,
  });
  ctx.page.drawText(props.transactionBadge, {
    x: PAGE_WIDTH - MARGIN - 80,
    y: PAGE_HEIGHT - MARGIN - 8,
    size: 9,
    font: bold,
    color: rgb(1, 1, 1),
  });

  if (heroImage) {
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

  ctx = drawLines(ctx, wrapText(props.title, bold, 18, CONTENT_WIDTH), 18, bold, primary, 1.25);
  if (props.address.trim()) {
    ctx = drawLines(ctx, [props.address], 10, regular, rgb(0.4, 0.4, 0.45));
  }

  for (const line of props.summary) {
    ctx = drawLines(ctx, [`• ${line}`], 10, regular);
  }

  ctx = { ...ctx, y: ctx.y - 8 };
  const metrics = [
    [props.priceLabel, priceDisplay],
    ["Size", props.size.trim() ? `${props.size} m²` : "—"],
    ["Rooms", props.rooms.trim() || "—"],
  ] as const;
  for (const [label, value] of metrics) {
    ctx.page.drawText(label, {
      x: MARGIN,
      y: ctx.y,
      size: 9,
      font: bold,
      color: rgb(0.45, 0.45, 0.5),
    });
    ctx.page.drawText(value, {
      x: MARGIN + 100,
      y: ctx.y,
      size: 11,
      font: bold,
      color: label === props.priceLabel ? accent : rgb(0.1, 0.1, 0.12),
    });
    ctx = { ...ctx, y: ctx.y - 18 };
  }

  ctx = addPage(ctx, "ImmoCaption AI · Page 2 — Details");
  ctx = drawHeading(ctx, "Property story");
  ctx = drawGalleryGrid(ctx, galleryImages);
  ctx = drawLines(
    ctx,
    wrapText(props.fullDescription, regular, 10, CONTENT_WIDTH),
    10,
    regular,
  );

  if (props.energyLines.length > 0) {
    ctx = drawHeading(ctx, "Energy certificate");
    ctx = drawTable(ctx, props.energyLines);
  }

  if (props.specsTable.length > 0) {
    ctx = drawHeading(ctx, "Specifications");
    ctx = drawTable(ctx, props.specsTable);
  }

  ctx = addPage(ctx, "ImmoCaption AI · Page 3 — Location");
  ctx = drawHeading(ctx, "Location & neighborhood");
  ctx = drawLines(
    ctx,
    wrapText(props.locationDescription, regular, 10, CONTENT_WIDTH),
    10,
    regular,
  );

  if (mapImage) {
    const mapHeight = 180;
    const mapWidth = Math.min(CONTENT_WIDTH, (mapImage.width / mapImage.height) * mapHeight);
    ctx = ensureSpace(ctx, mapHeight + 20, "ImmoCaption AI · Page 3 — Location");
    ctx.page.drawImage(mapImage, {
      x: MARGIN,
      y: ctx.y - mapHeight,
      width: mapWidth,
      height: mapHeight,
    });
    ctx = { ...ctx, y: ctx.y - mapHeight - 16 };
  }

  if (props.stagingDisclaimer?.trim()) {
    ctx = drawLines(
      ctx,
      wrapText(props.stagingDisclaimer, regular, 8, CONTENT_WIDTH),
      8,
      regular,
      rgb(0.45, 0.45, 0.5),
    );
  }

  ctx = addPage(ctx, "ImmoCaption AI · Page 4 — Contact");
  if (floorPlanImage) {
    ctx = drawHeading(ctx, "Floor plan");
    const planHeight = 220;
    const planWidth = Math.min(CONTENT_WIDTH, (floorPlanImage.width / floorPlanImage.height) * planHeight);
    ctx.page.drawImage(floorPlanImage, {
      x: MARGIN,
      y: ctx.y - planHeight,
      width: planWidth,
      height: planHeight,
    });
    ctx = { ...ctx, y: ctx.y - planHeight - 20 };
  }

  const contactLines = [
    props.agent.name.trim(),
    props.agent.agency.trim(),
    props.agent.phone.trim(),
    props.agent.email.trim(),
    props.website?.trim() ?? "",
  ].filter(Boolean);

  if (contactLines.length > 0 || avatarImage) {
    ctx = drawHeading(ctx, "Your contact");
    if (avatarImage) {
      const avatarSize = 48;
      ctx.page.drawImage(avatarImage, {
        x: MARGIN,
        y: ctx.y - avatarSize,
        width: avatarSize,
        height: avatarSize,
      });
      ctx = drawLines(
        { ...ctx, y: ctx.y - 4 },
        contactLines,
        10,
        regular,
      );
      ctx = { ...ctx, y: ctx.y - avatarSize - 12 };
    } else {
      ctx = drawLines(ctx, contactLines, 10, regular);
    }
  }

  ctx = drawHeading(ctx, "Legal notice");
  ctx = drawLines(
    ctx,
    wrapText(
      props.agent.legalDisclaimer.trim() || props.legalDisclaimerFallback,
      regular,
      8,
      CONTENT_WIDTH,
    ),
    8,
    regular,
    rgb(0.35, 0.35, 0.4),
  );

  const bytes = await doc.save();
  triggerPdfDownload(bytes, props.address);
}
