import { isContactTopic, type ContactTopic } from "@/lib/contact/topics";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFormPayload = {
  topic: ContactTopic;
  name: string;
  email: string;
  message: string;
  userId?: string | null;
};

export type ContactFormValidationResult =
  | { ok: true; data: ContactFormPayload }
  | { ok: false; field: keyof ContactFormPayload | "form"; message: string };

function trimOptional(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateContactForm(
  body: unknown,
  context?: { sessionEmail?: string | null; sessionUserId?: string | null },
): ContactFormValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, field: "form", message: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const topicRaw = trimOptional(raw.topic);
  const name = trimOptional(raw.name);
  const message = trimOptional(raw.message);
  const sessionEmail = trimOptional(context?.sessionEmail);
  const sessionUserId = trimOptional(context?.sessionUserId);
  const email = sessionEmail || trimOptional(raw.email);

  if (!topicRaw || !isContactTopic(topicRaw)) {
    return { ok: false, field: "topic", message: "Please select a topic." };
  }

  if (!email) {
    return { ok: false, field: "email", message: "Email address is required." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, field: "email", message: "Please enter a valid email address." };
  }

  if (email.length > 254) {
    return { ok: false, field: "email", message: "Email address is too long." };
  }

  if (!message) {
    return { ok: false, field: "message", message: "Message is required." };
  }

  if (message.length < 10) {
    return {
      ok: false,
      field: "message",
      message: "Please enter at least 10 characters.",
    };
  }

  if (message.length > 5000) {
    return { ok: false, field: "message", message: "Message is too long (max 5,000 characters)." };
  }

  if (name.length > 200) {
    return { ok: false, field: "name", message: "Name is too long (max 200 characters)." };
  }

  return {
    ok: true,
    data: {
      topic: topicRaw,
      name,
      email,
      message,
      userId: sessionUserId || null,
    },
  };
}
