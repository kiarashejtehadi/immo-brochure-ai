import type { ContactFormPayload } from "@/lib/contact/validate-contact-form";

const TOPIC_LABELS: Record<ContactFormPayload["topic"], string> = {
  general_support: "General Support / Legal Inquiry",
  feedback: "Feedback",
  feature_request: "Feature Request",
  bug_report: "Report an Issue / Bug",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatContactEmailSubject(data: ContactFormPayload): string {
  const topic = TOPIC_LABELS[data.topic];
  return `[ImmoCaption AI Contact] ${topic}`;
}

export function formatContactEmailHtml(data: ContactFormPayload): string {
  const topic = TOPIC_LABELS[data.topic];
  const name = data.name.trim() || "—";

  return `
    <h2>New contact form submission</h2>
    <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(data.message)}</pre>
  `.trim();
}
