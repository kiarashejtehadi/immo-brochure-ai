"use client";

import { PreviewEditableBlock } from "@/components/listing/preview-editable-fields";
import { StagingDisclaimerFooter } from "@/components/listing/staging-disclaimer";
import type { FormCopy } from "@/lib/i18n-form";

type PreviewLocationPanelProps = {
  copy: FormCopy;
  locationDescription: string;
  onChange: (value: string) => void;
  furnishingDisclaimerText: string | null | undefined;
  actions?: React.ReactNode;
};

export function PreviewLocationPanel({
  copy,
  locationDescription,
  onChange,
  furnishingDisclaimerText,
  actions,
}: PreviewLocationPanelProps) {
  return (
    <div className="space-y-4">
      <PreviewEditableBlock
        label={copy.locationLabel}
        value={locationDescription}
        onChange={onChange}
        minRows={5}
        actions={actions}
      />
      {furnishingDisclaimerText ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
            {copy.stagingDisclaimerLabel}
          </p>
          <StagingDisclaimerFooter text={furnishingDisclaimerText} />
        </div>
      ) : null}
    </div>
  );
}
