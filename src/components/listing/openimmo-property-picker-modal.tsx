"use client";

import type { FormCopy } from "@/lib/i18n-form";
import { openImmoPropertyLabel } from "@/lib/openimmo/apply-openimmo-import";
import { cn } from "@/lib/utils";
import type { OpenImmoImportResult } from "@/types/openimmo-import";

export type OpenImmoPropertyPickerModalProps = {
  copy: FormCopy;
  open: boolean;
  properties: OpenImmoImportResult[];
  onSelectProperty: (property: OpenImmoImportResult) => void;
  onClose: () => void;
};

export function OpenImmoPropertyPickerModal({
  copy,
  open,
  properties,
  onSelectProperty,
  onClose,
}: OpenImmoPropertyPickerModalProps) {
  if (!open) return null;

  function handleSelectProperty(property: OpenImmoImportResult) {
    onSelectProperty(property);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="openimmo-picker-title"
      onClick={onClose}
    >
      <div
        className="max-h-[min(80vh,32rem)] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 id="openimmo-picker-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {copy.openImmoPickPropertyTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{copy.openImmoPickPropertyHint}</p>
        </div>
        <ul className="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
          {properties.map((property, index) => (
            <li key={property.importId ?? `${property.title ?? "property"}-${index}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectProperty(property);
                }}
                className={cn(
                  "flex w-full flex-col rounded-xl px-4 py-3 text-left transition",
                  "hover:bg-indigo-50 dark:hover:bg-indigo-950/40",
                )}
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {openImmoPropertyLabel(property, index)}
                </span>
                {property.size || property.rooms ? (
                  <span className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {[property.size ? `${property.size} m²` : null, property.rooms ? `${property.rooms} rooms` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
