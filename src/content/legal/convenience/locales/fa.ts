import { operatorAddressLine } from "@/content/legal/clauses";
import {
  choiceOfLawClauseConvenience,
  controllerContactLinesConvenience,
  privacyContactTdddgConvenience,
} from "@/content/legal/convenience/clauses";
import { convenienceMeta } from "@/content/legal/convenience/types";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument } from "@/types/legal-content";

const locale = "fa" as const;

export function buildImprintFa(cfg: LegalBusinessConfig): LegalDocument {
  const address = operatorAddressLine(cfg);
  const labels = { email: "ایمیل", phone: "تلفن" };
  return {
    kind: "imprint",
    title: "اطلاعات حقوقی (Impressum)",
    description:
      "اطلاعات مطابق § 5 DDG (قانون خدمات دیجیتال آلمان)، § 25 TDDDG و § 18 MStV.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "operator",
        title: "ارائه‌دهنده خدمات (§ 5 DDG)",
        paragraphs: [`${cfg.operatorName} (${cfg.legalForm})`, address],
      },
      {
        id: "contact",
        title: "تماس",
        paragraphs: [
          `${labels.email}: ${cfg.email}`,
          `${labels.phone}: ${cfg.phone}`,
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "vat",
        title: "شناسه مالیات بر ارزش افزوده",
        paragraphs: [cfg.vatId],
      },
      {
        id: "content-responsible",
        title: "مسئول محتوا (§ 18 (2) MStV)",
        paragraphs: [cfg.contentOfficer, address],
      },
      {
        id: "dispute",
        title: "حل اختلاف EU",
        paragraphs: [
          "کمیسیون اروپا بستری برای حل اختلاف آنلاین (ODR) ارائه می‌دهد: https://ec.europa.eu/consumers/odr/. ما موظف یا مایل به شرکت در داوری مصرف‌کننده نیستیم مگر آنکه قانون الزام کند.",
        ],
      },
      {
        id: "choice-of-law",
        title: "قانون حاکم (کاربران بین‌المللی)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildPrivacyFa(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "privacy",
    title: "سیاست حفظ حریم خصوصی",
    description:
      "اطلاعات مطابق GDPR مواد ۱۳/۱۴، § 25 TDDDG و افشاهای تکمیلی برای کاربران جهانی.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "controller",
        title: "۱. کنترل‌کننده داده",
        paragraphs: [
          ...controllerContactLinesConvenience(cfg, locale),
          privacyContactTdddgConvenience(cfg, locale),
        ],
      },
      {
        id: "scope",
        title: "۲. دامنه و اصول",
        paragraphs: [
          'این سیاست نحوه پردازش داده‌های شخصی ImmoCaption AI («ما») هنگام استفاده جهانی از برنامه وب را توضیح می‌دهد. GDPR اروپا خط پایه ماست و افشاهای تکمیلی برای UK، EEA، سوئیس، کانada (PIPEDA) و کالیفرنیا (CCPA/CPRA) داریم.',
          "بر اساس Privacy-by-Design عمل می‌کنیم:",
        ],
        listItems: [
          "بدون ردیابی غیرضروری: کوکی‌های تبلیغاتی/بازاریابی شخص ثالث به‌صورت پیش‌فرض فعال نیست.",
          "عملکرد ضروری: فقط کوکی‌های نشست فنی و ذخیره‌سازی مرورگر برای امنیت، احراز هویت و وضعیت فرم.",
        ],
      },
      {
        id: "categories",
        title: "۳. دسته‌های داده پردازش‌شده",
        listItems: [
          "حساب و تماس: نام، ایمیل، زبان و جزئیات صورتحساب.",
          "محتوای آگهی: آدرس، مشخصات ملک، پلان و عکس‌های آپلودشده.",
          "خروجی‌های تولیدشده: متن exposé، توضیحات، کپشن شبکه‌های اجتماعی و PDF.",
          "لاگ فنی: IP، زمان، مرورگر/دستگاه و هدر HTTP برای امنیت و rate-limit.",
          "متادیتای پرداخت: شناسه تراکنش، وضعیت اشتراک و آدرس صورتحساب از Lemon Squeezy. (شماره کارت کامل نزد ما ذخیره نمی‌شود.)",
        ],
        paragraphs: [],
      },
      {
        id: "purposes",
        title: "۴. اهداف و مبانی قانونی (GDPR ماده ۶)",
        listItems: [
          "ارائه سرویس و قرارداد (ماده ۶(۱)(b)): حساب، اشتراک، تولید AI و پشتیبانی.",
          "پرداخت و امنیت (ماده ۶(۱)(b) و (f)): کارمزد اشتراک و پیشگیری از تقلب.",
          "یکپارچگی سیستم (ماده ۶(۱)(f)): لاگ برای جلوگیری از سوءاستفاده API و DDoS.",
          "تعهدات قانونی/مالیاتی (ماده ۶(۱)(c)): نگهداری صورتحساب طبق HGB/AO آلمان.",
        ],
        paragraphs: [
          "پردازش خودکار (ماده ۲۲): AI متن پیش‌نویس بر اساس ورودی شما تولید می‌کند. تصمیم‌گیری خودکار با اثر حقوقی معنادار انجام نمی‌شود.",
        ],
      },
      {
        id: "processors",
        title: "۵. پردازشگران شخص ثالث و انتقال بین‌المللی",
        paragraphs: [
          "داده به پردازشگران با DPA منتقل می‌شود. انتقال خارج EU/EEA بر DPF و/یا SCC تکیه دارد:",
        ],
        listItems: [
          "Vercel Inc. (میزبانی/CDN): EU و US.",
          "OpenAI LLC (موتور AI): ورودی API برای تولید متن؛ طبق شرایط API برای آموزش مدل عمومی استفاده نمی‌شود.",
          "Lemon Squeezy (پرداخت): کارت، اشتراک و فاکتور.",
        ],
      },
      {
        id: "retention",
        title: "۶. نگهداری و حذف",
        paragraphs: ["داده فقط به مدت لازم نگهداری می‌شود:"],
        listItems: [
          "حساب و پروژه: تا فعال بودن حساب؛ با حذف، آپلودها و متن از DB تولید حذف می‌شوند.",
          "لاگ سرور: ۳۰–۹۰ روز سپس حذف/ناشناس‌سازی.",
          "نگهداری قانونی: صورتحساب تا ۱۰ سال طبق § 147 AO و § 257 HGB.",
        ],
      },
      {
        id: "rights",
        title: "۷. حقوق قانونی شما",
        paragraphs: [
          `برای اعمال حقوق با ${cfg.email} تماس بگیرید:`,
        ],
        listItems: [
          "دسترسی (ماده ۱۵)",
          "اصلاح (ماده ۱۶)",
          "حذف / فراموش شدن (ماده ۱۷)",
          "محدودیت پردازش (ماده ۱۸)",
          "قابلیت انتقال داده (ماده ۲۰)",
          "اعتراض (ماده ۲۱)",
          "شکایت به مرجع نظارتی (ماده ۷۷)، مثلاً BfDI آلمان",
          "کالیفرنیا (CCPA/CPRA): حق اطلاع، حذف و اصلاح؛ داده «فروخته» یا «به اشتراک گذاشته» نمی‌شود.",
          "Kanada (PIPEDA): دسترسی و اصلاح در هر زمان.",
        ],
      },
      {
        id: "security",
        title: "۸. امنیت داده",
        paragraphs: [
          "TLS، کنترل دسترسی، rate-limiting API و ارزیابی امنیتی سرویس‌دهندگان.",
        ],
      },
      {
        id: "children",
        title: "۹. حریم خصوصی کودکان",
        paragraphs: [
          "سرویس برای متخصصان املاک و مصرف‌کنندگان ۱۸+ است. آگاهانه داده کودکان زیر ۱۶ جمع نمی‌کنیم.",
        ],
      },
      {
        id: "changes",
        title: "۱۰. تغییرات این سیاست",
        paragraphs: [
          "ممکن است این سیاست را به‌روز کنیم. تغییرات مهم با تاریخ «آخرین به‌روزرسانی» منتشر می‌شود.",
        ],
      },
      {
        id: "choice-of-law",
        title: "۱۱. قانون حاکم (کاربران بین‌المللی)",
        paragraphs: [choiceOfLawClauseConvenience(locale)],
      },
    ],
  };
}

