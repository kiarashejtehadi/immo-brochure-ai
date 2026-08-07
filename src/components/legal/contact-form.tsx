"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { inputClassName, labelClassName } from "@/components/listing/form-ui";
import { useCopyToast } from "@/components/ui/copy-toast";
import { CONTACT_TOPICS, type ContactTopic } from "@/lib/contact/topics";
import { readJsonResponse } from "@/lib/http/read-json-response";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<"topic" | "name" | "email" | "message" | "form", string>>;

export function ContactForm() {
  const t = useTranslations("contact");
  const tf = useTranslations("footer");
  const { showToast } = useCopyToast();

  const [topic, setTopic] = useState<ContactTopic | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const topicLabel = (value: ContactTopic) => {
    const map: Record<ContactTopic, string> = {
      general_support: t("topicGeneralSupport"),
      feedback: t("topicFeedback"),
      feature_request: t("topicFeatureRequest"),
      bug_report: t("topicBugReport"),
    };
    return map[value];
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, name, email, message }),
      });

      const data = await readJsonResponse<{
        ok?: boolean;
        error?: string;
        field?: keyof FieldErrors;
      }>(res, "Contact form");

      if (!res.ok) {
        const field = data.field;
        if (field && field !== "form") {
          setErrors({ [field]: data.error ?? t("submitError") });
        } else {
          setErrors({ form: data.error ?? t("submitError") });
        }
        return;
      }

      setTopic("");
      setName("");
      setEmail("");
      setMessage("");
      showToast(t("successToast"));
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : t("submitError"),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80"
      noValidate
    >
      <div>
        <label htmlFor="contact-topic" className={labelClassName()}>
          {t("topicLabel")} <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as ContactTopic | "")}
          required
          aria-invalid={Boolean(errors.topic || errors.form)}
          aria-describedby={errors.topic ? "contact-topic-error" : undefined}
          className={cn(
            inputClassName(),
            errors.topic && "border-red-400 focus:ring-red-500/20 dark:border-red-500",
          )}
        >
          <option value="">{t("topicPlaceholder")}</option>
          {CONTACT_TOPICS.map((value) => (
            <option key={value} value={value}>
              {topicLabel(value)}
            </option>
          ))}
        </select>
        {errors.topic ? (
          <p id="contact-topic-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.topic}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-name" className={labelClassName()}>
          {t("nameLabel")}{" "}
          <span className="font-normal text-zinc-500 dark:text-zinc-400">({t("optional")})</span>
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          maxLength={200}
          className={inputClassName()}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClassName()}>
          {t("emailLabel")} <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          required
          aria-invalid={Boolean(errors.email || errors.form)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={cn(
            inputClassName(),
            errors.email && "border-red-400 focus:ring-red-500/20 dark:border-red-500",
          )}
        />
        {errors.email ? (
          <p id="contact-email-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClassName()}>
          {t("messageLabel")} <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          required
          maxLength={5000}
          aria-invalid={Boolean(errors.message || errors.form)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={cn(
            inputClassName(),
            "resize-y",
            errors.message && "border-red-400 focus:ring-red-500/20 dark:border-red-500",
          )}
        />
        {errors.message ? (
          <p id="contact-message-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.message}
          </p>
        ) : null}
      </div>

      {errors.form ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errors.form}
        </p>
      ) : null}

      <div className="space-y-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition",
            "hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60",
            "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
          )}
        >
          {submitting ? t("submitting") : t("submit")}
        </button>

        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {t("legalNoticePrefix")}{" "}
          <Link href="/privacy" className="underline hover:text-zinc-700 dark:hover:text-zinc-200">
            {tf("privacy")}
          </Link>
          {t("legalNoticeSuffix")}
        </p>
      </div>
    </form>
  );
}
