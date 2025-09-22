// src/utils/phone.ts

/**
 * خريطة كل الدول العربية (جامعة الدول العربية) مع أكواد الاتصال الدولية
 * المخرجات بدون "+" لاستخدامها مع wa.me وداخل E.164.
 */
export type ArabCountry = {
  iso2: string;          // ISO-3166 alpha-2
  nameAr: string;        // الاسم بالعربية
  dialCode: string;      // بدون "+" (مثال: "965")
  example?: string;      // مثال اختياري
};

export const ARAB_COUNTRIES: ArabCountry[] = [
  { iso2: "DZ", nameAr: "الجزائر",          dialCode: "213", example: "551234567" },
  { iso2: "BH", nameAr: "البحرين",          dialCode: "973", example: "33123456"  },
  { iso2: "KM", nameAr: "جزر القمر",        dialCode: "269", example: "321234"    },
  { iso2: "DJ", nameAr: "جيبوتي",           dialCode: "253", example: "77123456"  },
  { iso2: "EG", nameAr: "مصر",              dialCode: "20",  example: "1001234567"},
  { iso2: "IQ", nameAr: "العراق",           dialCode: "964", example: "7712345678"},
  { iso2: "JO", nameAr: "الأردن",           dialCode: "962", example: "790123456" },
  { iso2: "KW", nameAr: "الكويت",           dialCode: "965", example: "50123456"  },
  { iso2: "LB", nameAr: "لبنان",            dialCode: "961", example: "71123456"  },
  { iso2: "LY", nameAr: "ليبيا",            dialCode: "218", example: "912345678" },
  { iso2: "MR", nameAr: "موريتانيا",        dialCode: "222", example: "22123456"  },
  { iso2: "MA", nameAr: "المغرب",           dialCode: "212", example: "612345678" },
  { iso2: "OM", nameAr: "عُمان",            dialCode: "968", example: "92123456"  },
  { iso2: "PS", nameAr: "فلسطين",           dialCode: "970", example: "599123456" },
  { iso2: "QA", nameAr: "قطر",              dialCode: "974", example: "33123456"  },
  { iso2: "SA", nameAr: "السعودية",         dialCode: "966", example: "501234567" },
  { iso2: "SO", nameAr: "الصومال",          dialCode: "252", example: "611234567" },
  { iso2: "SD", nameAr: "السودان",          dialCode: "249", example: "911234567" },
  { iso2: "SY", nameAr: "سوريا",            dialCode: "963", example: "944123456" },
  { iso2: "TN", nameAr: "تونس",             dialCode: "216", example: "20123456"  },
  { iso2: "AE", nameAr: "الإمارات",         dialCode: "971", example: "501234567" },
  { iso2: "YE", nameAr: "اليمن",            dialCode: "967", example: "711234567" },
];

export const ARAB_DIALCODE_TO_ISO: Record<string, ArabCountry> = Object.fromEntries(
  ARAB_COUNTRIES.map((c) => [c.dialCode, c])
);

export const ARAB_ISO_TO_COUNTRY: Record<string, ArabCountry> = Object.fromEntries(
  ARAB_COUNTRIES.map((c) => [c.iso2, c])
);

export type NormalizeOptions = {
  preferredIso?: string;   // بلد افتراضي لو الرقم محلي
};

export type NormalizedPhone =
  | {
      ok: true;
      country: ArabCountry;
      dialCode: string;   // بدون +
      nsn: string;        // الرقم الوطني بدون صفر البداية
      intlDigits: string; // dialCode + nsn (بدون +)
      e164: string;       // +<dialCode><nsn>
    }
  | { ok: false; reason: string };

