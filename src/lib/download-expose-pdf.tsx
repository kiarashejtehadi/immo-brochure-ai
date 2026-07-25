import { pdf } from "@react-pdf/renderer";
import { ExposePdfDocument } from "@/components/expose-pdf-document";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
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
  props: BrochurePdfProps & {
    photoFiles: File[];
    floorPlanFile?: File | null;
  },
) {
  const photoDataUrls = await Promise.all(
    props.photoFiles.map((file) => fileToDataUrl(file)),
  );
  const floorPlanDataUrl = props.floorPlanFile
    ? await fileToDataUrl(props.floorPlanFile)
    : undefined;

  const docProps: BrochurePdfProps = {
    ...props,
    photoDataUrls,
    floorPlanDataUrl,
  };

  const blob = await pdf(<ExposePdfDocument {...docProps} />).toBlob();
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
}
