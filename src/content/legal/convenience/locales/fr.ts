import { operatorAddressLine } from "@/content/legal/clauses";
import {
  choiceOfLawClauseConvenience,
  controllerContactLinesConvenience,
  privacyContactTdddgConvenience,
} from "@/content/legal/convenience/clauses";
import { convenienceMeta } from "@/content/legal/convenience/types";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

const locale = "fr" as const;

export function buildImprintFr(cfg: LegalBusinessConfig): LegalDocument {
  const address = operatorAddressLine(cfg);
  const labels = { email: "E-mail", phone: "Téléphone" };
  return {
    kind: "imprint",
    title: "Mentions légales (Impressum)",
    description:
      "Informations conformément au § 5 DDG (loi allemande sur les services numériques), au § 25 TDDDG et au § 18 MStV.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "operator",
        title: "Prestataire de services (§ 5 DDG)",
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
        title: "Numéro d'identification TVA",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "Responsable du contenu (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "Règlement des litiges UE",
        paragraphs: [
          "La Commission européenne met à disposition une plateforme de règlement en ligne des litiges (RLL) : https://ec.europa.eu/consumers/odr/. Nous ne sommes ni tenus ni disposés à participer à une procédure de médiation devant un organe de conciliation des consommateurs, sauf si la loi l'exige.",
        ],
      },
      {
        id: "choice-of-law",
        title: "Droit applicable (utilisateurs internationaux)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildPrivacyFr(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Politique de confidentialité",
    description:
      "Informations conformément aux art. 13/14 du RGPD, au § 25 TDDDG et aux mentions complémentaires pour les utilisateurs internationaux.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "controller",
        title: "1. Responsable du traitement",
        paragraphs: [
          ...controllerContactLinesConvenience(cfg, locale),
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "scope",
        title: "2. Champ d'application et principes",
        paragraphs: [
          "La présente politique décrit la manière dont ImmoCaption AI (« nous ») traite les données personnelles lorsque vous utilisez notre application web dans le monde entier. Le RGPD européen constitue notre référence de base, avec des mentions complémentaires pour le Royaume-Uni, l'EEE, la Suisse, le Canada (LPRPDE) et la Californie (CCPA/CPRA).",
          "Nous appliquons le principe Privacy-by-Design :",
        ],
        listItems: [
          "Aucun suivi non essentiel : les cookies publicitaires ou marketing tiers ne sont pas activés par défaut.",
          "Fonctionnement essentiel : seuls les cookies de session techniques strictement nécessaires et le stockage local du navigateur pour la sécurité, l'authentification et l'état des formulaires sont actifs.",
        ],
      },
      {
        id: "categories",
        title: "3. Catégories de données traitées",
        listItems: [
          "Compte et contact : nom, adresse e-mail, langue et données de facturation.",
          "Contenu d'annonce : adresse, caractéristiques du bien, plans et photos téléversées.",
          "Contenus générés : textes d'exposé, descriptions, légendes pour les réseaux sociaux et PDF.",
          "Journaux techniques : adresse IP, horodatage, navigateur/appareil et en-têtes HTTP pour la sécurité et la limitation du débit.",
          "Métadonnées de paiement : identifiants de transaction, statut d'abonnement et adresse de facturation via Lemon Squeezy. (Les numéros de carte complets ne sont pas stockés chez nous.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Finalités et bases juridiques (RGPD art. 6)",
        listItems: [
          "Prestation du service et exécution du contrat (art. 6(1)(b)) : compte, abonnement, génération IA et support.",
          "Paiement et sécurité (art. 6(1)(b) et (f)) : frais d'abonnement et prévention de la fraude.",
          "Intégrité du système (art. 6(1)(f)) : journaux pour prévenir les abus d'API et les attaques DDoS.",
          "Obligations légales et fiscales (art. 6(1)(c)) : conservation des factures conformément au HGB/AO allemand.",
        ],
        paragraphs: [
          "Traitement automatisé (art. 22) : l'IA génère des textes provisoires à partir de vos saisies. Aucune décision automatisée produisant des effets juridiques significatifs n'est prise.",
        ],
      },
      {
        id: "processors",
        title: "5. Sous-traitants tiers et transferts internationaux",
        paragraphs: [
          "Les données sont transmises à des sous-traitants liés par des accords de traitement (DPA). Les transferts hors UE/EEE reposent sur le DPF et/ou les clauses contractuelles types (CCT) :",
        ],
        listItems: [
          "Vercel Inc. (hébergement/CDN) : UE et États-Unis.",
          "OpenAI LLC (moteur IA) : entrées API pour la génération de texte ; conformément aux conditions API, non utilisées pour l'entraînement de modèles publics.",
          "Lemon Squeezy (paiement) : carte, abonnement et facturation.",
        ],
      },
      {
        id: "retention",
        title: "6. Conservation et suppression",
        paragraphs: ["Les données ne sont conservées que le temps nécessaire :"],
        listItems: [
          "Compte et projets : tant que le compte est actif ; à la suppression, les téléversements et textes sont effacés de la base de production.",
          "Journaux serveur : suppression ou anonymisation sous 30 à 90 jours.",
          "Conservation légale : factures jusqu'à 10 ans conformément au § 147 AO et au § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "7. Vos droits légaux",
        paragraphs: [
          `Pour exercer vos droits, contactez-nous à ${cfg.email} :`,
        ],
        listItems: [
          "Droit d'accès (art. 15)",
          "Droit de rectification (art. 16)",
          "Droit à l'effacement / à l'oubli (art. 17)",
          "Droit à la limitation du traitement (art. 18)",
          "Droit à la portabilité des données (art. 20)",
          "Droit d'opposition (art. 21)",
          "Droit de réclamation auprès d'une autorité de contrôle (art. 77), p. ex. le BfDI en Allemagne",
          "Californie (CCPA/CPRA) : droit d'information, de suppression et de rectification ; nous ne « vendons » ni ne « partageons » les données personnelles.",
          "Canada (LPRPDE) : accès et rectification à tout moment.",
        ],
      },
      {
        id: "security",
        title: "8. Sécurité des données",
        paragraphs: [
          "TLS, contrôles d'accès, limitation du débit API et évaluations de sécurité de nos prestataires.",
        ],
      },
      {
        id: "children",
        title: "9. Protection des mineurs",
        paragraphs: [
          "Le service s'adresse aux professionnels de l'immobilier et aux consommateurs de 18 ans et plus. Nous ne collectons pas sciemment de données d'enfants de moins de 16 ans.",
        ],
      },
      {
        id: "changes",
        title: "10. Modifications de cette politique",
        paragraphs: [
          "Nous pouvons mettre à jour cette politique. Les modifications importantes seront publiées avec une date de « dernière mise à jour » révisée.",
        ],
      },
      {
        id: "choice-of-law",
        title: "11. Droit applicable (utilisateurs internationaux)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildTermsFr(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "Conditions d'utilisation et politique de résiliation",
    description:
      "Conditions contractuelles pour l'abonnement SaaS ImmoCaption AI et la génération numérique.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "subject",
        title: "1. Objet",
        paragraphs: [
          "ImmoCaption AI fournit un logiciel cloud pour générer des exposés immobiliers, des légendes et des PDF à l'aide de workflows assistés par IA.",
        ],
      },
      {
        id: "account",
        title: "2. Compte et usage autorisé",
        paragraphs: [
          "Vous devez fournir des données d'inscription exactes et garder vos identifiants confidentiels. L'usage abusif, l'accès non autorisé et les contenus illicites sont interdits.",
        ],
      },
      {
        id: "user-content",
        title: "3. Contenu utilisateur, droits d'auteur et indemnisation",
        paragraphs: [
          "Vous conservez la propriété du contenu téléversé. Vous nous accordez une licence limitée pour l'héberger et le traiter afin de fournir le service.",
          "Vous garantissez disposer de tous les droits d'auteur, de personnalité et commerciaux sur les photos et données téléversées.",
          "Vous nous indemnisez contre toute réclamation découlant de vos téléversements ou d'un usage abusif.",
        ],
      },
      {
        id: "ai",
        title: "4. Contenus générés par IA",
        paragraphs: [
          "Les résultats sont générés automatiquement et peuvent contenir des erreurs. Vous êtes responsable de la vérification avant publication. Aucun conseil juridique, fiscal ou immobilier n'est fourni.",
        ],
      },
      {
        id: "availability",
        title: "5. Disponibilité et limitation de responsabilité",
        paragraphs: [
          "Nous visons une haute disponibilité mais ne garantissons pas un accès ininterrompu. Des fenêtres de maintenance sont possibles.",
          "Conformément au droit allemand (BGB) : responsabilité illimitée en cas d'intention et de faute lourde, de dommages corporels et au titre de la Produkthaftungsgesetz. En cas de négligence légère, uniquement pour violation d'obligations essentielles (Kardinalpflichten), limitée au dommage prévisible typique.",
        ],
      },
      {
        id: "law",
        title: "6. Droit applicable et juridiction",
        paragraphs: [
          "Droit de la République fédérale d'Allemagne, à l'exclusion de la CVIM.",
          choiceOfLawClauseConvenience(locale),
          `Juridiction exclusive pour les commerçants et personnes morales : ${cfg.jurisdictionCity}, Allemagne ; les juridictions impératives des consommateurs restent applicables.`,
        ],
      },
      {
        id: "withdrawal",
        title: "7. Droit de rétractation UE (services numériques)",
        paragraphs: [
          "Les consommateurs de l'UE disposent en principe d'un délai de rétractation de 14 jours pour les contrats à distance.",
          "Si vous demandez le début immédiat du service avant l'expiration du délai, avec votre consentement explicite, le droit de rétractation est perdu une fois l'exécution commencée.",
          "Les instructions et le formulaire type sont fournis lors du paiement et dans la confirmation de commande.",
        ],
      },
      {
        id: "subscription",
        title: "8. Abonnements et résiliation",
        paragraphs: [
          "Les formules payantes se renouvellent jusqu'à résiliation dans le portail client Lemon Squeezy. Les droits légaux des consommateurs restent applicables.",
        ],
      },
      {
        id: "retention",
        title: "9. Conservation légale (HGB / AO)",
        paragraphs: [
          "Les documents comptables et de facturation peuvent être conservés jusqu'à dix ans conformément au § 257 HGB et au § 147 AO.",
        ],
      },
    ],
  };
}
