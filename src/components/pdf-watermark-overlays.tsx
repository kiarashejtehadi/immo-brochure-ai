import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { sanitizePdfImageSrc } from "@/lib/pdf-image-data-url";
import {
  PDF_WATERMARK_BRAND,
  PDF_WATERMARK_STAMP,
  PDF_WATERMARK_TEXT,
} from "@/lib/branding/constants";

const wm = StyleSheet.create({
  imageFrame: {
    position: "relative",
    overflow: "hidden",
  },
  diagonalLarge: {
    position: "absolute",
    fontSize: 34,
    color: "#c7d2fe",
    fontWeight: 700,
    transform: "rotate(-32deg)",
  },
  diagonalMedium: {
    position: "absolute",
    fontSize: 22,
    color: "#ddd6fe",
    fontWeight: 700,
    transform: "rotate(-32deg)",
  },
  imageDiagonal: {
    fontSize: 22,
    color: "#6366f1",
    fontWeight: 700,
    transform: "rotate(-24deg)",
  },
  imageStamp: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#818cf8",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  imageStampText: {
    fontSize: 7,
    color: "#3730a3",
    fontWeight: 700,
  },
  imageCorner: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#a5b4fc",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  imageCornerText: {
    fontSize: 6,
    color: "#4338ca",
    fontWeight: 700,
  },
  textStamp: {
    position: "absolute",
    left: 40,
    right: 40,
    borderWidth: 1,
    borderColor: "#a5b4fc",
    borderStyle: "dashed",
    backgroundColor: "#f5f3ff",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  textStampLabel: {
    fontSize: 8,
    color: "#4338ca",
    textAlign: "center",
    fontWeight: 700,
  },
});

/** Large diagonal marks behind page content. */
export function PageBackdropWatermarks({ page }: { page: 1 | 2 | 3 | 4 }) {
  if (page === 1) {
    return (
      <View>
        <Text style={[wm.diagonalLarge, { top: 280, left: 50 }]}>{PDF_WATERMARK_BRAND}</Text>
        <Text style={[wm.diagonalMedium, { top: 480, left: 130 }]}>FREE TIER</Text>
      </View>
    );
  }
  if (page === 2) {
    return (
      <View>
        <Text style={[wm.diagonalLarge, { top: 300, left: 40 }]}>{PDF_WATERMARK_BRAND}</Text>
        <Text style={[wm.diagonalMedium, { top: 560, left: 100 }]}>FREE TIER</Text>
      </View>
    );
  }
  if (page === 3) {
    return (
      <View>
        <Text style={[wm.diagonalLarge, { top: 260, left: 55 }]}>{PDF_WATERMARK_BRAND}</Text>
        <Text style={[wm.diagonalMedium, { top: 520, left: 115 }]}>FREE TIER</Text>
      </View>
    );
  }
  return (
    <View>
      <Text style={[wm.diagonalLarge, { top: 280, left: 50 }]}>{PDF_WATERMARK_BRAND}</Text>
      <Text style={[wm.diagonalMedium, { top: 540, left: 120 }]}>FREE TIER</Text>
    </View>
  );
}

/** Stamps overlaid on text areas. */
export function TextAreaWatermark({ top }: { top: number }) {
  return (
    <View style={[wm.textStamp, { top }]}>
      <Text style={wm.textStampLabel}>{PDF_WATERMARK_TEXT}</Text>
    </View>
  );
}

export function WatermarkedImage({
  src,
  frameStyle,
  imageStyle,
  showWatermark,
  diagonalSize = 22,
}: {
  src: string;
  frameStyle?: Style;
  imageStyle: Style;
  showWatermark: boolean;
  diagonalSize?: number;
}) {
  const safeSrc = sanitizePdfImageSrc(src);
  if (!safeSrc) return null;

  return (
    <View style={frameStyle ? [wm.imageFrame, frameStyle] : wm.imageFrame}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={safeSrc} style={imageStyle} />
      {showWatermark ? (
        <View>
          <View
            style={{
              position: "absolute",
              top:
                (typeof imageStyle.height === "number" ? imageStyle.height : 100) / 2 -
                diagonalSize / 2,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <Text style={[wm.imageDiagonal, { fontSize: diagonalSize }]}>{PDF_WATERMARK_BRAND}</Text>
          </View>
          <View style={wm.imageStamp}>
            <Text style={wm.imageStampText}>{PDF_WATERMARK_STAMP}</Text>
          </View>
          <View style={wm.imageCorner}>
            <Text style={wm.imageCornerText}>{PDF_WATERMARK_BRAND}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
