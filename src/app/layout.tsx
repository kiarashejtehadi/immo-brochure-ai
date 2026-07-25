import type { ReactNode } from "react";

/** Pass-through root layout; `[locale]/layout` provides `<html>` and `<body>`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
