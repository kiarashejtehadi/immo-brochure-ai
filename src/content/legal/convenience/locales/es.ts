import { operatorAddressLine } from "@/content/legal/clauses";
import {
  choiceOfLawClauseConvenience,
  controllerContactLinesConvenience,
  privacyContactTdddgConvenience,
} from "@/content/legal/convenience/clauses";
import { convenienceMeta } from "@/content/legal/convenience/types";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

const locale = "es" as const;

export function buildImprintEs(cfg: LegalBusinessConfig): LegalDocument {
  const address = operatorAddressLine(cfg);
  const labels = { email: "Correo electrónico", phone: "Teléfono" };
  return {
    kind: "imprint",
    title: "Aviso legal (Impressum)",
    description:
      "Información conforme al § 5 DDG (ley alemana de servicios digitales), § 25 TDDDG y § 18 MStV.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "operator",
        title: "Proveedor de servicios (§ 5 DDG)",
        paragraphs: [`${cfg.operatorName} (${cfg.legalForm})`, address],
      },
      {
        id: "contact",
        title: "Contacto",
        paragraphs: [
          `${labels.email}: ${cfg.email}`,
          `${labels.phone}: ${cfg.phone}`,
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "vat",
        title: "Número de identificación fiscal (IVA)",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "Responsable del contenido (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "Resolución de litigios UE",
        paragraphs: [
          "La Comisión Europea ofrece una plataforma de resolución de litigios en línea (RLL): https://ec.europa.eu/consumers/odr/. No estamos obligados ni dispuestos a participar en procedimientos de arbitraje ante un organismo de conciliación de consumidores, salvo que la ley lo exija.",
        ],
      },
      {
        id: "choice-of-law",
        title: "Ley aplicable (usuarios internacionales)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildPrivacyEs(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "Política de privacidad",
    description:
      "Información conforme a los arts. 13/14 del RGPD, § 25 TDDDG y divulgaciones complementarias para usuarios globales.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "controller",
        title: "1. Responsable del tratamiento",
        paragraphs: [
          ...controllerContactLinesConvenience(cfg, locale),
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "scope",
        title: "2. Ámbito y principios",
        paragraphs: [
          'Esta política describe cómo ImmoCaption AI (« nosotros ») trata los datos personales cuando utiliza nuestra aplicación web en todo el mundo. El RGPD europeo es nuestra referencia base, con avisos complementarios para el Reino Unido, el EEE, Suiza, Canadá (PIPEDA) y California (CCPA/CPRA).',
          "Operamos según el principio Privacy-by-Design:",
        ],
        listItems: [
          "Sin seguimiento no esencial: las cookies publicitarias o de marketing de terceros no están activadas por defecto.",
          "Funcionamiento esencial: solo cookies de sesión técnicas estrictamente necesarias y almacenamiento local del navegador para seguridad, autenticación y estado de formularios.",
        ],
      },
      {
        id: "categories",
        title: "3. Categorías de datos tratados",
        listItems: [
          "Cuenta y contacto: nombre, correo electrónico, idioma y datos de facturación.",
          "Contenido del anuncio: dirección, características del inmueble, planos y fotos subidas.",
          "Contenidos generados: textos de exposé, descripciones, leyendas para redes sociales y PDF.",
          "Registros técnicos: IP, marca temporal, navegador/dispositivo y cabeceras HTTP para seguridad y limitación de tasa.",
          "Metadatos de pago: identificadores de transacción, estado de suscripción y dirección de facturación vía Lemon Squeezy. (Los números completos de tarjeta no se almacenan en nuestros servidores.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. Finalidades y bases jurídicas (RGPD art. 6)",
        listItems: [
          "Prestación del servicio y contrato (art. 6(1)(b)): cuenta, suscripción, generación IA y soporte.",
          "Pago y seguridad (art. 6(1)(b) y (f)): cuotas de suscripción y prevención del fraude.",
          "Integridad del sistema (art. 6(1)(f)): registros para prevenir abuso de API y ataques DDoS.",
          "Obligaciones legales y fiscales (art. 6(1)(c)): conservación de facturas conforme al HGB/AO alemán.",
        ],
        paragraphs: [
          "Tratamiento automatizado (art. 22): la IA genera borradores de texto a partir de sus entradas. No se adoptan decisiones automatizadas con efectos jurídicos significativos.",
        ],
      },
      {
        id: "processors",
        title: "5. Encargados terceros y transferencias internacionales",
        paragraphs: [
          "Los datos se transfieren a encargados con acuerdos de tratamiento (DPA). Las transferencias fuera de la UE/EEE se basan en el DPF y/o cláusulas contractuales tipo (SCC):",
        ],
        listItems: [
          "Vercel Inc. (hosting/CDN): UE y EE. UU.",
          "OpenAI LLC (motor IA): entradas API para generación de texto; conforme a las condiciones API, no se usan para entrenar modelos públicos.",
          "Lemon Squeezy (pagos): tarjeta, suscripción y facturación.",
        ],
      },
      {
        id: "retention",
        title: "6. Conservación y supresión",
        paragraphs: ["Los datos se conservan solo el tiempo necesario:"],
        listItems: [
          "Cuenta y proyectos: mientras la cuenta esté activa; al eliminar, las subidas y textos se borran de la base de producción.",
          "Registros del servidor: eliminación o anonimización en 30–90 días.",
          "Conservación legal: facturas hasta 10 años conforme al § 147 AO y § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "7. Sus derechos legales",
        paragraphs: [
          `Para ejercer sus derechos, contáctenos en ${cfg.email}:`,
        ],
        listItems: [
          "Derecho de acceso (art. 15)",
          "Derecho de rectificación (art. 16)",
          "Derecho de supresión / olvido (art. 17)",
          "Derecho a la limitación del tratamiento (art. 18)",
          "Derecho a la portabilidad (art. 20)",
          "Derecho de oposición (art. 21)",
          "Derecho a reclamar ante una autoridad de control (art. 77), p. ej. el BfDI en Alemania",
          "California (CCPA/CPRA): derecho a conocer, suprimir y rectificar; no « vendemos » ni « compartimos » datos personales.",
          "Canadá (PIPEDA): acceso y rectificación en cualquier momento.",
        ],
      },
      {
        id: "security",
        title: "8. Seguridad de los datos",
        paragraphs: [
          "TLS, controles de acceso, limitación de tasa API y evaluaciones de seguridad de proveedores.",
        ],
      },
      {
        id: "children",
        title: "9. Privacidad de menores",
        paragraphs: [
          "El servicio está dirigido a profesionales inmobiliarios y consumidores de 18 años o más. No recopilamos conscientemente datos de menores de 16 años.",
        ],
      },
      {
        id: "changes",
        title: "10. Cambios en esta política",
        paragraphs: [
          "Podemos actualizar esta política. Los cambios importantes se publicarán con una fecha de « última actualización » revisada.",
        ],
      },
      {
        id: "choice-of-law",
        title: "11. Ley aplicable (usuarios internacionales)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildTermsEs(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "Términos de uso y política de cancelación",
    description:
      "Condiciones contractuales para la suscripción SaaS de ImmoCaption AI y la generación digital.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "subject",
        title: "1. Objeto",
        paragraphs: [
          "ImmoCaption AI ofrece software en la nube para generar exposés inmobiliarios, leyendas y PDF mediante flujos de trabajo asistidos por IA.",
        ],
      },
      {
        id: "account",
        title: "2. Cuenta y uso permitido",
        paragraphs: [
          "Debe proporcionar datos de registro exactos y mantener la confidencialidad de sus credenciales. Está prohibido el uso indebido, el acceso no autorizado y los contenidos ilícitos.",
        ],
      },
      {
        id: "user-content",
        title: "3. Contenido del usuario, derechos de autor e indemnización",
        paragraphs: [
          "Conserva la propiedad del contenido subido. Nos concede una licencia limitada para alojarlo y procesarlo con el fin de prestar el servicio.",
          "Garantiza disponer de todos los derechos de autor, de personalidad y comerciales sobre las fotos y datos subidos.",
          "Nos indemnizará frente a reclamaciones derivadas de sus subidas o uso indebido.",
        ],
      },
      {
        id: "ai",
        title: "4. Contenidos generados por IA",
        paragraphs: [
          "Los resultados se generan automáticamente y pueden contener errores. Usted es responsable de revisarlos antes de publicar. No se presta asesoramiento jurídico, fiscal ni inmobiliario.",
        ],
      },
      {
        id: "availability",
        title: "5. Disponibilidad y limitación de responsabilidad",
        paragraphs: [
          "Buscamos alta disponibilidad pero no garantizamos acceso ininterrumpido. Pueden producirse ventanas de mantenimiento.",
          "Conforme al derecho alemán (BGB): responsabilidad ilimitada por dolo y negligencia grave, daños corporales y según la Produkthaftungsgesetz. Por negligencia leve, solo por incumplimiento de obligaciones esenciales (Kardinalpflichten), limitada al daño previsible típico.",
        ],
      },
      {
        id: "law",
        title: "6. Ley aplicable y jurisdicción",
        paragraphs: [
          "Derecho de la República Federal de Alemania, con exclusión de la CISG.",
          choiceOfLawClauseConvenience(locale),
          `Jurisdicción exclusiva para comerciantes y personas jurídicas: ${cfg.jurisdictionCity}, Alemania; las jurisdicciones imperativas de consumidores permanecen intactas.`,
        ],
      },
      {
        id: "withdrawal",
        title: "7. Derecho de desistimiento UE (servicios digitales)",
        paragraphs: [
          "Los consumidores de la UE tienen generalmente 14 días de desistimiento en contratos a distancia.",
          "Si solicita el inicio inmediato del servicio antes de que expire el plazo, con su consentimiento expreso, pierde el derecho de desistimiento una vez iniciada la prestación completa.",
          "Las instrucciones y el formulario modelo se facilitan en el checkout y en la confirmación del pedido.",
        ],
      },
      {
        id: "subscription",
        title: "8. Suscripciones y cancelación",
        paragraphs: [
          "Los planes de pago se renuevan hasta su cancelación en el portal de clientes Lemon Squeezy. Los derechos legales de los consumidores permanecen intactos.",
        ],
      },
      {
        id: "retention",
        title: "9. Conservación legal (HGB / AO)",
        paragraphs: [
          "Los registros de facturación y contabilidad pueden conservarse hasta diez años conforme al § 257 HGB y § 147 AO.",
        ],
      },
    ],
  };
}
