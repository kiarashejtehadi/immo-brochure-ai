import type { AgentFormData } from "@/types/listing";
import {
  firstTextFromNode,
  getChildNode,
  getText,
} from "@/lib/openimmo/xml-node-utils";

function cleanAgentText(value: string): string {
  return value.trim();
}

/** Map OpenImmo `<kontaktperson>` (property or provider level) to agent form fields. */
export function extractOpenImmoAgent(
  immobilie: Record<string, unknown>,
  anbieter?: Record<string, unknown>,
): Partial<AgentFormData> {
  const kontakt =
    getChildNode(immobilie, "kontaktperson") ??
    getChildNode(anbieter, "kontaktperson") ??
    {};

  const vorname = getText(kontakt, "vorname");
  const nachname = firstTextFromNode(kontakt, "name", "nachname");
  const name = cleanAgentText([vorname, nachname].filter(Boolean).join(" "));

  const agency = cleanAgentText(
    firstTextFromNode(kontakt, "firma", "anrede_firma") ||
      getText(anbieter, "firma") ||
      getText(anbieter, "anbieterfirma"),
  );

  const companyAddress = cleanAgentText(
    [
      firstTextFromNode(kontakt, "strasse", "hausnummer"),
      [getText(kontakt, "plz"), getText(kontakt, "ort")].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", "),
  );

  const phone = cleanAgentText(
    firstTextFromNode(
      kontakt,
      "tel_handy",
      "tel_durchw",
      "tel_zentrale",
      "tel_fax",
      "telefon",
    ),
  );

  const email = cleanAgentText(
    firstTextFromNode(kontakt, "email_direkt", "email_zentrale", "email", "email_feedback"),
  );

  const licenseId = cleanAgentText(
    firstTextFromNode(kontakt, "immobilienmaklernummer", "zulassungsnummer", "weitergehende_informationen"),
  );

  return {
    ...(name ? { name } : {}),
    ...(agency ? { agency } : {}),
    ...(companyAddress ? { companyAddress } : {}),
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
    ...(licenseId ? { licenseId } : {}),
  };
}