/** ينظّف النص ويستنتج البلد (لو فيه + أو 00)، أو يستخدم preferredIso */
export function normalizePhone(raw: string, opts: NormalizeOptions = {}): NormalizedPhone {
  if (!raw) return { ok: false, reason: "EMPTY" };

  let input = raw.trim();
  const hasPlus = input.startsWith("+");
  const has00   = input.startsWith("00");
  if (has00) {
    input = input.slice(2); // شيل 00
  }
  const digits = input.replace(/\D+/g, ""); // كل الأرقام فقط

  // لو فيه + أو 00، نستخرج كود الدولة مباشرة
  if (hasPlus || has00) {
    const best = pickDialCodeByPrefix(digits);
    if (!best) return { ok: false, reason: "DIAL_CODE_NOT_RECOGNIZED" };
    const nsn = digits.slice(best.dialCode.length).replace(/^0+/, ""); // شيل أصفار البدء
    if (!nsn) return { ok: false, reason: "MISSING_NSN" };
    return {
      ok: true,
      country: best,
      dialCode: best.dialCode,
      nsn,
      intlDigits: best.dialCode + nsn,
      e164: `+${best.dialCode}${nsn}`,
    };
  }

  // رقم محلي بدون كود دولي
  const preferred: ArabCountry | undefined = opts.preferredIso
    ? ARAB_ISO_TO_COUNTRY[opts.preferredIso.toUpperCase()]
    : undefined;

  const country: ArabCountry = preferred ?? ARAB_ISO_TO_COUNTRY["KW"]; // افتراضي الكويت، عدّله من النداء
  const nsn = digits.replace(/^0+/, ""); // شيل الصفر الوطني
  if (!nsn) return { ok: false, reason: "MISSING_NSN" };

  return {
    ok: true,
    country,
    dialCode: country.dialCode,
    nsn,
    intlDigits: country.dialCode + nsn,
    e164: `+${country.dialCode}${nsn}`,
  };
}

/** يلتقط أنسب كود دولة عربي بناءً على بادئة الأرقام */
function pickDialCodeByPrefix(digits: string): ArabCountry | null {
  // جرّب من الأطول للأقصر
  const dialCodesDesc = Object.keys(ARAB_DIALCODE_TO_ISO).sort(
    (a, b) => b.length - a.length
  );
  for (const dc of dialCodesDesc) {
    if (digits.startsWith(dc)) return ARAB_DIALCODE_TO_ISO[dc];
  }
  return null;
}

/** رابط tel: جاهز (لو فشل التطبيع يرجّع "#") */
export function makeTelHref(raw: string, preferredIso?: string): string {
  const n = normalizePhone(raw, { preferredIso });
  return n.ok ? `tel:${n.e164}` : "#";
}

/** رابط WhatsApp wa.me جاهز (لو فشل التطبيع يرجّع "#") */
export function makeWhatsAppHref(raw: string, preferredIso?: string): string {
  const n = normalizePhone(raw, { preferredIso });
  return n.ok ? `https://wa.me/${n.intlDigits}` : "#";
}

/** تنسيق عرض بسيط: +965 50 123 456 (تقريبي حسب الطول) */
export function formatDisplay(raw: string, preferredIso?: string): string {
  const n = normalizePhone(raw, { preferredIso });
  if (!n.ok) return raw || "—";
  const { dialCode, nsn } = n;
  // تقسيم خفيف حسب الأطوال الشائعة
  const chunks: string[] = [];
  if (nsn.length <= 3) chunks.push(nsn);
  else if (nsn.length <= 6) chunks.push(nsn.slice(0, 3), nsn.slice(3));
  else if (nsn.length <= 8) chunks.push(nsn.slice(0, 2), nsn.slice(2, 5), nsn.slice(5));
  else chunks.push(nsn.slice(0, 3), nsn.slice(3, 6), nsn.slice(6));
  return `+${dialCode} ${chunks.join(" ")}`;
}

/** لائحة الدول العربية للاستعمال في قوائم اختيار مثلاً */
export function getArabCountries(): ArabCountry[] {
  return ARAB_COUNTRIES.slice();
}
