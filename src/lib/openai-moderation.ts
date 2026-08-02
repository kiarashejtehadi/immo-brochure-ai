import OpenAI from "openai";

export const CONTENT_FLAGGED_ERROR =
  "Content flagged: Please ensure all property details contain appropriate, professional language.";

export class ModerationBlockedError extends Error {
  constructor(message = CONTENT_FLAGGED_ERROR) {
    super(message);
    this.name = "ModerationBlockedError";
  }
}

export async function assertContentNotFlagged(
  openai: OpenAI,
  text: string,
): Promise<void> {
  const input = text.trim();
  if (!input) return;

  const moderation = await openai.moderations.create({ input });
  if (moderation.results[0]?.flagged) {
    throw new ModerationBlockedError();
  }
}

export async function moderateTexts(openai: OpenAI, texts: string[]): Promise<void> {
  const combined = texts.map((t) => t.trim()).filter(Boolean).join("\n");
  await assertContentNotFlagged(openai, combined);
}
