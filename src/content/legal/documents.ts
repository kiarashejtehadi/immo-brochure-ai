import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

function baseMeta(
  cfg: LegalBusinessConfig,
  locale: "en" | "de",
): Pick<
  LegalDocument,
  "locale" | "lastUpdated" | "isBindingMaster" | "showConvenienceNotice" | "bindingReferenceLocales"
> {
  return {
    locale,
    lastUpdated: cfg.lastUpdated,
    isBindingMaster: true,
    showConvenienceNotice: false,
    bindingReferenceLocales: ["en", "de"],
  };
}

export function buildImprintEn(cfg: LegalBusinessConfig): LegalDocument {
  const address = `${cfg.streetAddress}, ${cfg.postalCode} ${cfg.city}, ${cfg.country}`;
  return {
    kind: "imprint",
    title: "Legal Notice (Imprint)",
    description: "Information pursuant to § 5 DDG (German Telemedia Act) and § 18 MStV.",
    ...baseMeta(cfg, "en"),
    sections: [
      {
        id: "operator",
        title: "Service provider",
        paragraphs: [
          `${cfg.operatorName} (${cfg.legalForm})`,
          address,
        ],
      },
      {
        id: "contact",
        title: "Contact",
        paragraphs: [
          `Email: ${cfg.email}`,
          `Phone: ${cfg.phone}`,
        ],
      },
      {
        id: "vat",
        title: "VAT identification number",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "Responsible for content (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "EU dispute resolution",
        paragraphs: [
          "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/. We are not obliged or willing to participate in dispute resolution before a consumer arbitration board unless required by law.",
        ],
      },
    ],
  };
}

export function buildImprintDe(cfg: LegalBusinessConfig): LegalDocument {
  const address = `${cfg.streetAddress}, ${cfg.postalCode} ${cfg.city}, ${cfg.country}`;
  return {
    kind: "imprint",
    title: "Impressum",
    description: "Angaben gemäß § 5 DDG und § 18 Abs. 2 MStV.",
    ...baseMeta(cfg, "de"),
    sections: [
      {
        id: "operator",
        title: "Anbieter",
        paragraphs: [
          `${cfg.operatorName} (${cfg.legalForm})`,
          address,
        ],
      },
      {
        id: "contact",
        title: "Kontakt",
        paragraphs: [
          `E-Mail: ${cfg.email}`,
          `Telefon: ${cfg.phone}`,
        ],
      },
      {
        id: "vat",
        title: "Umsatzsteuer-ID",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "EU-Streitschlichtung",
        paragraphs: [
          "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen, sofern gesetzlich nicht erforderlich.",
        ],
      },
    ],
  };
}

