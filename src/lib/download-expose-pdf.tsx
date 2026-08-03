import { pdf } from "@react-pdf/renderer";
import { ExposePdfDocument } from "@/components/expose-pdf-document";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { ensurePdfFontsReady } from "@/lib/pdf-fonts";
import { preparePdfImageProps } from "@/lib/pdf-image-data-url";
import { withTimeout } from "@/lib/promise-timeout";

/** Max time for @react-pdf/renderer to produce the PDF blob in the browser. */
export const PDF_RENDER_TIMEOUT_MS = 10_000;

export async function downloadExposePdf(
  props: BrochurePdfProps & {
    photoFiles: File[];
    floorPlanFile?: File | null;
  },
) {
  try {
    console.log("PDF: Preparing images...");
    ensurePdfFontsReady(props.fontFamily);

    const images = await preparePdfImageProps({
      photoFiles: props.photoFiles,
      floorPlanFile: props.floorPlanFile,
      logoDataUrl: props.logoDataUrl,
      avatarDataUrl: props.avatarDataUrl,
      mapDataUrl: props.mapDataUrl,
    });

    const docProps: BrochurePdfProps = {
      ...props,
      photoDataUrls: images.photoDataUrls,
      floorPlanDataUrl: images.floorPlanDataUrl,
      logoDataUrl: images.logoDataUrl,
      avatarDataUrl: images.avatarDataUrl,
      mapDataUrl: images.mapDataUrl,
    };

    console.log("PDF: Compiling React-PDF document tree...");
    const doc = <ExposePdfDocument {...docProps} />;

    console.log("PDF: Executing pdf(Doc).toBlob()...");
    const blob = await withTimeout(
      pdf(doc).toBlob(),
      PDF_RENDER_TIMEOUT_MS,
      "PDF render timed out",
    );

    console.log("PDF: Download ready");
    const url = URL.createObjectURL(blob);
    const slug =
      props.address
        .trim()
        .slice(0, 40)
        .replace(/[^\wäöüÄÖÜß\-]+/gi, "-")
        .replace(/-+/g, "-") || "expose";

    const link = document.createElement("a");
    link.href = url;
    link.download = `expose-${slug}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF: Generation failed", err);
    throw err;
  }
}
