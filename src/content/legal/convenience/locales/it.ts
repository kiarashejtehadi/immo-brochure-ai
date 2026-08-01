import { operatorAddressLine } from "@/content/legal/clauses";
import {
  choiceOfLawClauseConvenience,
  controllerContactLinesConvenience,
  privacyContactTdddgConvenience,
} from "@/content/legal/convenience/clauses";
import { convenienceMeta } from "@/content/legal/convenience/types";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

const locale = "it" as const;

export function buildImprintIt(cfg: LegalBusinessConfig): LegalDocument {
  const address = operatorAddressLine(cfg);
  const labels = { email: "E-mail", phone: "Telefono" };
  return {
    kind: "imprint",
    title: "Note legali (Impressum)",
    description:
      "Informazioni ai sensi del § 5 DDG (legge tedesca sui servizi digitali), § 25 TDDDG e § 18 MStV.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "operator",
        title: "Fornitore del servizio (§ 5 DDG)",
        paragraphs: [`${cfg.operatorName} (${cfg.legalForm})`, address],
      },
      {
        id: "contact",
        title: "Contatto",
        paragraphs: [
          `${labels.email}: ${cfg.email}`,
          `${labels.phone}: ${cfg.phone}`,
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "vat",
        title: "Partita IVA",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "Responsabile dei contenuti (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "Risoluzione delle controversie UE",
        paragraphs: [
          "La Commissione europea mette a disposizione una piattaforma per la risoluzione online delle controversie (ODR): https://ec.europa.eu/consumers/odr/. Non siamo obbligati né disposti a partecipare a procedure di conciliazione presso un organismo di risoluzione delle controversie dei consumatori, salvo obbligo di legge.",
        ],
      },
      {
        id: "choice-of-law",
        title: "Legge applicabile (utenti internazionali)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildPrivacyIt(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Informativa sulla privacy",
    description:
      "Informazioni ai sensi degli artt. 13/14 del GDPR, § 25 TDDDG e informative supplementari per utenti globali.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "controller",
        title: "1. Titolare del trattamento",
        paragraphs: [
          ...controllerContactLinesConvenience(cfg, locale),
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "scope",
        title: "2. Ambito di applicazione e principi",
        paragraphs: [
          'La presente informativa descrive come ImmoCaption AI (« noi ») tratta i dati personali quando utilizza la nostra applicazione web a livello globale. Il GDPR europeo costituisce la nostra base di riferimento, con informative supplementari per Regno Unito, SEE, Svizzera, Canada (PIPEDA) e California (CCPA/CPRA).',
          "Operiamo secondo il principio Privacy-by-Design:",
        ],
        listItems: [
          "Nessun tracciamento non essenziale: i cookie pubblicitari o di marketing di terze parti non sono attivi per impostazione predefinita.",
          "Funzionamento essenziale: solo cookie di sessione tecnici strettamente necessari e archiviazione locale del browser per sicurezza, autenticazione e stato dei moduli.",
        ],
      },
      {
        id: "categories",
        title: "3. Categorie di dati trattati",
        listItems: [
          "Account e contatto: nome, e-mail, lingua e dati di fatturazione.",
          "Contenuti dell'annuncio: indirizzo, caratteristiche dell'immobile, planimetrie e foto caricate.",
          "Contenuti generati: testi di exposé, descrizioni, didascalie per i social media e PDF.",
          "Log tecnici: IP, timestamp, browser/dispositivo e header HTTP per sicurezza e rate limiting.",
          "Metadati di pagamento: identificativi di transazione, stato dell'abbonamento e indirizzo di fatturazione tramite Lemon Squeezy. (I numeri completi di carta non sono memorizzati presso di noi.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Finalità e basi giuridiche (GDPR art. 6)",
        listItems: [
          "Erogazione del servizio e contratto (art. 6(1)(b)): account, abbonamento, generazione IA e assistenza.",
          "Pagamento e sicurezza (art. 6(1)(b) e (f)): canoni di abbonamento e prevenzione delle frodi.",
          "Integrità del sistema (art. 6(1)(f)): log per prevenire abusi delle API e attacchi DDoS.",
          "Obblighi legali e fiscali (art. 6(1)(c)): conservazione delle fatture conformemente al HGB/AO tedesco.",
        ],
        paragraphs: [
          "Trattamento automatizzato (art. 22): l'IA genera bozze di testo in base ai dati inseriti. Non vengono adottate decisioni automatizzate con effetti giuridici significativi.",
        ],
      },
      {
        id: "processors",
        title: "5. Responsabili terzi e trasferimenti internazionali",
        paragraphs: [
          "I dati vengono trasferiti a responsabili del trattamento vincolati da accordi DPA. I trasferimenti extra UE/SEE si basano sul DPF e/o sulle clausole contrattuali standard (SCC):",
        ],
        listItems: [
          "Vercel Inc. (hosting/CDN): UE e USA.",
          "OpenAI LLC (motore IA): input API per la generazione di testo; secondo i termini API, non utilizzati per l'addestramento di modelli pubblici.",
          "Lemon Squeezy (pagamenti): carta, abbonamento e fatturazione.",
        ],
      },
      {
        id: "retention",
        title: "6. Conservazione e cancellazione",
        paragraphs: ["I dati sono conservati solo per il tempo necessario:"],
        listItems: [
          "Account e progetti: finché l'account è attivo; alla cancellazione, i caricamenti e i testi vengono eliminati dal database di produzione.",
          "Log del server: cancellazione o anonimizzazione entro 30–90 giorni.",
          "Conservazione legale: fatture fino a 10 anni ai sensi del § 147 AO e § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "7. I vostri diritti legali",
        paragraphs: [
          `Per esercitare i vostri diritti, contattateci a ${cfg.email}:`,
        ],
        listItems: [
          "Diritto di accesso (art. 15)",
          "Diritto di rettifica (art. 16)",
          "Diritto alla cancellazione / oblio (art. 17)",
          "Diritto di limitazione del trattamento (art. 18)",
          "Diritto alla portabilità dei dati (art. 20)",
          "Diritto di opposizione (art. 21)",
          "Diritto di reclamo presso un'autorità di controllo (art. 77), ad es. il BfDI in Germania",
          "California (CCPA/CPRA): diritto di conoscere, cancellare e rettificare; non « vendiamo » né « condividiamo » dati personali.",
          "Canada (PIPEDA): accesso e rettifica in qualsiasi momento.",
        ],
      },
      {
        id: "security",
        title: "8. Sicurezza dei dati",
        paragraphs: [
          "TLS, controlli di accesso, rate limiting API e valutazioni di sicurezza dei fornitori.",
        ],
      },
      {
        id: "children",
        title: "9. Privacy dei minori",
        paragraphs: [
          "Il servizio è destinato a professionisti immobiliari e consumatori di età pari o superiore a 18 anni. Non raccogliamo consapevolmente dati di minori di 16 anni.",
        ],
      },
      {
        id: "changes",
        title: "10. Modifiche alla presente informativa",
        paragraphs: [
          "Possiamo aggiornare la presente informativa. Le modifiche sostanziali saranno pubblicate con una data di « ultimo aggiornamento » revisionata.",
        ],
      },
      {
        id: "choice-of-law",
        title: "11. Legge applicabile (utenti internazionali)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildTermsIt(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "Termini di utilizzo e politica di recesso",
    description:
      "Condizioni contrattuali per l'abbonamento SaaS ImmoCaption AI e la generazione digitale.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "subject",
        title: "1. Oggetto",
        paragraphs: [
          "ImmoCaption AI fornisce software cloud per generare exposé immobiliari, didascalie e PDF mediante flussi di lavoro assistiti dall'IA.",
        ],
      },
      {
        id: "account",
        title: "2. Account e uso consentito",
        paragraphs: [
          "Dovete fornire dati di registrazione accurati e mantenere riservate le credenziali. Sono vietati l'uso improprio, l'accesso non autorizzato e i contenuti illeciti.",
        ],
      },
      {
        id: "user-content",
        title: "3. Contenuti dell'utente, diritti d'autore e manleva",
        paragraphs: [
          "Conservate la proprietà dei contenuti caricati. Ci concedete una licenza limitata per ospitarli e trattarli al fine di erogare il servizio.",
          "Garantite di possedere tutti i diritti d'autore, di personalità e commerciali sulle foto e sui dati caricati.",
          "Ci manleverete da reclami derivanti dai vostri caricamenti o da un uso improprio.",
        ],
      },
      {
        id: "ai",
        title: "4. Contenuti generati dall'IA",
        paragraphs: [
          "I risultati sono generati automaticamente e possono contenere errori. Siete responsabili della verifica prima della pubblicazione. Non viene fornita consulenza legale, fiscale o immobiliare.",
        ],
      },
      {
        id: "availability",
        title: "5. Disponibilità e limitazione di responsabilità",
        paragraphs: [
          "Puntiamo ad alta disponibilità ma non garantiamo un accesso ininterrotto. Possono verificarsi finestre di manutenzione.",
          "Ai sensi del diritto tedesco (BGB): responsabilità illimitata per dolo e colpa grave, danni alla persona e ai sensi della Produkthaftungsgesetz. In caso di negligenza lieve, solo per violazione di obblighi essenziali (Kardinalpflichten), limitata al danno prevedibile tipico.",
        ],
      },
      {
        id: "law",
        title: "6. Legge applicabile e foro competente",
        paragraphs: [
          "Diritto della Repubblica Federale di Germania, con esclusione della CISG.",
          choiceOfLawClauseConvenience(locale),
          `Foro esclusivo per commercianti e persone giuridiche: ${cfg.jurisdictionCity}, Germania; i fori obbligatori dei consumatori restano salvi.`,
        ],
      },
      {
        id: "withdrawal",
        title: "7. Diritto di recesso UE (servizi digitali)",
        paragraphs: [
          "I consumatori dell'UE hanno generalmente 14 giorni di recesso per i contratti a distanza.",
          "Se richiedete l'inizio immediato del servizio prima della scadenza del termine, con il vostro consenso esplicito, il diritto di recesso si perde una volta iniziata la prestazione completa.",
          "Le istruzioni e il modulo tipo sono forniti al checkout e nella conferma d'ordine.",
        ],
      },
      {
        id: "subscription",
        title: "8. Abbonamenti e recesso",
        paragraphs: [
          "I piani a pagamento si rinnovano fino alla cancellazione nel portale clienti Lemon Squeezy. I diritti legali dei consumatori restano salvi.",
        ],
      },
      {
        id: "retention",
        title: "9. Conservazione legale (HGB / AO)",
        paragraphs: [
          "I documenti contabili e di fatturazione possono essere conservati fino a dieci anni ai sensi del § 257 HGB e § 147 AO.",
        ],
      },
    ],
  };
}
