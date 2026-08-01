import { operatorAddressLine } from "@/content/legal/clauses";
import {
  choiceOfLawClauseConvenience,
  controllerContactLinesConvenience,
  privacyContactTdddgConvenience,
} from "@/content/legal/convenience/clauses";
import { convenienceMeta } from "@/content/legal/convenience/types";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

const locale = "ar" as const;

export function buildImprintAr(cfg: LegalBusinessConfig): LegalDocument {
  const address = operatorAddressLine(cfg);
  const labels = { email: "البريد الإلكتروني", phone: "الهاتف" };
  return {
    kind: "imprint",
    title: "الإشعار القانوني (Impressum)",
    description:
      "معلومات وفق § 5 DDG (قانون الخدمات الرقمية الألماني)، § 25 TDDDG و § 18 MStV.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "operator",
        title: "مقدّم الخدمة (§ 5 DDG)",
        paragraphs: [`${cfg.operatorName} (${cfg.legalForm})`, address],
      },
      {
        id: "contact",
        title: "التواصل",
        paragraphs: [
          `${labels.email}: ${cfg.email}`,
          `${labels.phone}: ${cfg.phone}`,
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "vat",
        title: "رقم التعريف الضريبي (VAT)",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "المسؤول عن المحتوى (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "تسوية المنازعات في الاتحاد الأوروبي",
        paragraphs: [
          "توفر المفوضية الأوروبية منصة لتسوية المنازعات عبر الإنترنت (ODR): https://ec.europa.eu/consumers/odr/. لسنا ملزمين أو راغبين في المشاركة في التحكيم أمام هيئة تسوية منازعات المستهلكين إلا إذا فرض القانون ذلك.",
        ],
      },
      {
        id: "choice-of-law",
        title: "القانون الواجب التطبيق (المستخدمون الدوليون)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildPrivacyAr(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "سياسة الخصوصية",
    description:
      "معلومات وفق المواد 13/14 من GDPR، § 25 TDDDG وإفصاحات إضافية للمستخدمين حول العالم.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "controller",
        title: "1. مسؤول معالجة البيانات",
        paragraphs: [
          ...controllerContactLinesConvenience(cfg, locale),
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "scope",
        title: "2. النطاق والمبادئ",
        paragraphs: [
          "توضّح هذه السياسة كيف تُعالج ImmoCaption AI (« نحن ») البيانات الشخصية عند استخدام تطبيق الويب عالمياً. يُعد GDPR الأوروبي مرجعنا الأساسي، مع إفصاحات إضافية للمملكة المتحدة والمنطقة الاقتصادية الأوروبية وسويسra وكندا (PIPEDA) وCalifornia (CCPA/CPRA).",
          "نعمل وفق مبدأ Privacy-by-Design:",
        ],
        listItems: [
          "لا تتبع غير ضروري: ملفات تعريف الارتباط الإعلانية أو التسويقية لأطراف ثالثة غير مفعّلة افتراضياً.",
          "التشغيل الأساسي: ملفات تعريف ارتباط الجلسة الفنية الضرورية فقط والتخزين المحلي للمتصفح للأمان والمصادقة وحالة النماذج.",
        ],
      },
      {
        id: "categories",
        title: "3. فئات البيانات المُعالَجة",
        listItems: [
          "الحساب والتواصل: الاسم والبريد الإلكتروني واللغة وتفاصيل الفوترة.",
          "محتوى الإعلان: العنوان ومواصفات العقار والمخططات والصور المرفوعة.",
          "المخرجات المُولَّدة: نصوص exposé والوصف وتسميات التواصل الاجتماعي وملفات PDF.",
          "سجلات تقنية: عنوان IP والطابع الزمني والمتصفح/الجهاز ورؤوس HTTP للأمان وتحديد المعدل.",
          "بيانات وصفية للدفع: معرّفات المعاملات وحالة الاشتراك وعنوان الفوترة عبر Lemon Squeezy. (أرقام البطاقات الكاملة لا تُخزَّن لدينا.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "4. الأغراض والأسس القانونية (GDPR المادة 6)",
        listItems: [
          "تقديم الخدمة والعقد (المادة 6(1)(b)): الحساب والاشتراك وتوليد AI والدعم.",
          "الدفع والأمان (المادة 6(1)(b) و (f)): رسوم الاشتراك ومنع الاحتيال.",
          "سلامة النظام (المادة 6(1)(f)): السجلات لمنع إساءة استخدام API وهجمات DDoS.",
          "الالتزامات القانونية والضريبية (المادة 6(1)(c)): الاحتفاظ بالفواتير وفق HGB/AO الألماني.",
        ],
        paragraphs: [
          "المعالجة الآلية (المادة 22): يُولّد AI مسودات نصية بناءً على مدخلاتك. لا تُتخذ قرارات آلية ذات آثار قانونية جوهرية.",
        ],
      },
      {
        id: "processors",
        title: "5. معالجو البيانات من أطراف ثالثة والنقل الدولي",
        paragraphs: [
          "تُنقل البيانات إلى معالجين ملزمين باتفاقيات معالجة (DPA). يعتمد النقل خارج EU/EEA على DPF و/أو البنود التعاقدية القياسية (SCC):",
        ],
        listItems: [
          "Vercel Inc. (الاستضافة/CDN): الاتحاد الأوروبي والولايات المتحدة.",
          "OpenAI LLC (محرك AI): مدخلات API لتوليد النص؛ وفق شروط API لا تُستخدم لتدريب النماذج العامة.",
          "Lemon Squeezy (الدفع): البطاقة والاشتراك والفوترة.",
        ],
      },
      {
        id: "retention",
        title: "6. الاحتفاظ والحذف",
        paragraphs: ["تُحفظ البيانات فقط للمدة اللازمة:"],
        listItems: [
          "الحساب والمشاريع: طالما الحساب نشط؛ عند الحذف تُزال المرفوعات والنصوص من قاعدة الإنتاج.",
          "سجلات الخادم: حذف أو إخفاء الهوية خلال 30–90 يوماً.",
          "الاحتفاظ القانوني: الفواتير حتى 10 سنوات وفق § 147 AO و § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "7. حقوقك القانونية",
        paragraphs: [
          `لممارسة حقوقك، تواصل معنا على ${cfg.email}:`,
        ],
        listItems: [
          "حق الوصول (المادة 15)",
          "حق التصحيح (المادة 16)",
          "حق الحذف / النسيان (المادة 17)",
          "حق تقييد المعالجة (المادة 18)",
          "حق نقل البيانات (المادة 20)",
          "حق الاعتراض (المادة 21)",
          "حق تقديم شكوى إلى سلطة رقابية (المادة 77)، مثل BfDI في ألمانيا",
          "California (CCPA/CPRA): حق المعرفة والحذف والتصحيح؛ لا « نبيع » أو « نشارك » البيانات الشخصية.",
          "Canada (PIPEDA): الوصول والتصحيح في أي وقت.",
        ],
      },
      {
        id: "security",
        title: "8. أمن البيانات",
        paragraphs: [
          "TLS وضوابط الوصول وتحديد معدل API وتقييمات أمن مقدمي الخدمة.",
        ],
      },
      {
        id: "children",
        title: "9. خصوصية الأطفال",
        paragraphs: [
          "الخدمة مخصّصة لمحترفي العقارات والمستهلكين من عمر 18 سنة فأكثر. لا نجمع عن قصد بيانات أطفال دون 16 سنة.",
        ],
      },
      {
        id: "changes",
        title: "10. تغييرات هذه السياسة",
        paragraphs: [
          "قد نُحدّث هذه السياسة. تُنشر التغييرات الجوهرية مع تاريخ « آخر تحديث » مُراجع.",
        ],
      },
      {
        id: "choice-of-law",
        title: "11. القانون الواجب التطبيق (المستخدمون الدوليون)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildTermsAr(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "شروط الاستخدام وسياسة الإلغاء",
    description:
      "شروط العقد لاشتراك ImmoCaption AI SaaS والتوليد الرقمي.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "subject",
        title: "1. موضوع العقد",
        paragraphs: [
          "تقدّم ImmoCaption AI برمجيات سحابية لتوليد exposés عقارية وتسميات توضيحية وملفات PDF عبر سير عمل مدعوم بالذكاء الاصطناعي.",
        ],
      },
      {
        id: "account",
        title: "2. الحساب والاستخدام المسموح",
        paragraphs: [
          "يجب تقديم بيانات تسجيل صحيحة والحفاظ على سرية بيانات الدخول. يُحظر إساءة الاستخدام والوصول غير المصرّح به والمحتوى غير القانوني.",
        ],
      },
      {
        id: "user-content",
        title: "3. محتوى المستخدم وحقوق النشر والتعويض",
        paragraphs: [
          "تحتفظ بملكية المحتوى المرفوع. تمنحنا ترخيصاً محدوداً لاستضافته ومعالجته لتقديم الخدمة.",
          "تضمن امتلاك جميع حقوق النشر والشخصية والتجارية للصور والبيانات المرفوعة.",
          "تُعوّضنا عن أي مطالبات ناشئة عن رفوعاتك أو إساءة الاستخدام.",
        ],
      },
      {
        id: "ai",
        title: "4. المخرجات المُولَّدة بالذكاء الاصطناعي",
        paragraphs: [
          "تُولَّد النتائج آلياً وقد تحتوي على أخطاء. أنت مسؤول عن المراجعة قبل النشر. لا نقدّم استشارات قانونية أو ضريبية أو عقارية.",
        ],
      },
      {
        id: "availability",
        title: "5. التوفر وتحديد المسؤولية",
        paragraphs: [
          "نسعى لتوفر عالٍ لكن لا نضمن وصولاً دون انقطاع. قد تحدث فترات صيانة.",
          "وفق القانون الألماني (BGB): مسؤولية غير محدودة عن القصد والإهمال الجسيم والإصابات الجسدية وبموجب Produkthaftungsgesetz. في الإهمال البسيط، فقط عند خرق الالتزامات الأساسية (Kardinalpflichten)، محدودة بالضرر المتوقع المعتاد.",
        ],
      },
      {
        id: "law",
        title: "6. القانون الواجب التطبيق والاختصاص القضائي",
        paragraphs: [
          "قانون جمهورية ألمانيا الاتحادية، مع استثناء CISG.",
          choiceOfLawClauseConvenience(locale),
          `الاختصاص الحصري للتجار والكيانات القانونية: ${cfg.jurisdictionCity}، ألمانيا؛ تبقى اختصاصات المستهلك الإلزامية سارية.`,
        ],
      },
      {
        id: "withdrawal",
        title: "7. حق الانسحاب في الاتحاد الأوروبي (الخدمات الرقمية)",
        paragraphs: [
          "لمستهلكي الاتحاد الأوروبي عادةً 14 يوماً للانسحاب من العقود عن بُعد.",
          "عند طلب بدء الخدمة فوراً قبل انتهاء المهلة، بموافقتك الصريحة، يُفقد حق الانسحاب بمجرد بدء الأداء الكامل.",
          "تُقدَّم تعليمات النموذج والنموذج في صفحة الدفع وتأكيد الطلب.",
        ],
      },
      {
        id: "subscription",
        title: "8. الاشتراكات والإلغاء",
        paragraphs: [
          "تُجدَّد الخطط المدفوعة حتى الإلغاء في بوابة عملاء Lemon Squeezy. تبقى حقوق المستهلك القانونية سارية.",
        ],
      },
      {
        id: "retention",
        title: "9. الاحتفاظ القانوني (HGB / AO)",
        paragraphs: [
          "قد تُحفظ سجلات الفوترة والمحاسبة حتى عشر سنوات وفق § 257 HGB و § 147 AO.",
        ],
      },
    ],
  };
}
