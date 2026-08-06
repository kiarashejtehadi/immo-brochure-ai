import { ANTI_DISCRIMINATION_SYSTEM_INSTRUCTION } from "@/lib/compliance-guardrail";
import {
  collectGenerateModerationText,
  validateListingSpecs,
} from "@/lib/listing-spec-validation";
import {
  CONTENT_FLAGGED_ERROR,
  ModerationBlockedError,
  moderateTexts,
} from "@/lib/openai-moderation";
import { GENERATION_SAFETY_INSTRUCTIONS } from "@/lib/professional-tone-guardrail";
import { MAX_VISION_IMAGES } from "@/lib/generate-vision";
import {
  buildFurnishingSystemInstruction,
  buildVisionAnalysisNote,
  hasFittedKitchen,
} from "@/lib/furnishing-guardrail";
import {
  buildAddressDataPayload,
  formatFullListingAddress,
  formatPublicListingAddress,
  normalizeListingAddress,
} from "@/lib/location/format-address";
import { buildAddressPrivacyInstructions } from "@/lib/location/address-privacy-prompt";
import { fetchLocationEnrichment } from "@/lib/location/geocode-pois";
import { buildLocationPromptInstructions, buildLocationContextPayload } from "@/lib/location/location-prompt";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { formatPriceAmount, normalizeCurrency } from "@/lib/currency";
import type { OutputLanguage } from "@/lib/i18n";
import { getCaptionHashtags, normalizeOutputLanguage } from "@/lib/output-language";
import type { GenerateResult, GenerateRequestPayload, ListingAddress } from "@/types/listing";
import { isBillingEnabled } from "@/lib/billing/config";
import { getSessionUser, resolveBillingAccess } from "@/lib/billing/access";
import { isTrialOnlyCredits } from "@/lib/billing/client-access";
import {
  decrementCredit,
  getTrialCredits,
  getUserCredits,
  logGeneration,
} from "@/lib/billing/repository";

export const runtime = "nodejs";
export const maxDuration = 90;

const LOCATION_ENRICHMENT_BUDGET_MS = 6_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

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

