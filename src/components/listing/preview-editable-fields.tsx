"use client";

import { useCallback, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FormCopy } from "@/lib/i18n-form";
import type { PreviewCustomSection } from "@/types/listing";
import { cn } from "@/lib/utils";

export function previewInputClassName() {
  return cn(
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-800 outline-none transition",
    "focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-indigo-400",
  );
}

function AutoResizeTextarea({
  id,
  value,
  onChange,
  placeholder,
  minRows = 2,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const syncHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  return (
    <textarea
      id={id}
      ref={ref}
      rows={minRows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onInput={syncHeight}
      className={cn(previewInputClassName(), "resize-none overflow-hidden", className)}
    />
  );
}

export function PreviewEditableBlock({
  label,
  value,
  onChange,
  placeholder,
  minRows = 2,
  actions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{label}</span>
        {actions}
      </div>
      <AutoResizeTextarea value={value} onChange={onChange} placeholder={placeholder} minRows={minRows} />
    </div>
  );
}

export function PreviewEditableSummary({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const text = items.join("\n");

  return (
    <PreviewEditableBlock
      label={label}
      value={text}
      onChange={(next) =>
        onChange(
          next
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        )
      }
      placeholder={placeholder}
      minRows={3}
    />
  );
}

export function PreviewCustomSectionsEditor({
  copy,
  sections,
  onChange,
}: {
  copy: FormCopy;
  sections: PreviewCustomSection[];
  onChange: (sections: PreviewCustomSection[]) => void;
}) {
  function addSection() {
    onChange([
      ...sections,
      {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: "",
        body: "",
      },
    ]);
  }

  function updateSection(id: string, patch: Partial<PreviewCustomSection>) {
    onChange(sections.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  }

  function removeSection(id: string) {
    onChange(sections.filter((section) => section.id !== id));
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/60"
        >
          <div className="mb-3 flex items-start gap-2">
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder={copy.customNoteTitlePlaceholder}
              className={cn(previewInputClassName(), "font-medium")}
            />
            <button
              type="button"
              onClick={() => removeSection(section.id)}
              title={copy.removeCustomNote}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 p-2 text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              <span className="sr-only">{copy.removeCustomNote}</span>
            </button>
          </div>
          <AutoResizeTextarea
            value={section.body}
            onChange={(body) => updateSection(section.id, { body })}
            placeholder={copy.customNoteBodyPlaceholder}
            minRows={3}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-200"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {copy.addCustomNote}
      </button>
    </div>
  );
}
