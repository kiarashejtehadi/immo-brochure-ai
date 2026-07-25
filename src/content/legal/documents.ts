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
          cfg.operatorName,
          cfg.streetAddress,
          `${cfg.postalCode} ${cfg.city}, ${cfg.country}`,
          `Email: ${cfg.email}`,
          `Phone: ${cfg.phone}`,
        ],
      },
      {
        id: "scope",
        title: "2. Scope & Principles",
        paragraphs: [
          'This Privacy Policy describes how ImmoCaption AI ("we", "our", or "us") processes personal data when you use our web application globally. We apply European General Data Protection Regulation (GDPR) standards as our global baseline and include supplemental notices for users in the UK, EEA, Switzerland, Canada (PIPEDA), and California (CCPA/CPRA).',
          "We operate on a Privacy-by-Design principle:",
        ],
        listItems: [
          "No non-essential tracking: We do not deploy third-party advertising or non-essential marketing cookies by default.",
          "Essential operation: Only strictly necessary technical session cookies and browser local storage required for system security, user authentication, and multi-step form state are active.",
        ],
      },
      {
        id: "categories",
        title: "3. Categories of Data Processed",
        listItems: [
          "Account & Contact Data: Name, email address, language preferences, and billing profile details.",
          "Listing Content & Uploads: Property addresses, property specifications, floor plans, and uploaded interior/exterior property images.",
          "Generated Outputs: AI-generated exposé text narratives, room descriptions, social media captions, and exported PDF brochures.",
          "Technical & Usage Logs: IP addresses, timestamps, browser/device parameters, and HTTP request headers logged for security, abuse prevention, and rate-limiting purposes.",
          "Payment Metadata: Transaction identifiers, subscription status, and billing addresses provided via Stripe. (Note: Full credit card numbers are processed directly by Stripe and never touch or store on our servers.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Purposes & Lawful Bases for Processing (GDPR Art. 6)",
        listItems: [
          "Service Provision & Contract Execution (Art. 6(1)(b) GDPR): Processing account credentials, handling subscription access, generating AI property captions/PDFs, and providing customer support.",
          "Payment Processing & Security (Art. 6(1)(b) & (f) GDPR): Processing subscription fees and preventing fraudulent chargebacks.",
          "System Integrity & Abuse Prevention (Art. 6(1)(f) GDPR): Processing technical log data to prevent API abuse, DDoS attacks, and unauthorized access based on our legitimate interest in maintaining system availability.",
          "Legal & Tax Compliance (Art. 6(1)(c) GDPR): Retention of billing records, invoices, and tax-relevant transaction logs in compliance with statutory obligations under German commercial and fiscal law (HGB / AO).",
        ],
        paragraphs: [
          "Automated Processing Clarification (Art. 22 GDPR): Our AI processing generates draft text and media recommendations based strictly on your inputs. We do not engage in automated decision-making or profiling that produces legal or similarly significant effects on you.",
        ],
      },
      {
        id: "processors",
        title: "5. Third-Party Processors & International Data Transfers",
        paragraphs: [
          "We transfer personal data to carefully vetted third-party sub-processors bound by strict Data Processing Agreements (DPAs). Data transfers to non-EU/EEA countries rely on the EU-U.S. Data Privacy Framework (DPF) adequacy decision and/or Standard Contractual Clauses (SCCs):",
        ],
        listItems: [
          "Vercel Inc. (Cloud Infrastructure & Hosting): Web hosting, serverless functions, and content delivery network (CDN). Data may be routed via servers in the EU and the US.",
          "OpenAI LLC (AI Text & Generation Engine): Processing of prompt inputs and image parameters to generate property descriptions via API. Data privacy guarantee: Per OpenAI's enterprise API terms, prompt data and image inputs submitted via the API are NOT used to train public OpenAI language models.",
          "Stripe Inc. (Payment Service Provider): Processing payment cards, recurring subscriptions, and invoice generation in compliance with PCI-DSS standards.",
        ],
      },
      {
        id: "retention",
        title: "6. Data Retention & Deletion",
        paragraphs: [
          "Personal data is retained only for as long as necessary to fulfill the purposes set out in this policy:",
        ],
        listItems: [
          "Account Data & Project Files: Stored while your account remains active. When you delete a property project or your user account, associated uploads and generated text are permanently removed from active production databases.",
          "Server Logs: Security and access logs are automatically purged or anonymized within 30 to 90 days.",
          "Statutory Retention: Invoices and payment metadata are retained for up to 10 years to fulfill mandatory German tax (§ 147 AO) and commercial law (§ 257 HGB) obligations.",
        ],
      },
      {
        id: "rights",
        title: "7. Your Statutory Rights",
        paragraphs: [
          `Regardless of your location, you hold the following rights regarding your personal data. To exercise any of these rights, contact us at ${cfg.email}:`,
        ],
        listItems: [
          "Right to Access (Art. 15 GDPR): Request a copy of your personal data held by us.",
          "Right to Rectification (Art. 16 GDPR): Request correction of inaccurate personal data.",
          'Right to Erasure / "Right to be Forgotten" (Art. 17 GDPR): Request permanent deletion of your data where legal retention grounds do not apply.',
          "Right to Restriction of Processing (Art. 18 GDPR): Request temporary suspension of data processing under specific circumstances.",
          "Right to Data Portability (Art. 20 GDPR): Receive your personal data in a structured, commonly used machine-readable format.",
          "Right to Object (Art. 21 GDPR): Object to processing carried out under the basis of legitimate interest.",
          "Right to Lodge a Complaint (Art. 77 GDPR): File a complaint with a supervisory data protection authority (e.g., your local EU state authority or the Der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit — BfDI in Germany).",
          'Supplemental — California (CCPA / CPRA): You have the right to know what personal information is collected, request deletion, and request correction. We do not "sell" or "share" personal information as defined under California law.',
          "Supplemental — Canada (PIPEDA): You may request access to and correction of personal information held by us at any time.",
        ],
      },
      {
        id: "security",
        title: "8. Data Security",
        paragraphs: [
          "We implement modern technical and organizational security measures (TOMs), including enforced TLS/SSL encryption in transit, strict database access controls, API rate limiting, and routine vendor security assessments.",
        ],
      },
      {
        id: "children",
        title: "9. Children's Privacy",
        paragraphs: [
          "Our platform is a business SaaS product intended strictly for real estate professionals and consumers aged 18 and older. We do not knowingly collect personal data from children under 16.",
        ],
      },
      {
        id: "changes",
        title: "10. Changes to This Policy",
        paragraphs: [
          'We reserve the right to update this Privacy Policy to reflect technical, operational, or legal developments. Material updates will be published directly to this page with a revised "Last Updated" date.',
        ],
      },
    ],
  };
}

