import type { FeatureKey } from "@/lib/i18n";
import type { FurnishingStatus } from "@/types/listing";

export function hasFittedKitchen(features: FeatureKey[]): boolean {
  return features.includes("Fitted Kitchen");
}

export function shouldShowFurnishingDisclaimer(
  furnishingStatus: FurnishingStatus,
  imageCount: number,
): boolean {
  return (
    imageCount > 0 &&
    (furnishingStatus === "unfurnished" || furnishingStatus === "partially_furnished")
  );
}

/** @deprecated Use shouldShowFurnishingDisclaimer */
export function shouldShowStagingDisclaimer(
  furnishingStatus: FurnishingStatus,
  imageCount: number,
): boolean {
  return shouldShowFurnishingDisclaimer(furnishingStatus, imageCount);
}

export type FurnishingDisclaimerCopy = {
  stagingDisclaimerUnfurnished: string;
  stagingDisclaimerPartially: string;
};

export function getFurnishingDisclaimerText(
  furnishingStatus: FurnishingStatus,
  imageCount: number,
  copy: FurnishingDisclaimerCopy,
): string | undefined {
  if (!shouldShowFurnishingDisclaimer(furnishingStatus, imageCount)) return undefined;

  if (furnishingStatus === "partially_furnished") {
    return copy.stagingDisclaimerPartially;
  }

  return copy.stagingDisclaimerUnfurnished;
}

export function furnishingStoryDisclaimerSentence(
  furnishingStatus: FurnishingStatus,
): string | undefined {
  if (furnishingStatus === "unfurnished") {
    return "Note: Interior furniture shown is for staging/visualization purposes only; the unit is offered unfurnished.";
  }
  if (furnishingStatus === "partially_furnished") {
    return "Note: Interior furniture shown is for staging purposes only. The unit is delivered partially furnished with built-in fixtures as specified.";
  }
  return undefined;
}

export function buildFurnishingSystemInstruction(input: {
  furnishingStatus: FurnishingStatus;
  isStagedOrModel: boolean;
  hasFittedKitchen: boolean;
  hasImages: boolean;
}): string {
  const furnishingRule =
    input.furnishingStatus === "unfurnished"
      ? `1. FURNISHING TRUTH:
   - furnishingStatus is 'unfurnished': You MUST NOT mention or describe loose furniture, tables, chairs, sofas, art, or temporary decor shown in the images. Clarify that any furniture shown in photos is for staging or visualization purposes only. Focus strictly on permanent physical features: layout, wall space, flooring, windows, natural lighting, and room dimensions.`
      : input.furnishingStatus === "partially_furnished"
        ? `1. FURNISHING TRUTH:
   - furnishingStatus is 'partially_furnished': Only describe furniture or appliances explicitly indicated in form data. Do not invent additional loose furnishings visible in photos unless they are clearly permanent built-ins.`
        : `1. FURNISHING TRUTH:
   - furnishingStatus is 'fully_furnished': You may describe visible furnishings in photos, but do not invent items not shown and do not contradict form data.`;

  const kitchenRule = input.hasFittedKitchen
    ? `2. KITCHEN & APPLIANCE ACCURACY:
   - 'Fitted Kitchen (EBK)' is selected in form features: You may describe integrated kitchen fittings shown in photos, but do NOT invent specific appliance brands or luxury items not visible.`
    : `2. KITCHEN & APPLIANCE ACCURACY:
   - Do NOT assume appliances (refrigerators, dishwashers, high-end ovens) are included unless 'Fitted Kitchen (EBK)' is toggled ON in form features. If no fitted kitchen is selected, describe the kitchen space strictly as 'kitchen area' or 'hookups available' rather than assuming sleek cabinetry or high-end appliances exist.`;

  const needsStoryDisclaimer =
    input.isStagedOrModel ||
    ((input.furnishingStatus === "unfurnished" ||
      input.furnishingStatus === "partially_furnished") &&
      input.hasImages);

  const storyDisclaimer = furnishingStoryDisclaimerSentence(input.furnishingStatus);

  const stagingRule =
    needsStoryDisclaimer && storyDisclaimer
      ? `3. MODEL / VIRTUAL STAGING DISCLAIMER:
   - If isStagedOrModel is true OR photos show furnished rooms while furnishingStatus is unfurnished or partially_furnished: Add this exact sentence at the END of fullDescription (Property Story): "${storyDisclaimer}"`
      : "";

  return [
    "CRITICAL PHYSICAL PROPERTY RULES:",
    furnishingRule,
    kitchenRule,
    stagingRule,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildVisionAnalysisNote(input: {
  furnishingStatus: FurnishingStatus;
  isStagedOrModel: boolean;
  hasFittedKitchen: boolean;
}): string {
  const parts = [
    "Examine the attached property photos for permanent physical characteristics only (layout, flooring, windows, lighting, built-in fixtures).",
  ];

  if (input.furnishingStatus === "unfurnished" || input.isStagedOrModel) {
    parts.push(
      "Ignore loose furniture, staging decor, and temporary styling when writing copy — treat visible furnishings as illustrative only unless furnishingStatus is fully_furnished.",
    );
  }

  if (!input.hasFittedKitchen) {
    parts.push(
      "Do not describe kitchen appliances or fitted cabinetry unless clearly visible as permanent built-ins; form data does not include Fitted Kitchen (EBK).",
    );
  }

  return parts.join(" ");
}
