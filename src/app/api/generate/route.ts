import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export type GenerateRequestBody = {
  address?: string;
  price?: string;
  size?: string;
  rooms?: string;
  features?: string[];
  tone?: string;
  images?: { base64: string; mimeType: string }[];
};

export type GenerateResponseBody = {
  expose: string;
  instagramCaptions: [string, string];
};

const REQUIRED_HASHTAGS = ["#Immobilien", "#WohnungKaufen"] as const;

function withHashtags(caption: string): string {
  let text = caption.trim();
  for (const tag of REQUIRED_HASHTAGS) {
    if (!text.includes(tag)) {
      text = `${text} ${tag}`;
    }
  }
  return text.trim();
}

function parseResult(raw: string): GenerateResponseBody {
  const parsed = JSON.parse(raw) as {
    expose?: string;
    instagramCaptions?: unknown;
  };

  const expose = typeof parsed.expose === "string" ? parsed.expose.trim() : "";
  const captions = Array.isArray(parsed.instagramCaptions)
    ? parsed.instagramCaptions
        .filter((c): c is string => typeof c === "string")
        .map((c) => withHashtags(c.trim()))
        .filter(Boolean)
    : [];

  if (!expose || captions.length < 2) {
    throw new Error("Invalid model response shape");
  }

  return {
    expose,
    instagramCaptions: [captions[0], captions[1]],
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured on the server." },
      { status: 500 },
    );
  }

  let body: GenerateRequestBody;
  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const images = (body.images ?? []).slice(0, 3);
  const propertySummary = {
    address: body.address?.trim() || "Not specified",
    priceEur: body.price?.trim() || "Not specified",
    sizeSqm: body.size?.trim() || "Not specified",
    rooms: body.rooms?.trim() || "Not specified",
    features: body.features?.length ? body.features.join(", ") : "None selected",
    tone: body.tone || "Professional",
  };

  const openai = new OpenAI({ apiKey, timeout: 60_000, maxRetries: 1 });

  const userText = `Property data (JSON):
${JSON.stringify(propertySummary, null, 2)}

Write marketing copy in German for this listing.

1) expose: A formal German Exposé property description, approximately 200 words (180–220). Suitable for Immobilienportale and print. Match tone: "${propertySummary.tone}".
2) instagramCaptions: Exactly TWO distinct Instagram captions in German. Each must include the hashtags #Immobilien and #WohnungKaufen (plus 2–4 other relevant German real estate hashtags if appropriate). Match tone: "${propertySummary.tone}".

Rules:
- Use only facts from the data and visible photo details; do not invent amenities.
- If address or price is "Not specified", write copy that still works without them.

Respond with JSON only, no markdown:
{"expose":"...","instagramCaptions":["caption one","caption two"]}`;

  type ContentPart =
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail: "low" | "high" } };

  const userContent: ContentPart[] = [{ type: "text", text: userText }];
  for (const image of images) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${image.mimeType};base64,${image.base64}`,
        detail: "low",
      },
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert German real estate copywriter. You write formal exposés and social captions. Output valid JSON only.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return NextResponse.json(parseResult(content));
  } catch (err) {
    console.error("[api/generate]", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate content";
    const friendly =
      message.includes("timed out") || message.includes("Timeout")
        ? "OpenAI request timed out. Try again or use fewer/smaller photos."
        : message.includes("401") || message.toLowerCase().includes("incorrect api key")
          ? "Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local and restart the server."
          : message;
    return NextResponse.json({ error: friendly }, { status: 502 });
  }
}