export function buildPrivacyEn(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Privacy Policy",
    description: "Information under Art. 13/14 GDPR and supplemental disclosures for global users.",
    ...baseMeta(cfg, "en"),
    sections: [
      {
        id: "controller",
        title: "1. Controller",
        paragraphs: [
          `${cfg.operatorName}, ${cfg.streetAddress}, ${cfg.postalCode} ${cfg.city}, ${cfg.country}. Contact: ${cfg.email}, ${cfg.phone}.`,
        ],
      },
      {
        id: "scope",
        title: "2. Scope & principles",
        paragraphs: [
          "This policy describes how ImmoCaption AI processes personal data when you use our SaaS globally. We apply GDPR standards as our baseline and include supplemental notices for users in the UK, EEA, Switzerland, Canada (PIPEDA), and California (CCPA/CPRA) where applicable.",
          "We use privacy-by-design: only strictly necessary cookies and local storage are active by default (session/security). Non-essential analytics requires opt-in consent.",
        ],
      },
      {
        id: "categories",
        title: "3. Categories of data processed",
        listItems: [
          "Account & contact data (email, name, billing details when you subscribe).",
          "Listing content you upload (addresses, property attributes, photos, floor plans).",
          "Generated outputs (exposé text, captions, PDFs).",
          "Technical logs (IP address, timestamps, device/browser data) via our host for security and abuse prevention.",
          "Payment metadata from Stripe (no full card numbers on our servers).",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Purposes & lawful bases (GDPR Art. 6)",
        listItems: [
          "Providing the service, account management, and support — Art. 6(1)(b) GDPR (contract).",
          "Processing listing inputs to generate AI outputs you request — Art. 6(1)(b) GDPR (contract).",
          "Payment processing and fraud prevention — Art. 6(1)(b) and (f) GDPR.",
          "Security, rate limiting, and service integrity — Art. 6(1)(f) GDPR (legitimate interest).",
          "Legal compliance (tax, accounting, regulatory requests) — Art. 6(1)(c) GDPR.",
          "Optional analytics (only after opt-in) — Art. 6(1)(a) GDPR (consent).",
        ],
        paragraphs: [],
      },
      {
        id: "processors",
        title: "5. Sub-processors & international transfers",
        paragraphs: [
          "We use carefully selected processors under data processing agreements:",
        ],
        listItems: [
          "Vercel Inc. — cloud hosting and content delivery. Processing may occur in the EU and United States under EU Standard Contractual Clauses (SCCs) and supplementary measures.",
          "OpenAI, LLC — AI text generation via API. Inputs you submit are processed to fulfill your request. Per OpenAI’s API terms, API data is not used to train OpenAI’s public models unless you separately opt in to such programs. Transfers to the US rely on SCCs where required.",
          "Stripe, Inc. — payment processing (PCI-DSS compliant). Stripe processes payment data as an independent controller/processor according to its privacy policy.",
        ],
      },
      {
        id: "retention",
        title: "6. Retention",
        paragraphs: [
          "We retain personal data only as long as necessary for the purposes above or as required by law. Listing uploads and generated content are stored for your account session and product functionality; you may delete projects where the product provides deletion controls. Log data is rotated typically within 30–90 days unless needed for security investigations.",
        ],
      },
      {
        id: "rights",
        title: "7. Your rights",
        listItems: [
          "Right of access (Art. 15 GDPR).",
          "Right to rectification (Art. 16 GDPR).",
          "Right to erasure / “right to be forgotten” (Art. 17 GDPR).",
          "Right to restriction of processing (Art. 18 GDPR).",
          "Right to data portability (Art. 20 GDPR).",
          "Right to object (Art. 21 GDPR) where processing is based on legitimate interests.",
          "Right to withdraw consent at any time (Art. 7(3) GDPR) for consent-based processing.",
          "Right to lodge a complaint with a supervisory authority (Art. 77 GDPR), e.g. your local EU data protection authority.",
          "California residents: rights to know, delete, and correct personal information under CCPA/CPRA; we do not sell personal information as defined by CPRA.",
        ],
        paragraphs: [
          `To exercise rights, contact ${cfg.email}. We respond within statutory timelines.`,
        ],
      },
      {
        id: "security",
        title: "8. Security",
        paragraphs: [
          "We implement TLS encryption in transit, access controls, and vendor due diligence. No method of transmission is 100% secure; please use strong passwords and protect your account credentials.",
        ],
      },
      {
        id: "children",
        title: "9. Children",
        paragraphs: [
          "The service is not directed to children under 16. We do not knowingly collect data from children.",
        ],
      },
      {
        id: "changes",
        title: "10. Changes",
        paragraphs: [
          "We may update this policy. Material changes will be announced on this page with a new “Last updated” date.",
        ],
      },
    ],
  };
}

export function buildPrivacyDe(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Datenschutzerklärung",
    description: "Informationen nach Art. 13/14 DSGVO.",
    ...baseMeta(cfg, "de"),
    sections: [
      {
        id: "controller",
        title: "1. Verantwortlicher",
        paragraphs: [
          `${cfg.operatorName}, ${cfg.streetAddress}, ${cfg.postalCode} ${cfg.city}, ${cfg.country}. Kontakt: ${cfg.email}, ${cfg.phone}.`,
        ],
      },
      {
        id: "scope",
        title: "2. Geltungsbereich",
        paragraphs: [
          "Diese Erklärung beschreibt die Verarbeitung personenbezogener Daten bei Nutzung von ImmoCaption AI. Nicht-essenzielle Analytics erfolgen nur nach Einwilligung (Opt-in).",
        ],
      },
      {
        id: "categories",
        title: "3. Datenkategorien",
        listItems: [
          "Konto- und Kontaktdaten.",
          "Von Ihnen hochgeladene Exposé-Inhalte (Adressen, Bilder, Grundrisse).",
          "Generierte Texte und PDFs.",
          "Technische Protokolldaten (IP, Zeitstempel) zur Sicherheit.",
          "Zahlungsmetadaten über Stripe.",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Zwecke & Rechtsgrundlagen",
        listItems: [
          "Vertragserfüllung — Art. 6 Abs. 1 lit. b DSGVO.",
          "Berechtigtes Interesse an IT-Sicherheit — Art. 6 Abs. 1 lit. f DSGVO.",
          "Rechtliche Pflichten — Art. 6 Abs. 1 lit. c DSGVO.",
          "Einwilligung für optionale Analytics — Art. 6 Abs. 1 lit. a DSGVO.",
        ],
        paragraphs: [],
      },
      {
        id: "processors",
        title: "5. Auftragsverarbeiter & Drittlandtransfer",
        listItems: [
          "Vercel Inc. — Hosting (EU/USA, SCCs).",
          "OpenAI, LLC — KI-API; API-Daten werden nicht zum Training öffentlicher Modelle verwendet (gemäß API-Bedingungen).",
          "Stripe, Inc. — Zahlungsabwicklung (PCI-DSS).",
        ],
        paragraphs: [],
      },
      {
        id: "rights",
        title: "6. Betroffenenrechte",
        listItems: [
          "Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO).",
        ],
        paragraphs: [`Anfragen an ${cfg.email}.`],
      },
    ],
  };
}

