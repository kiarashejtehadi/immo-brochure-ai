import OpenAI from "openai";
import { NextResponse } from "next/server";
import { formatPriceAmount, normalizeCurrency } from "@/lib/currency";
import type { OutputLanguage } from "@/lib/i18n";
import { getCaptionHashtags, normalizeOutputLanguage } from "@/lib/output-language";
import type { GenerateResult, GenerateRequestPayload } from "@/types/listing";

export const runtime = "nodejs";
export const maxDuration = 90;

function ensureHashtags(caption: string, tags: string[]): string {
  let text = caption.trim();
  for (const tag of tags) {
    if (!text.includes(tag)) text = `${text} ${tag}`;
  }
  return text.trim();
}

function parseGenerateResult(raw: string, instagramTags: string[]): GenerateResult {
  const parsed = JSON.parse(raw) as {
    title?: string;
    summary?: unknown;
    fullDescription?: string;
    locationDescription?: string;
    socialCaptions?: {
      instagram?: string;
      linkedin?: string;
      facebook?: string;
    };
  };

  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const fullDescription =
    typeof parsed.fullDescription === "string"
      ? parsed.fullDescription.trim()
      : "";
  const locationDescription =
    typeof parsed.locationDescription === "string"
      ? parsed.locationDescription.trim()
      : "";

  const summary = Array.isArray(parsed.summary)
    ? parsed.summary
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const sc = parsed.socialCaptions ?? {};
  const instagram =
    typeof sc.instagram === "string"
      ? ensureHashtags(sc.instagram, instagramTags)
      : "";
  const linkedin = typeof sc.linkedin === "string" ? sc.linkedin.trim() : "";
  const facebook = typeof sc.facebook === "string" ? sc.facebook.trim() : "";

  if (!title || !fullDescription || !instagram || !linkedin || !facebook) {
    throw new Error("Invalid model response shape");
  }

  return {
    title,
    summary: summary.length > 0 ? summary.slice(0, 8) : [fullDescription.slice(0, 120)],
    fullDescription,
    locationDescription: locationDescription || "—",
    socialCaptions: { instagram, linkedin, facebook },
  };
}

function buildPropertyPayload(body: GenerateRequestPayload, outputLanguage: OutputLanguage) {
  const currency = normalizeCurrency(body.currency);
  const format = (amount: string) =>
    amount.trim()
      ? formatPriceAmount(amount, currency)
      : "Not specified";

  const common = {
    transactionType: body.transactionType,
    targetLanguage: outputLanguage,
    address: body.address?.trim() || "Not specified",
    sizeSqm: body.size?.trim() || "Not specified",
    rooms: body.rooms?.trim() || "Not specified",
    features: body.features?.length ? body.features.join(", ") : "None selected",
    tone: body.tone || "Professional",
    currency,
    energy: body.energy,
    agent: {
      name: body.agent.name || "Not specified",
      agency: body.agent.agency || "Not specified",
    },
  };

  if (body.transactionType === "rent") {
    return {
      ...common,
      audience: "prospective tenants",
      copyFocus:
        "lifestyle, move-in terms, public transport, schools, daily amenities, pet policy, lease terms",
      rent: {
        netColdRent: format(body.rent.netColdRent),
        utilityCharges: format(body.rent.utilityCharges),
        totalRent: format(body.rent.totalRent),
        securityDeposit: format(body.rent.securityDeposit),
        availableFrom: body.rent.availableFrom || "Not specified",
        minimumLeaseTerm: body.rent.minimumLeaseTerm || "Not specified",
        petPolicy: body.rent.petPolicy || "Not specified",
      },
    };
  }

  return {
    ...common,
    audience: "buyers and investors",
    copyFocus:
      "build quality, floor plan flow, long-term value, location growth, yield, Hausgeld, commission terms",
    sale: {
      purchasePrice: format(body.sale.purchasePrice),
      hoaFee: format(body.sale.hoaFee),
      rentalYield: body.sale.rentalYield || "Not specified",
      commissionTerms: body.sale.commissionTerms || "Not specified",
    },
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

  let body: GenerateRequestPayload;
  try {
    body = (await request.json()) as GenerateRequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const outputLanguage = normalizeOutputLanguage(body.targetLanguage);
  const instagramTags = getCaptionHashtags(outputLanguage);
  const propertyPayload = buildPropertyPayload(body, outputLanguage);

  const images = (body.images ?? []).slice(0, 5);
  const openai = new OpenAI({ apiKey, timeout: 90_000, maxRetries: 1 });

  const userText = `You are creating a multi-page real estate exposé and social pack.

Property data (JSON):
${JSON.stringify(propertyPayload, null, 2)}

Write ALL output exclusively in ${outputLanguage}.

Return JSON with:
- title: compelling marketing headline for cover page
- summary: array of 4-6 short bullet highlights for specs sidebar
- fullDescription: multi-paragraph narrative exposé (350-500 words), include room/flow descriptions where data allows
- locationDescription: neighborhood & connectivity paragraph (120-180 words)
- socialCaptions object with:
  - instagram: engaging caption with hashtags (${instagramTags.join(" ")})
  - linkedin: professional post (no hashtag spam)
  - facebook: short teaser suitable for Facebook or WhatsApp (~2-3 sentences)

Audience: ${propertyPayload.audience}. Emphasize: ${propertyPayload.copyFocus}.
Use only provided facts and visible photo cues; do not invent certificates or prices not in JSON.
If energy certificate is "na", omit claiming specific energy class values.

Schema:
{"title":"...","summary":["..."],"fullDescription":"...","locationDescription":"...","socialCaptions":{"instagram":"...","linkedin":"...","facebook":"..."}}`;

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
      temperature: 0.65,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Expert multilingual real estate copywriter. Valid JSON only. Language: ${outputLanguage}.`,
        },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    return NextResponse.json(parseGenerateResult(content, instagramTags));
  } catch (err) {
    console.error("[api/generate]", err);
    const message = err instanceof Error ? err.message : "Failed to generate content";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
