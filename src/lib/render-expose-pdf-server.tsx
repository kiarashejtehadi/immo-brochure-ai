import { renderToBuffer } from "@react-pdf/renderer";
import { ExposePdfDocument } from "@/components/expose-pdf-document";
import { ensurePdfFontsReady } from "@/lib/pdf-fonts";
import type { BrochurePdfProps } from "@/types/brochure-pdf";

/** Render the exposé PDF on the server into a Node buffer. */
export async function renderExposePdfBuffer(props: BrochurePdfProps): Promise<Buffer> {
  ensurePdfFontsReady(props.fontFamily);
  const element = <ExposePdfDocument {...props} />;
  return renderToBuffer(element);
}
