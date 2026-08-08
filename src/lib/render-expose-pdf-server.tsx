import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { ExposePdfDocument } from "@/components/expose-pdf-document";
import { ensurePdfFontsReady } from "@/lib/pdf-fonts";
import { resolvePdfMapDataUrl } from "@/lib/location/static-map";
import type { BrochurePdfProps } from "@/types/brochure-pdf";

type PdfInstance = ReturnType<typeof pdf>;

/** React 19 mounts the react-pdf tree asynchronously — wait before rendering. */
async function waitForPdfDocument(instance: PdfInstance, ms = 10_000): Promise<void> {
  const started = Date.now();

  while (!instance.container.document) {
    if (Date.now() - started > ms) {
      throw new Error("PDF document mount timeout");
    }
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

/** Render the exposé PDF on the server into a Node buffer. */
export async function renderExposePdfBuffer(props: BrochurePdfProps): Promise<Buffer> {
  const mapDataUrl = await resolvePdfMapDataUrl({
    listingAddress: props.listingAddress,
    addressQuery: props.address,
    locationCoords: props.locationCoords,
  });
  const propsWithMap = mapDataUrl ? { ...props, mapDataUrl } : props;

  ensurePdfFontsReady(propsWithMap.fontFamily);
  const instance = pdf(createElement(ExposePdfDocument, propsWithMap));
  await waitForPdfDocument(instance);
  const stream = await instance.toBuffer();
  return streamToBuffer(stream);
}
