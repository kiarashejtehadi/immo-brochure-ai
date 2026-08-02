import OpenAI from "openai";
import { NextResponse } from "next/server";
import { VOICE_PARSE_SANITIZATION_INSTRUCTION } from "@/lib/professional-tone-guardrail";
import type { VoiceParseResult } from "@/types/voice-parse";

export const runtime = "nodejs";
export const maxDuration = 60;

const PARSE_SYSTEM_PROMPT = `You extract structured real estate listing details from spoken transcripts.
Map values to the schema keys only when clearly stated or strongly implied.
Use null for any field not mentioned.
For numeric fields (size, rooms, netRent, utilityCharges), return digits only as strings without units or currency symbols.
For floorLevel, preserve natural phrasing (e.g. "3rd floor", "EG", "ground floor") using professional real estate terminology.

${VOICE_PARSE_SANITIZATION_INSTRUCTION}`;

const VOICE_PARSE_SCHEMA = {
  type: "object",
  properties: {
    streetAddress: { type: ["string", "null"] },
    postalCode: { type: ["string", "null"] },
    city: { type: ["string", "null"] },
    size: { type: ["string", "null"] },
    rooms: { type: ["string", "null"] },
    floorLevel: { type: ["string", "null"] },
    netRent: { type: ["string", "null"] },
    utilityCharges: { type: ["string", "null"] },
  },
  required: [
    "streetAddress",
    "postalCode",
    "city",
    "size",
    "rooms",
    "floorLevel",
    "netRent",
    "utilityCharges",
  ],
  additionalProperties: false,
} as const;

function parseVoiceResult(raw: string): VoiceParseResult {
  const parsed = JSON.parse(raw) as Partial<VoiceParseResult>;
  return {
    streetAddress: typeof parsed.streetAddress === "string" ? parsed.streetAddress : null,
    postalCode: typeof parsed.postalCode === "string" ? parsed.postalCode : null,
    city: typeof parsed.city === "string" ? parsed.city : null,
    size: typeof parsed.size === "string" ? parsed.size : null,
    rooms: typeof parsed.rooms === "string" ? parsed.rooms : null,
    floorLevel: typeof parsed.floorLevel === "string" ? parsed.floorLevel : null,
    netRent: typeof parsed.netRent === "string" ? parsed.netRent : null,
    utilityCharges:
      typeof parsed.utilityCharges === "string" ? parsed.utilityCharges : null,
  };
}

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "listing_voice_parse",
          strict: true,
          schema: VOICE_PARSE_SCHEMA,
        },
      },
      messages: [
        { role: "system", content: PARSE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Extract structured real estate listing details from the transcript and map them to the following keys:
- streetAddress
- postalCode
- city
- size
- rooms
- floorLevel
- netRent
- utilityCharges

Transcript:
${transcript}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty structured parse response");
    }

    const fields = parseVoiceResult(content);
    return NextResponse.json({ transcript, fields });
  } catch (err) {
    console.error("[api/parse-voice]", err);
    const message = err instanceof Error ? err.message : "Failed to parse voice input";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