export function buildPrivacyDe(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Datenschutzerklärung",
    description:
      "Informationen nach Art. 13/14 DSGVO und ergänzende Hinweise für Nutzer weltweit.",
    ...baseMeta(cfg, "de"),
    sections: [
      {
        id: "controller",
        title: "1. Verantwortlicher",
        paragraphs: [
          cfg.operatorName,
          cfg.streetAddress,
          `${cfg.postalCode} ${cfg.city}, ${cfg.country}`,
          `E-Mail: ${cfg.email}`,
          `Telefon: ${cfg.phone}`,
        ],
      },
      {
        id: "scope",
        title: "2. Geltungsbereich & Grundsätze",
        paragraphs: [
          'Diese Datenschutzerklärung beschreibt, wie ImmoCaption AI („wir“, „uns“ oder „unser“) personenbezogene Daten verarbeitet, wenn Sie unsere Webanwendung weltweit nutzen. Wir wenden die europäische Datenschutz-Grundverordnung (DSGVO) als globale Mindestnorm an und ergänzen Hinweise für Nutzer im Vereinigten Königreich, im EWR, in der Schweiz, in Kanada (PIPEDA) und in Kalifornien (CCPA/CPRA).',
          "Wir arbeiten nach dem Prinzip Privacy-by-Design:",
        ],
        listItems: [
          "Kein nicht-essenzielles Tracking: Wir setzen standardmäßig keine Werbe- oder Marketing-Cookies Dritter ein.",
          "Essentieller Betrieb: Aktiv sind nur technisch erforderliche Session-Cookies und lokale Browser-Speicherung für Systemsicherheit, Authentifizierung und mehrstufige Formularzustände.",
        ],
      },
      {
        id: "categories",
        title: "3. Verarbeitete Datenkategorien",
        listItems: [
          "Konto- & Kontaktdaten: Name, E-Mail-Adresse, Spracheinstellungen und Rechnungs-/Profildaten.",
          "Exposé-Inhalte & Uploads: Immobilienadressen, Objektmerkmale, Grundrisse sowie hochgeladene Innen-/Außenfotos.",
          "Generierte Inhalte: KI-erstellte Exposé-Texte, Raumbeschreibungen, Social-Media-Captions und exportierte PDF-Broschüren.",
          "Technische & Nutzungsprotokolle: IP-Adressen, Zeitstempel, Browser-/Geräteparameter und HTTP-Header zu Sicherheit, Missbrauchsprävention und Rate-Limiting.",
          "Zahlungsmetadaten: Transaktions-IDs, Abonnementstatus und Rechnungsadressen über Stripe. (Hinweis: Vollständige Kartennummern werden ausschließlich von Stripe verarbeitet und nicht auf unseren Servern gespeichert.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Zwecke & Rechtsgrundlagen (DSGVO Art. 6)",
        listItems: [
          "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO): Kontozugang, Abonnements, KI-Generierung von Captions/PDFs und Support.",
          "Zahlungsabwicklung & Sicherheit (Art. 6 Abs. 1 lit. b & f DSGVO): Abonnementgebühren und Betrugs-/Chargeback-Prävention.",
          "Systemintegrität & Missbrauchsprävention (Art. 6 Abs. 1 lit. f DSGVO): Protokolldaten zur Abwehr von API-Missbrauch, DDoS und unbefugtem Zugriff.",
          "Rechtliche & steuerliche Pflichten (Art. 6 Abs. 1 lit. c DSGVO): Aufbewahrung von Rechnungen und steuerrelevanten Daten nach HGB/AO.",
        ],
        paragraphs: [
          "Automatisierte Verarbeitung (Art. 22 DSGVO): Unsere KI erstellt Entwurfstexte und Empfehlungen ausschließlich auf Basis Ihrer Eingaben. Es findet keine automatisierte Entscheidungsfindung mit rechtlicher oder ähnlich erheblicher Wirkung statt.",
        ],
      },
      {
        id: "processors",
        title: "5. Auftragsverarbeiter & Drittlandübermittlungen",
        paragraphs: [
          "Wir übermitteln Daten an sorgfältig ausgewählte Auftragsverarbeiter mit Auftragsverarbeitungsverträgen (AVV). Übermittlungen in Drittländer stützen sich auf den Angemessenheitsbeschluss EU-US Data Privacy Framework (DPF) und/oder Standardvertragsklauseln (SCCs):",
        ],
        listItems: [
          "Vercel Inc. (Hosting & CDN): Webhosting, Serverless-Funktionen und Content Delivery; Verarbeitung in der EU und den USA möglich.",
          "OpenAI LLC (KI-Engine): Verarbeitung von Prompts und Bildparametern zur Textgenerierung per API. Garantie: API-Eingaben werden gemäß OpenAI-API-Bedingungen nicht zum Training öffentlicher Sprachmodelle verwendet.",
          "Stripe Inc. (Zahlungsdienst): Kartenzahlungen, Abonnements und Rechnungen (PCI-DSS).",
        ],
      },
      {
        id: "retention",
        title: "6. Speicherdauer & Löschung",
        paragraphs: [
          "Personenbezogene Daten speichern wir nur so lange, wie für die genannten Zwecke erforderlich:",
        ],
        listItems: [
          "Konto- & Projektdaten: Solange Ihr Konto aktiv ist. Beim Löschen eines Projekts oder Kontos werden zugehörige Uploads und Texte aus aktiven Produktionsdatenbanken entfernt.",
          "Server-Logs: Sicherheits- und Zugriffsprotokolle werden innerhalb von 30–90 Tagen gelöscht oder anonymisiert.",
          "Gesetzliche Aufbewahrung: Rechnungen und Zahlungsmetadaten bis zu 10 Jahre gemäß § 147 AO und § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "7. Ihre Rechte",
        paragraphs: [
          `Unabhängig von Ihrem Wohnort haben Sie folgende Rechte. Kontakt: ${cfg.email}`,
        ],
        listItems: [
          "Auskunft (Art. 15 DSGVO).",
          "Berichtigung (Art. 16 DSGVO).",
          "Löschung / „Recht auf Vergessenwerden“ (Art. 17 DSGVO), soweit keine Aufbewahrungspflichten entgegenstehen.",
          "Einschränkung der Verarbeitung (Art. 18 DSGVO).",
          "Datenübertragbarkeit (Art. 20 DSGVO).",
          "Widerspruch (Art. 21 DSGVO) bei Verarbeitung auf Basis berechtigter Interessen.",
          "Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO), z. B. beim Bundesbeauftragten für den Datenschutz und die Informationsfreiheit (BfDI).",
          "Ergänzend — Kalifornien (CCPA/CPRA): Recht auf Information, Löschung und Berichtigung; wir „verkaufen“ oder „teilen“ personenbezogene Daten im Sinne des kalifornischen Rechts nicht.",
          "Ergänzend — Kanada (PIPEDA): Auskunft und Berichtigung personenbezogener Daten jederzeit auf Anfrage.",
        ],
      },
      {
        id: "security",
        title: "8. Datensicherheit",
        paragraphs: [
          "Wir setzen technische und organisatorische Maßnahmen (TOMs) ein, u. a. TLS-Verschlüsselung, Zugriffskontrollen, API-Rate-Limiting und regelmäßige Prüfung unserer Dienstleister.",
        ],
      },
      {
        id: "children",
        title: "9. Kinder",
        paragraphs: [
          "Die Plattform richtet sich an Immobilienprofis und Verbraucher ab 18 Jahren. Wir erheben wissentlich keine Daten von Kindern unter 16 Jahren.",
        ],
      },
      {
        id: "changes",
        title: "10. Änderungen",
        paragraphs: [
          "Wir können diese Datenschutzerklärung bei technischen, operativen oder rechtlichen Änderungen anpassen. Wesentliche Updates veröffentlichen wir hier mit neuem „Stand“-Datum.",
        ],
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
