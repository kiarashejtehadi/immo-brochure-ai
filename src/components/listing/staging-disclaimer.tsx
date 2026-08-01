import { cn } from "@/lib/utils";

export function StagingDisclaimerFooter({ text }: { text: string }) {
  return (
    <p
      className={cn(
        "rounded-lg border border-amber-200/90 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950",
        "dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100",
      )}
    >
      {text}
    </p>
  );
}
