import OpenAI from "openai";
import { NextResponse } from "next/server";
import { sanitizeVoiceParseResult } from "@/lib/listing-spec-validation";
import {
  CONTENT_FLAGGED_ERROR,
  ModerationBlockedError,
  assertContentNotFlagged,
} from "@/lib/openai-moderation";
import { VOICE_PARSE_SANITIZATION_INSTRUCTION } from "@/lib/professional-tone-guardrail";
import {
  VOICE_PARSE_JSON_SCHEMA,
  VOICE_PARSE_SYSTEM_PROMPT,
  buildVoiceParseUserPrompt,
  finalizeVoiceParseResult,
  parseCurrentListingType,
  parseVoiceParseResult,
} from "@/lib/voice/voice-parse-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const PARSE_SYSTEM_PROMPT = `${VOICE_PARSE_SYSTEM_PROMPT}

${VOICE_PARSE_SANITIZATION_INSTRUCTION}`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key is not configured." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });
  }

  const audio = formData.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Missing audio recording." }, { status: 400 });
  }

  const currentListingType = parseCurrentListingType(formData.get("currentListingType"));

  const openai = new OpenAI({ apiKey, timeout: 55_000, maxRetries: 1 });

  try {
    const mimeType = audio.type || "audio/webm";
    const extension = mimeType.includes("mp4")
      ? "mp4"
      : mimeType.includes("ogg")
        ? "ogg"
        : mimeType.includes("wav")
          ? "wav"
          : "webm";

    const file = new File([audio], `recording.${extension}`, { type: mimeType });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    const transcript = transcription.text?.trim();
    if (!transcript) {
      return NextResponse.json({ error: "No speech detected in recording." }, { status: 422 });
    }

    try {
      await assertContentNotFlagged(openai, transcript);
    } catch (err) {
      if (err instanceof ModerationBlockedError) {
        return NextResponse.json({ error: CONTENT_FLAGGED_ERROR }, { status: 400 });
      }
      throw err;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "listing_voice_parse",
          strict: true,
          schema: VOICE_PARSE_JSON_SCHEMA,
        },
      },
      messages: [
        { role: "system", content: PARSE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildVoiceParseUserPrompt(transcript, currentListingType),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty structured parse response");
    }

    const fields = finalizeVoiceParseResult(
      sanitizeVoiceParseResult(parseVoiceParseResult(content)),
      currentListingType,
    );
    return NextResponse.json({ transcript, fields });
  } catch (err) {
    console.error("[api/parse-voice]", err);
    const message = err instanceof Error ? err.message : "Failed to parse voice input";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