export function buildTermsFa(cfg: LegalBusinessConfig): LegalDocument {
  return {
    kind: "terms",
    title: "شرایط استفاده و سیاست لغو",
    description: "شرایط قرارداد برای اشتراک SaaS ImmoCaption AI و تولید دیجیتال.",
    ...convenienceMeta(cfg, locale),
    sections: [
      {
        id: "subject",
        title: "۱. موضوع",
        paragraphs: [
          "ImmoCaption AI نرم‌افزار ابری برای تولید exposé، کپشن و PDF املاک با گردش‌کار AI ارائه می‌دهد.",
        ],
      },
      {
        id: "account",
        title: "۲. حساب و استفاده مجاز",
        paragraphs: [
          "اطلاعات ثبت‌نام صحیح و محرمانگی رمز عبور لازم است. سوءاستفاده، دسترسی غیرمجاز و محتوای غیرقانونی ممنوع است.",
        ],
      },
      {
        id: "user-content",
        title: "۳. محتوای کاربر، حق نشر و جبران خسارت",
        paragraphs: [
          "مالکیت محتوای آپلودشده با شماست. مجوز محدود برای میزبانی و پردازش جهت ارائه سرویس می‌دهید.",
          "تضمین می‌کنید حقوق نشر، شخصیت و مجوز تجاری برای همه عکس‌ها و داده‌ها را دارید.",
          "ما را در برابر ادعاهای ناشی از آپلود یا سوءاستفاده شما جبران می‌کنید.",
        ],
      },
      {
        id: "ai",
        title: "۴. خروجی تولیدشده با AI",
        paragraphs: [
          "خروجی خودکار است و ممکن است خطا داشته باشد. قبل از انتشار مسئولیت بررسی با شماست. مشاوره حقوقی/مالی/مشاور املاک ارائه نمی‌شود.",
        ],
      },
      {
        id: "availability",
        title: "۵. در دسترس بودن و محدودیت مسئولیت",
        paragraphs: [
          "دسترسی بالا هدف ماست اما بدون وقفه تضمین نمی‌شود. نگهداری ممکن است.",
          "طبق قانون آلمان (BGB): مسئولیت نامحدود برای قصد و gross negligence، آسیب جانی/بدنی و Produkthaftungsgesetz. برای negligence جزئی فقط نقض تعهدات اساسی (Kardinalpflichten) تا خسارت قابل پیش‌بینی.",
        ],
      },
      {
        id: "law",
        title: "۶. قانون حاکم و صلاحیت",
        paragraphs: [
          "قانون آلمان، به‌جز CISG.",
          choiceOfLawClauseConvenience(locale),
          `صلاحیت انحصاری برای تاجر و اشخاص حقوقی: ${cfg.jurisdictionCity}، آلمان؛ صلاحیت اجباری مصرف‌کننده محفوظ است.`,
        ],
      },
      {
        id: "withdrawal",
        title: "۷. حق انصراف EU (خدمات دیجیتال)",
        paragraphs: [
          "مصرف‌کنندگان EU معمولاً ۱۴ روز انصراف از قرارداد از راه دور دارند.",
          "با درخواست شروع فوری سرویس قبل از پایان مهلت، با رضایت صریح حق انصراف پس از شروع کامل از دست می‌رود.",
          "دستورالعمل و فرم نمونه در checkout و تأیید سفارش ارائه می‌شود.",
        ],
      },
      {
        id: "subscription",
        title: "۸. اشتراک و لغو",
        paragraphs: [
          "طرح‌های پولی تا لغو در پورتال Lemon Squeezy تمدید می‌شوند. حقوق قانونی مصرف‌کننده محفوظ است.",
        ],
      },
      {
        id: "retention",
        title: "۹. نگهداری قانونی (HGB / AO)",
        paragraphs: [
          "سوابق صورتحساب تا ده سال طبق § 257 HGB و § 147 AO نگهداری می‌شود.",
        ],
      },
    ],
  };
}
