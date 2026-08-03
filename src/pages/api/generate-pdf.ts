import type { NextApiRequest, NextApiResponse } from "next";
import { renderExposePdfBuffer } from "@/lib/render-expose-pdf-server";
import { parseBrochurePdfProps } from "@/lib/validate-brochure-pdf-props";
import { withTimeout } from "@/lib/promise-timeout";

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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

/** Pages Router handler — avoids App Router RSC bundling that breaks @react-pdf/renderer. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const props = parseBrochurePdfProps(req.body);
    if (!props) {
      return res.status(400).json({
        error: "Invalid PDF payload. Expected listing JSON with photos and branding.",
      });
    }

    const buffer = await withTimeout(
      renderExposePdfBuffer(props),
      PDF_RENDER_TIMEOUT_MS,
      "PDF render timed out on server",
    );

    const filename = pdfFilename(props.address);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("[api/generate-pdf]", err);
    return res.status(500).json({ error: "Failed to generate PDF on server." });
  }
}
