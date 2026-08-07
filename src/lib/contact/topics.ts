export const CONTACT_TOPICS = [
  "general_support",
  "feedback",
  "feature_request",
  "bug_report",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export function isContactTopic(value: string): value is ContactTopic {
  return (CONTACT_TOPICS as readonly string[]).includes(value);
}
