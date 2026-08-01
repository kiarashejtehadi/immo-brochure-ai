import { operatorAddressLine } from "@/content/legal/clauses";
import {
  choiceOfLawClauseConvenience,
  controllerContactLinesConvenience,
  privacyContactTdddgConvenience,
} from "@/content/legal/convenience/clauses";
import { convenienceMeta } from "@/content/legal/convenience/types";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

const locale = "nl" as const;

export function buildImprintNl(cfg: LegalBusinessConfig): LegalDocument {
  const address = operatorAddressLine(cfg);
  const labels = { email: "E-mail", phone: "Telefoon" };
  return {
    kind: "imprint",
    title: "Juridische kennisgeving (Impressum)",
    description:
      "Informatie conform § 5 DDG (Duitse wet digitale diensten), § 25 TDDDG en § 18 MStV.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "operator",
        title: "Dienstverlener (§ 5 DDG)",
        paragraphs: [`${cfg.operatorName} (${cfg.legalForm})`, address],
      },
      {
        id: "contact",
        title: "Contact",
        paragraphs: [
          `${labels.email}: ${cfg.email}`,
          `${labels.phone}: ${cfg.phone}`,
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "vat",
        title: "BTW-identificatienummer",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "Verantwoordelijk voor de inhoud (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "EU-geschillenbeslechting",
        paragraphs: [
          "De Europese Commissie biedt een platform voor online geschillenbeslechting (ODR): https://ec.europa.eu/consumers/odr/. Wij zijn niet verplicht of bereid deel te nemen aan geschillenbeslechting bij een consumentencommissie, tenzij de wet dit vereist.",
        ],
      },
      {
        id: "choice-of-law",
        title: "Toepasselijk recht (internationale gebruikers)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildPrivacyNl(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Privacybeleid",
    description:
      "Informatie conform AVG art. 13/14, § 25 TDDDG en aanvullende verklaringen voor wereldwijde gebruikers.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "controller",
        title: "1. Verwerkingsverantwoordelijke",
        paragraphs: [
          ...controllerContactLinesConvenience(cfg, locale),
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "scope",
        title: "2. Reikwijdte en uitgangspunten",
        paragraphs: [
          'Dit privacybeleid beschrijft hoe ImmoCaption AI (« wij ») persoonsgegevens verwerkt wanneer u onze webapplicatie wereldwijd gebruikt. De Europese AVG vormt onze basis, met aanvullende verklaringen voor het VK, de EER, Zwitserland, Canada (PIPEDA) en Californië (CCPA/CPRA).',
          "Wij werken volgens het Privacy-by-Design-principe:",
        ],
        listItems: [
          "Geen niet-essentiële tracking: advertentie- of marketingcookies van derden zijn standaard niet actief.",
          "Essentiële werking: alleen strikt noodzakelijke technische sessiecookies en lokale browseropslag voor beveiliging, authenticatie en formulierstatus.",
        ],
      },
      {
        id: "categories",
        title: "3. Verwerkte gegevenscategorieën",
        listItems: [
          "Account en contact: naam, e-mail, taal en factuurgegevens.",
          "Advertentie-inhoud: adres, objectkenmerken, plattegronden en geüploade foto's.",
          "Gegenereerde output: exposéteksten, beschrijvingen, social media-bijschriften en PDF's.",
          "Technische logs: IP, tijdstempel, browser/apparaat en HTTP-headers voor beveiliging en rate limiting.",
          "Betalingsmetadata: transactie-ID's, abonnementsstatus en factuuradres via Lemon Squeezy. (Volledige kaartnummers worden niet bij ons opgeslagen.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Doeleinden en rechtsgronden (AVG art. 6)",
        listItems: [
          "Dienstverlening en contract (art. 6(1)(b)): account, abonnement, AI-generatie en support.",
          "Betaling en beveiliging (art. 6(1)(b) en (f)): abonnementskosten en fraudepreventie.",
          "Systeemintegriteit (art. 6(1)(f)): logs ter voorkoming van API-misbruik en DDoS-aanvallen.",
          "Wettelijke en fiscale verplichtingen (art. 6(1)(c)): bewaren van facturen conform Duits HGB/AO.",
        ],
        paragraphs: [
          "Geautomatiseerde verwerking (art. 22): AI genereert conceptteksten op basis van uw invoer. Er vindt geen geautomatiseerde besluitvorming met juridische of vergelijkbare significante gevolgen plaats.",
        ],
      },
      {
        id: "processors",
        title: "5. Derde verwerkers en internationale doorgifte",
        paragraphs: [
          "Gegevens worden doorgegeven aan verwerkers met verwerkersovereenkomsten (DPA). Doorgifte buiten de EU/EER steunt op het DPF en/of standaardcontractbepalingen (SCC's):",
        ],
        listItems: [
          "Vercel Inc. (hosting/CDN): EU en VS.",
          "OpenAI LLC (AI-engine): API-invoer voor tekstgeneratie; volgens API-voorwaarden niet gebruikt voor training van openbare modellen.",
          "Lemon Squeezy (betaling): kaart, abonnement en facturering.",
        ],
      },
      {
        id: "retention",
        title: "6. Bewaring en verwijdering",
        paragraphs: ["Gegevens worden alleen bewaard zolang nodig:"],
        listItems: [
          "Account en projecten: zolang het account actief is; bij verwijdering worden uploads en teksten uit de productiedatabase gewist.",
          "Serverlogs: verwijdering of anonimisering binnen 30–90 dagen.",
          "Wettelijke bewaring: facturen tot 10 jaar conform § 147 AO en § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "7. Uw wettelijke rechten",
        paragraphs: [
          `Neem contact op via ${cfg.email} om uw rechten uit te oefenen:`,
        ],
        listItems: [
          "Recht op inzage (art. 15)",
          "Recht op rectificatie (art. 16)",
          "Recht op verwijdering / vergetelheid (art. 17)",
          "Recht op beperking van verwerking (art. 18)",
          "Recht op dataportabiliteit (art. 20)",
          "Recht van bezwaar (art. 21)",
          "Recht om een klacht in te dienen bij een toezichthoudende autoriteit (art. 77), bijv. de BfDI in Duitsland",
          "Californië (CCPA/CPRA): recht op informatie, verwijdering en rectificatie; wij « verkopen » of « delen » geen persoonsgegevens.",
          "Canada (PIPEDA): inzage en rectificatie op elk moment.",
        ],
      },
      {
        id: "security",
        title: "8. Gegevensbeveiliging",
        paragraphs: [
          "TLS, toegangscontroles, API rate limiting en beveiligingsbeoordelingen van leveranciers.",
        ],
      },
      {
        id: "children",
        title: "9. Privacy van kinderen",
        paragraphs: [
          "De dienst is bedoeld voor vastgoedprofessionals en consumenten van 18 jaar en ouder. Wij verzamelen bewust geen gegevens van kinderen jonger dan 16 jaar.",
        ],
      },
      {
        id: "changes",
        title: "10. Wijzigingen in dit beleid",
        paragraphs: [
          "Wij kunnen dit beleid bijwerken. Belangrijke wijzigingen worden gepubliceerd met een herziene datum « laatst bijgewerkt ».",
        ],
      },
      {
        id: "choice-of-law",
        title: "11. Toepasselijk recht (internationale gebruikers)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildTermsNl(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "Gebruiksvoorwaarden en opzegbeleid",
    description:
      "Contractvoorwaarden voor het ImmoCaption AI SaaS-abonnement en digitale generatie.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "subject",
        title: "1. Onderwerp",
        paragraphs: [
          "ImmoCaption AI levert cloudsoftware voor het genereren van vastgoedexposés, bijschriften en PDF's via AI-ondersteunde workflows.",
        ],
      },
      {
        id: "account",
        title: "2. Account en toegestaan gebruik",
        paragraphs: [
          "U dient accurate registratiegegevens te verstrekken en inloggegevens vertrouwelijk te houden. Misbruik, ongeautoriseerde toegang en onrechtmatige inhoud zijn verboden.",
        ],
      },
      {
        id: "user-content",
        title: "3. Gebruikersinhoud, auteursrecht en vrijwaring",
        paragraphs: [
          "U behoudt het eigendom van geüploade inhoud. U verleent ons een beperkte licentie om deze te hosten en te verwerken voor de dienstverlening.",
          "U garandeert alle benodigde auteurs-, persoonlijkheids- en commerciële rechten op geüploade foto's en gegevens te bezitten.",
          "U vrijwaart ons tegen claims voortvloeiend uit uw uploads of misbruik.",
        ],
      },
      {
        id: "ai",
        title: "4. AI-gegenereerde output",
        paragraphs: [
          "Output wordt automatisch gegenereerd en kan fouten bevatten. U bent verantwoordelijk voor controle vóór publicatie. Geen juridisch, fiscaal of makelaarsadvies.",
        ],
      },
      {
        id: "availability",
        title: "5. Beschikbaarheid en aansprakelijkheidsbeperking",
        paragraphs: [
          "Wij streven naar hoge beschikbaarheid maar garanderen geen ononderbroken toegang. Onderhoudsvensters zijn mogelijk.",
          "Conform Duits recht (BGB): onbeperkte aansprakelijkheid bij opzet en grove nalatigheid, lichamelijk letsel en krachtens de Produkthaftungsgesetz. Bij lichte nalatigheid alleen bij schending van essentiële contractuele plichten (Kardinalpflichten), beperkt tot voorzienbare, typische schade.",
        ],
      },
      {
        id: "law",
        title: "6. Toepasselijk recht en bevoegde rechtbank",
        paragraphs: [
          "Recht van de Bondsrepubliek Duitsland, met uitsluiting van het CISG.",
          choiceOfLawClauseConvenience(locale),
          `Exclusieve rechtbank voor handelaren en rechtspersonen: ${cfg.jurisdictionCity}, Duitsland; dwingende consumentengerechten blijven van kracht.`,
        ],
      },
      {
        id: "withdrawal",
        title: "7. EU-herroepingsrecht (digitale diensten)",
        paragraphs: [
          "EU-consumenten hebben doorgaans 14 dagen herroepingsrecht bij overeenkomsten op afstand.",
          "Bij verzoek om onmiddellijke aanvang vóór het verstrijken van de termijn, met uw uitdrukkelijke toestemming, vervalt het herroepingsrecht zodra volledige prestatie is begonnen.",
          "Modelherroepingsinstructies en het formulier worden verstrekt bij checkout en in de orderbevestiging.",
        ],
      },
      {
        id: "subscription",
        title: "8. Abonnementen en opzegging",
        paragraphs: [
          "Betaalde plannen verlengen zich tot opzegging in het Lemon Squeezy-klantenportaal. Wettelijke consumentenrechten blijven van kracht.",
        ],
      },
      {
        id: "retention",
        title: "9. Wettelijke bewaring (HGB / AO)",
        paragraphs: [
          "Facturatie- en boekhoudgegevens kunnen tot tien jaar worden bewaard conform § 257 HGB en § 147 AO.",
        ],
      },
    ],
  };
}
