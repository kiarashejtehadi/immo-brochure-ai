import { NextResponse } from "next/server";
import { renderExposePdfBuffer } from "@/lib/render-expose-pdf-server";
import { parseBrochurePdfProps } from "@/lib/validate-brochure-pdf-props";
import { withTimeout } from "@/lib/promise-timeout";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDF_RENDER_TIMEOUT_MS = 45_000;

function pdfFilename(address: string): string {
  const slug =
    address
      .trim()
      .slice(0, 40)
      .replace(/[^\wäöüÄÖÜß\-]+/gi, "-")
      .replace(/-+/g, "-") || "expose";
  return `expose-${slug}.pdf`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const props = parseBrochurePdfProps(body);

    if (!props) {
      return NextResponse.json(
        { error: "Invalid PDF payload. Expected listing JSON with photos and branding." },
        { status: 400 },
      );
    }

    const buffer = await withTimeout(
      renderExposePdfBuffer(props),
      PDF_RENDER_TIMEOUT_MS,
      "PDF render timed out on server",
    );

    const filename = pdfFilename(props.address);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/generate-pdf]", err);
    return NextResponse.json(
      { error: "Failed to generate PDF on server." },
      { status: 500 },
    );
  }
}
