"use client";

import {
  PreviewCustomSectionsEditor,
  PreviewEditableBlock,
  PreviewEditableSummary,
} from "@/components/listing/preview-editable-fields";
import { StagingDisclaimerFooter } from "@/components/listing/staging-disclaimer";
import type { FormCopy } from "@/lib/i18n-form";
import type { GenerateResult } from "@/types/listing";

type PreviewStoryPanelProps = {
  copy: FormCopy;
  result: GenerateResult;
  onUpdateResult: (patch: Partial<GenerateResult>) => void;
  includeLegalDisclaimer: boolean;
  legalDisclaimer: string;
  onLegalDisclaimerChange: (value: string) => void;
  furnishingDisclaimerText: string | null | undefined;
  headlineActions?: React.ReactNode;
  descriptionActions?: React.ReactNode;
};

export function PreviewStoryPanel({
  copy,
  result,
  onUpdateResult,
  includeLegalDisclaimer,
  legalDisclaimer,
  onLegalDisclaimerChange,
  furnishingDisclaimerText,
  headlineActions,
  descriptionActions,
}: PreviewStoryPanelProps) {
  const customSections = result.customSections ?? [];

  return (
    <div className="space-y-4">
      <PreviewEditableBlock
        label={copy.headline}
        value={result.title}
        onChange={(title) => onUpdateResult({ title })}
        minRows={1}
        actions={headlineActions}
      />

      <PreviewEditableSummary
        label={copy.summaryLabel}
        items={result.summary}
        onChange={(summary) => onUpdateResult({ summary })}
        placeholder={copy.previewHighlightsPlaceholder}
      />

      <PreviewEditableBlock
        label={copy.fullDescriptionLabel}
        value={result.fullDescription}
        onChange={(fullDescription) => onUpdateResult({ fullDescription })}
        minRows={6}
        actions={descriptionActions}
      />

      {includeLegalDisclaimer ? (
        <PreviewEditableBlock
          label={copy.legalDisclaimer}
          value={legalDisclaimer}
          onChange={onLegalDisclaimerChange}
          minRows={3}
        />
      ) : null}

      {furnishingDisclaimerText ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
            {copy.stagingDisclaimerLabel}
          </p>
          <StagingDisclaimerFooter text={furnishingDisclaimerText} />
        </div>
      ) : null}

      <PreviewCustomSectionsEditor
        copy={copy}
        sections={customSections}
        onChange={(customSections) => onUpdateResult({ customSections })}
      />
    </div>
  );
}
