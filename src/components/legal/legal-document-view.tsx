import type { LegalDocument } from "@/types/legal-content";

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <header className="not-prose mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {document.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {document.description}
        </p>
      </header>
      {document.sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {section.title}
          </h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
              {p}
            </p>
          ))}
          {section.listItems && section.listItems.length > 0 ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
              {section.listItems.map((item) => (
                <li key={item.slice(0, 32)}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
