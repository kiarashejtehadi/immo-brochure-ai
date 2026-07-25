import "@/app/globals.css";
import { fontClassNames } from "@/lib/fonts";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function BetaLoginLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontClassNames}>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