function buildPropertyPayload(
  body: GenerateRequestPayload,
  outputLanguage: OutputLanguage,
  listingAddress: ListingAddress,
  formattedAddress: string,
  publicAddress: string,
  locationContext: ReturnType<typeof buildLocationContextPayload>,
) {
  const currency = normalizeCurrency(body.currency);
  const format = (amount: string) =>
    amount.trim()
      ? formatPriceAmount(amount, currency)
      : "Not specified";

  const property = body.property ?? {
    propertyType: "",
    floorLevel: "",
    parking: "",
    parkingFee: "",
    condition: "",
    furnishingStatus: "unfurnished",
    isStagedOrModel: false,
  };

  const furnishingStatus = property.furnishingStatus ?? "unfurnished";
  const isStagedOrModel = property.isStagedOrModel === true;
  const fittedKitchen = hasFittedKitchen(body.features ?? []);

  const addressData = buildAddressDataPayload(listingAddress);

  const common = {
    transactionType: body.transactionType,
    targetLanguage: outputLanguage,
    address: publicAddress || formattedAddress || "Not specified",
    addressData,
    streetAddress: listingAddress.streetAddress.trim() || "Not specified",
    houseNumber: listingAddress.houseNumber.trim() || "Not specified",
    unitNumber: listingAddress.unitNumber.trim() || "Not specified",
    postalCode: listingAddress.postalCode.trim() || "Not specified",
    city: listingAddress.city.trim() || "Not specified",
    country: listingAddress.country.trim() || "Not specified",
    propertyType: property.propertyType || "Not specified",
    floorLevel: property.floorLevel?.trim() || "Not specified",
    parking: property.parking || "Not specified",
    parkingFee: property.parkingFee?.trim()
      ? format(property.parkingFee)
      : "Not specified",
    condition: property.condition || "Not specified",
    furnishingStatus,
    isStagedOrModel,
    hasFittedKitchen: fittedKitchen,
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
    locationContext,
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

  let billingUserId: string | null = null;
  let useCreditForGeneration = false;

  if (isBillingEnabled()) {
    const access = await resolveBillingAccess();
    if (!access.allowed) {
      const status = access.reason === "unauthenticated" ? 401 : 402;
      return NextResponse.json(
        {
          error:
            access.reason === "unauthenticated"
              ? "Sign in to generate exposés."
              : "Active subscription or credits required.",
          code: access.reason,
        },
        { status },
      );
    }

    const authUser = await getSessionUser();
    billingUserId = authUser?.id ?? null;
    if (!billingUserId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    if (!access.hasActiveSubscription) {
      useCreditForGeneration = true;
    }
  }

  let body: GenerateRequestPayload;
  try {
    body = (await request.json()) as GenerateRequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const specValidation = validateListingSpecs(body);
  if (!specValidation.ok) {
    return NextResponse.json(
      { error: specValidation.error, code: "validation_error", field: specValidation.field },
      { status: 400 },
    );
  }

  body = {
    ...body,
    size: specValidation.size,
    rooms: specValidation.rooms,
  };

  const openai = new OpenAI({ apiKey, timeout: 90_000, maxRetries: 1 });

  const listingAddress = normalizeListingAddress(body.address);
  const formattedAddress = formatFullListingAddress(listingAddress);

  const outputLanguage = normalizeOutputLanguage(body.targetLanguage);
  const instagramTags = getCaptionHashtags(outputLanguage);

  let locationRules = buildLocationPromptInstructions(listingAddress, null, outputLanguage);
  const enrichmentTask = fetchLocationEnrichment(listingAddress).catch((err) => {
    console.warn("[api/generate] location enrichment failed", err);
    return null;
  });

  try {
    await moderateTexts(openai, [collectGenerateModerationText(body)]).catch((err) => {
      if (err instanceof ModerationBlockedError) throw err;
      console.warn("[api/generate] moderation skipped", err);
    });
  } catch (err) {
    if (err instanceof ModerationBlockedError) {
      return NextResponse.json({ error: CONTENT_FLAGGED_ERROR }, { status: 400 });
    }
    throw err;
  }

  const enrichment = await withTimeout(enrichmentTask, LOCATION_ENRICHMENT_BUDGET_MS, null);
  const locationContext = buildLocationContextPayload(
    listingAddress,
    enrichment,
    outputLanguage,
  );
  const publicAddress = formatPublicListingAddress(
    listingAddress,
    locationContext.districtContext,
  );
  const addressData = buildAddressDataPayload(listingAddress);
  const addressPrivacyRules = buildAddressPrivacyInstructions(
    listingAddress,
    addressData,
    outputLanguage,
    locationContext.districtContext,
  );
  if (enrichment) {
    locationRules = buildLocationPromptInstructions(
      listingAddress,
      enrichment,
      outputLanguage,
    );
  }

  const propertyPayload = buildPropertyPayload(
    body,
    outputLanguage,
    listingAddress,
    formattedAddress,
    publicAddress,
    locationContext,
  );

  const images = (body.images ?? []).slice(0, MAX_VISION_IMAGES);
  const furnishingStatus = body.property?.furnishingStatus ?? "unfurnished";
  const isStagedOrModel = body.property?.isStagedOrModel === true;
  const fittedKitchen = hasFittedKitchen(body.features ?? []);
  const furnishingRules = buildFurnishingSystemInstruction({
    furnishingStatus,
    isStagedOrModel,
    hasFittedKitchen: fittedKitchen,
    hasImages: images.length > 0,
  });

  const photoVisionNote =
    images.length > 0
      ? `\n${images.length} property photo(s) are attached below. ${buildVisionAnalysisNote({
          furnishingStatus,
          isStagedOrModel,
          hasFittedKitchen: fittedKitchen,
        })}\n`
      : "";

  const descriptionWordRange = images.length > 0 ? "280-380" : "250-350";
  const locationWordRange = images.length > 0 ? "90-140" : "80-120";

  const userText = `You are creating a multi-page real estate exposé and social pack.

Property data (JSON):
${JSON.stringify(propertyPayload, null, 2)}
${photoVisionNote}
Write ALL output exclusively in ${outputLanguage}.

Return JSON with:
- title: compelling marketing headline for cover page
- summary: array of 4-6 short bullet highlights for specs sidebar
- fullDescription: multi-paragraph narrative exposé (${descriptionWordRange} words), include room/flow descriptions where data allows
- locationDescription: neighborhood & connectivity paragraph (${locationWordRange} words)
- socialCaptions object with:
  - instagram: engaging caption with hashtags (${instagramTags.join(" ")})
  - linkedin: professional post (no hashtag spam)
  - facebook: short teaser suitable for Facebook or WhatsApp (~2-3 sentences)

Audience: ${propertyPayload.audience}. Emphasize: ${propertyPayload.copyFocus}.
Use only provided facts and observed details from the attached photos; do not invent certificates or prices not in JSON.
If energy certificate is "na", omit claiming specific energy class values.

${furnishingRules}

${addressPrivacyRules}

${locationRules}

${GENERATION_SAFETY_INSTRUCTIONS}

${ANTI_DISCRIMINATION_SYSTEM_INSTRUCTION}

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

  const systemContent = `Expert multilingual real estate copywriter. Return valid JSON only. Language: ${outputLanguage}.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.65,
      max_tokens: images.length > 0 ? 2200 : 1800,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    if (billingUserId) {
      if (useCreditForGeneration) {
        const remainingBefore = await getUserCredits(billingUserId);
        const trialBefore = await getTrialCredits(billingUserId);
        const dec = await decrementCredit(billingUserId);
        if (dec === null) {
          return NextResponse.json(
            { error: "No credits remaining.", code: "payment_required" },
            { status: 402 },
          );
        }
        await logGeneration(billingUserId, true);
        const parsed = parseGenerateResult(content, instagramTags);
        return NextResponse.json({
          ...parsed,
          watermarkPdf: isTrialOnlyCredits(remainingBefore, trialBefore),
        });
      }
      await logGeneration(billingUserId, false);
    }

    const parsed = parseGenerateResult(content, instagramTags);
    return NextResponse.json({
      ...parsed,
      watermarkPdf: false,
    });
  } catch (err) {
    console.error("[api/generate]", err);
    const message = err instanceof Error ? err.message : "Failed to generate content";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