export function buildTermsEn(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "Terms of Service & Cancellation Policy",
    description: "Contract terms for ImmoCaption AI SaaS subscriptions and digital generation.",
    ...baseMeta(cfg, "en"),
    sections: [
      {
        id: "subject",
        title: "1. Subject matter",
        paragraphs: [
          "ImmoCaption AI provides cloud software to generate real-estate exposés, captions, and PDF exports using AI-assisted workflows.",
        ],
      },
      {
        id: "account",
        title: "2. Account & acceptable use",
        paragraphs: [
          "You must provide accurate registration data and keep credentials confidential. You may not misuse the service, attempt unauthorized access, or upload unlawful content.",
        ],
      },
      {
        id: "user-content",
        title: "3. User content, copyrights & indemnification",
        paragraphs: [
          "You retain ownership of content you upload. You grant us a limited license to host, process, and transmit your content solely to provide the service.",
          "You represent and warrant that you hold all necessary copyrights, personality rights, and commercial permissions for every photograph, floor plan, and listing detail you upload, and that your content does not infringe third-party rights.",
          "You agree to indemnify and hold harmless the operator against claims arising from your uploads or misuse, including unauthorized use of property images.",
        ],
      },
      {
        id: "ai",
        title: "4. AI-generated output",
        paragraphs: [
          "Outputs are generated automatically and may contain errors. You are responsible for reviewing all exposé and marketing text before publication. The service does not provide legal, tax, or brokerage advice.",
        ],
      },
      {
        id: "availability",
        title: "5. Availability & limitation of liability",
        paragraphs: [
          "We strive for high availability but do not guarantee uninterrupted access. Maintenance windows may occur.",
          "To the maximum extent permitted under German law (BGB), we are liable without limitation for intent and gross negligence, for injury to life, body, or health, and under the Produkthaftungsgesetz. For slight negligence we are liable only for breach of essential contractual duties (Kardinalpflichten), limited to foreseeable, typical damage. Otherwise liability is excluded.",
        ],
      },
      {
        id: "law",
        title: "6. Governing law & jurisdiction",
        paragraphs: [
          `These terms are governed by the laws of the Federal Republic of Germany, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).`,
          `Exclusive place of jurisdiction for all disputes arising from or in connection with these terms is ${cfg.jurisdictionCity}, Germany, if you are a merchant, legal entity under public law, or special fund under public law; otherwise mandatory consumer jurisdictions remain unaffected.`,
        ],
      },
      {
        id: "withdrawal",
        title: "7. EU right of withdrawal (digital services)",
        paragraphs: [
          "If you are a consumer in the EU, you generally have a 14-day right to withdraw from distance contracts for digital services.",
          "If you request immediate commencement of the digital service before the withdrawal period expires, you must expressly consent that performance begins early and acknowledge that you lose your withdrawal right once we begin full performance (e.g. after digital generation or subscription activation begins).",
          "Model withdrawal instructions and the statutory form are provided at checkout and in your order confirmation.",
        ],
      },
      {
        id: "subscription",
        title: "8. Subscriptions & cancellation",
        paragraphs: [
          "Paid plans renew according to the billing interval shown at checkout until cancelled in the customer portal or via Stripe customer billing management. Statutory consumer cancellation rights remain unaffected.",
        ],
      },
    ],
  };
}

export function buildTermsDe(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "Allgemeine Geschäftsbedingungen & Widerruf",
    description: "Vertragsbedingungen für ImmoCaption AI.",
    ...baseMeta(cfg, "de"),
    sections: [
      {
        id: "subject",
        title: "1. Vertragsgegenstand",
        paragraphs: [
          "ImmoCaption AI ist eine Cloud-Software zur KI-gestützten Erstellung von Exposés, Captions und PDFs für Immobilien.",
        ],
      },
      {
        id: "user-content",
        title: "2. Nutzerinhalte & Freistellung",
        paragraphs: [
          "Sie garantieren, über alle erforderlichen Rechte an hochgeladenen Fotos und Daten zu verfügen und stellen uns von Ansprüchen Dritter frei.",
        ],
      },
      {
        id: "law",
        title: "3. Recht & Gerichtsstand",
        paragraphs: [
          "Es gilt deutsches Recht. Gerichtsstand für Kaufleute ist " + cfg.jurisdictionCity + ", soweit zulässig.",
        ],
      },
      {
        id: "withdrawal",
        title: "4. Widerrufsrecht für digitale Inhalte",
        paragraphs: [
          "Verbrauchern steht grundsätzlich ein 14-tägiges Widerrufsrecht zu. Bei ausdrücklicher Zustimmung zur sofortigen Leistungsausführung erlischt das Widerrufsrecht mit Beginn der vollständigen Vertragserfüllung.",
        ],
      },
      {
        id: "liability",
        title: "5. Haftung",
        paragraphs: [
          "Haftungsbeschränkung im gesetzlich zulässigen Umfang nach BGB; unbeschränkte Haftung bei Vorsatz, grober Fahrlässigkeit und bei Verletzung von Leben, Körper oder Gesundheit.",
        ],
      },
    ],
  };
}
