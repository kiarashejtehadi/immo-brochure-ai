import { Inter, Noto_Sans_Arabic } from "next/font/google";

/** Self-hosted at build time via next/font — no runtime requests to Google Fonts. */
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

/** RTL locales; also self-hosted by Next.js when needed. */
export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const fontClassNames = `${inter.variable} ${notoSansArabic.variable}`;
