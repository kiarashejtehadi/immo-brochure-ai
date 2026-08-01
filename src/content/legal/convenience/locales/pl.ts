import { operatorAddressLine } from "@/content/legal/clauses";
import {
  choiceOfLawClauseConvenience,
  controllerContactLinesConvenience,
  privacyContactTdddgConvenience,
} from "@/content/legal/convenience/clauses";
import { convenienceMeta } from "@/content/legal/convenience/types";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

const locale = "pl" as const;

export function buildImprintPl(cfg: LegalBusinessConfig): LegalDocument {
  const address = operatorAddressLine(cfg);
  const labels = { email: "E-mail", phone: "Telefon" };
  return {
    kind: "imprint",
    title: "Informacje prawne (Impressum)",
    description:
      "Informacje zgodnie z § 5 DDG (niemiecka ustawa o usługach cyfrowych), § 25 TDDDG i § 18 MStV.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "operator",
        title: "Dostawca usług (§ 5 DDG)",
        paragraphs: [`${cfg.operatorName} (${cfg.legalForm})`, address],
      },
      {
        id: "contact",
        title: "Kontakt",
        paragraphs: [
          `${labels.email}: ${cfg.email}`,
          `${labels.phone}: ${cfg.phone}`,
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "vat",
        title: "Numer identyfikacji podatkowej VAT",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "Odpowiedzialny za treść (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "Rozstrzyganie sporów UE",
        paragraphs: [
          "Komisja Europejska udostępnia platformę internetowego rozstrzygania sporów (ODR): https://ec.europa.eu/consumers/odr/. Nie jesteśmy zobowiązani ani skłonni do udziału w postępowaniu mediacyjnym przed organem polubownego rozstrzygania sporów konsumenckich, chyba że wymaga tego prawo.",
        ],
      },
      {
        id: "choice-of-law",
        title: "Prawo właściwe (użytkownicy międzynarodowi)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildPrivacyPl(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Polityka prywatności",
    description:
      "Informacje zgodnie z art. 13/14 RODO, § 25 TDDDG i uzupełniające oświadczenia dla użytkowników globalnych.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "controller",
        title: "1. Administrator danych",
        paragraphs: [
          ...controllerContactLinesConvenience(cfg, locale),
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "scope",
        title: "2. Zakres i zasady",
        paragraphs: [
          'Niniejsza polityka opisuje, w jaki sposób ImmoCaption AI (« my ») przetwarza dane osobowe podczas korzystania z naszej aplikacji webowej na całym świecie. Europejskie RODO stanowi naszą podstawę, z uzupełniającymi informacjami dla Wielkiej Brytanii, EOG, Szwajcarii, Kanady (PIPEDA) i Kalifornii (CCPA/CPRA).',
          "Działamy zgodnie z zasadą Privacy-by-Design:",
        ],
        listItems: [
          "Brak nieistotnego śledzenia: pliki cookie reklamowe lub marketingowe stron trzecich nie są domyślnie aktywne.",
          "Działanie niezbędne: tylko techniczne pliki cookie sesji i lokalne przechowywanie w przeglądarce dla bezpieczeństwa, uwierzytelniania i stanu formularzy.",
        ],
      },
      {
        id: "categories",
        title: "3. Kategorie przetwarzanych danych",
        listItems: [
          "Konto i kontakt: imię i nazwisko, e-mail, język i dane rozliczeniowe.",
          "Treść ogłoszenia: adres, cechy nieruchomości, plany i przesłane zdjęcia.",
          "Wygenerowane treści: teksty exposé, opisy, podpisy mediów społecznościowych i PDF.",
          "Logi techniczne: IP, znacznik czasu, przeglądarka/urządzenie i nagłówki HTTP dla bezpieczeństwa i limitowania zapytań.",
          "Metadane płatności: identyfikatory transakcji, status subskrypcji i adres rozliczeniowy przez Lemon Squeezy. (Pełne numery kart nie są przechowywane u nas.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Cele i podstawy prawne (RODO art. 6)",
        listItems: [
          "Świadczenie usługi i umowa (art. 6(1)(b)): konto, subskrypcja, generowanie AI i wsparcie.",
          "Płatność i bezpieczeństwo (art. 6(1)(b) i (f)): opłaty subskrypcyjne i zapobieganie oszustwom.",
          "Integralność systemu (art. 6(1)(f)): logi w celu zapobiegania nadużyciom API i atakom DDoS.",
          "Obowiązki prawne i podatkowe (art. 6(1)(c)): przechowywanie faktur zgodnie z niemieckim HGB/AO.",
        ],
        paragraphs: [
          "Przetwarzanie zautomatyzowane (art. 22): AI generuje wstępne teksty na podstawie wprowadzonych danych. Nie podejmujemy zautomatyzowanych decyzji o istotnych skutkach prawnych.",
        ],
      },
      {
        id: "processors",
        title: "5. Podmioty przetwarzające i transfery międzynarodowe",
        paragraphs: [
          "Dane są przekazywane podmiotom przetwarzającym objętym umowami DPA. Transfery poza UE/EOG opierają się na DPF i/lub standardowych klauzulach umownych (SCC):",
        ],
        listItems: [
          "Vercel Inc. (hosting/CDN): UE i USA.",
          "OpenAI LLC (silnik AI): dane wejściowe API do generowania tekstu; zgodnie z warunkami API nie są używane do trenowania publicznych modeli.",
          "Lemon Squeezy (płatności): karta, subskrypcja i fakturowanie.",
        ],
      },
      {
        id: "retention",
        title: "6. Przechowywanie i usuwanie",
        paragraphs: ["Dane są przechowywane tylko tak długo, jak to konieczne:"],
        listItems: [
          "Konto i projekty: dopóki konto jest aktywne; po usunięciu przesłane pliki i teksty są usuwane z bazy produkcyjnej.",
          "Logi serwera: usunięcie lub anonimizacja w ciągu 30–90 dni.",
          "Przechowywanie prawne: faktury do 10 lat zgodnie z § 147 AO i § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "7. Twoje prawa",
        paragraphs: [
          `Aby skorzystać ze swoich praw, skontaktuj się z nami pod adresem ${cfg.email}:`,
        ],
        listItems: [
          "Prawo dostępu (art. 15)",
          "Prawo do sprostowania (art. 16)",
          "Prawo do usunięcia / bycia zapomnianym (art. 17)",
          "Prawo do ograniczenia przetwarzania (art. 18)",
          "Prawo do przenoszenia danych (art. 20)",
          "Prawo sprzeciwu (art. 21)",
          "Prawo wniesienia skargi do organu nadzorczego (art. 77), np. BfDI w Niemczech",
          "Kalifornia (CCPA/CPRA): prawo do informacji, usunięcia i sprostowania; nie « sprzedajemy » ani « udostępniamy » danych osobowych.",
          "Kanada (PIPEDA): dostęp i sprostowanie w dowolnym momencie.",
        ],
      },
      {
        id: "security",
        title: "8. Bezpieczeństwo danych",
        paragraphs: [
          "TLS, kontrola dostępu, limitowanie zapytań API i oceny bezpieczeństwa dostawców.",
        ],
      },
      {
        id: "children",
        title: "9. Prywatność dzieci",
        paragraphs: [
          "Usługa jest przeznaczona dla profesjonalistów nieruchomości i konsumentów w wieku 18 lat i więcej. Świadomie nie zbieramy danych dzieci poniżej 16 lat.",
        ],
      },
      {
        id: "changes",
        title: "10. Zmiany niniejszej polityki",
        paragraphs: [
          "Możemy aktualizować niniejszą politykę. Istotne zmiany zostaną opublikowane z zaktualizowaną datą « ostatniej aktualizacji ».",
        ],
      },
      {
        id: "choice-of-law",
        title: "11. Prawo właściwe (użytkownicy międzynarodowi)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildTermsPl(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "Warunki korzystania i polityka anulowania",
    description:
      "Warunki umowy dla subskrypcji SaaS ImmoCaption AI i generowania cyfrowego.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "subject",
        title: "1. Przedmiot umowy",
        paragraphs: [
          "ImmoCaption AI dostarcza oprogramowanie w chmurze do generowania exposé nieruchomości, podpisów i plików PDF za pomocą workflow wspieranych przez AI.",
        ],
      },
      {
        id: "account",
        title: "2. Konto i dozwolone korzystanie",
        paragraphs: [
          "Należy podać prawidłowe dane rejestracyjne i zachować poufność danych logowania. Nadużycia, nieuprawniony dostęp i nielegalne treści są zabronione.",
        ],
      },
      {
        id: "user-content",
        title: "3. Treści użytkownika, prawa autorskie i odszkodowanie",
        paragraphs: [
          "Zachowujesz własność przesłanych treści. Udzielasz nam ograniczonej licencji na hosting i przetwarzanie w celu świadczenia usługi.",
          "Gwarantujesz posiadanie wszystkich niezbędnych praw autorskich, osobistych i komercyjnych do przesłanych zdjęć i danych.",
          "Zobowiązujesz się do zwolnienia nas z roszczeń wynikających z Twoich przesłań lub nadużyć.",
        ],
      },
      {
        id: "ai",
        title: "4. Treści generowane przez AI",
        paragraphs: [
          "Wyniki są generowane automatycznie i mogą zawierać błędy. Jesteś odpowiedzialny za weryfikację przed publikacją. Nie udzielamy porad prawnych, podatkowych ani maklerskich.",
        ],
      },
      {
        id: "availability",
        title: "5. Dostępność i ograniczenie odpowiedzialności",
        paragraphs: [
          "Dążymy do wysokiej dostępności, ale nie gwarantujemy nieprzerwanego dostępu. Możliwe są okna konserwacji.",
          "Zgodnie z niemieckim prawem (BGB): nieograniczona odpowiedzialność za umyślność i rażące niedbalstwo, uszkodzenia ciała oraz na podstawie Produkthaftungsgesetz. W przypadku lekkiego niedbalstwa tylko za naruszenie istotnych obowiązków umownych (Kardinalpflichten), ograniczone do przewidywalnej, typowej szkody.",
        ],
      },
      {
        id: "law",
        title: "6. Prawo właściwe i jurysdykcja",
        paragraphs: [
          "Prawo Republiki Federalnej Niemiec, z wyłączeniem CISG.",
          choiceOfLawClauseConvenience(locale),
          `Wyłączna jurysdykcja dla przedsiębiorców i osób prawnych: ${cfg.jurisdictionCity}, Niemcy; obowiązkowe jurysdykcje konsumenckie pozostają nienaruszone.`,
        ],
      },
      {
        id: "withdrawal",
        title: "7. Prawo odstąpienia UE (usługi cyfrowe)",
        paragraphs: [
          "Konsumenci z UE mają zazwyczaj 14 dni na odstąpienie od umowy zawartej na odległość.",
          "Jeśli żądasz natychmiastowego rozpoczęcia usługi przed upływem terminu, za Twoją wyraźną zgodą, prawo odstąpienia wygasa po rozpoczęciu pełnego świadczenia.",
          "Wzór instrukcji odstąpienia i formularz są udostępniane przy checkout i w potwierdzeniu zamówienia.",
        ],
      },
      {
        id: "subscription",
        title: "8. Subskrypcje i anulowanie",
        paragraphs: [
          "Płatne plany odnawiają się do momentu anulowania w portalu klienta Lemon Squeezy. Ustawowe prawa konsumenta pozostają nienaruszone.",
        ],
      },
      {
        id: "retention",
        title: "9. Przechowywanie prawne (HGB / AO)",
        paragraphs: [
          "Dokumenty rozliczeniowe i księgowe mogą być przechowywane do dziesięciu lat zgodnie z § 257 HGB i § 147 AO.",
        ],
      },
    ],
  };
}
