import { pdf } from "@react-pdf/renderer";
import {
  ExposePdfDocument,
  type ExposePdfDocumentProps,
} from "@/components/expose-pdf-document";
import { compressImageForUpload } from "@/lib/prepare-images";

async function fileToDataUrl(file: File): Promise<string> {
  const compressed = await compressImageForUpload(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image"));
    };
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(compressed);
  });
}

export async function downloadExposePdf(
  props: Omit<ExposePdfDocumentProps, "photoDataUrls"> & { photoFiles: File[] },
) {
  const photoDataUrls = await Promise.all(
    props.photoFiles.map((file) => fileToDataUrl(file)),
  );

  const docProps: ExposePdfDocumentProps = {
    address: props.address,
    price: props.price,
    size: props.size,
    rooms: props.rooms,
    features: props.features,
    tone: props.tone,
    exposeText: props.exposeText,
    photoDataUrls,
  };

  const blob = await pdf(<ExposePdfDocument {...docProps} />).toBlob();
  const url = URL.createObjectURL(blob);
  const slug =
    props.address
      .trim()
      .slice(0, 40)
      .replace(/[^\wäöüÄÖÜß\-]+/gi, "-")
      .replace(/-+/g, "-") || "immobilie";

  const link = document.createElement("a");
  link.href = url;
  link.download = `expose-${slug}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
