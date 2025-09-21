// src/utils/search.ts
import { ServiceItem } from "../data";

// تحويل الأرقام العربية إلى لاتينية
function toLatinDigits(s: string) {
  const map: Record<string, string> = {
    "٠":"0","١":"1","٢":"2","٣":"3","٤":"4",
    "٥":"5","٦":"6","٧":"7","٨":"8","٩":"9",
  };
  return s.replace(/[٠-٩]/g, (d) => map[d] ?? d);
}

// تطبيع عربي بسيط (إزالة التشكيل/التمطيط وتوحيد بعض الحروف)
export function normalizeArabic(s: string): string {
  if (!s) return "";
  let out = s.toLowerCase();
  out = toLatinDigits(out);
  out = out
    // إزالة التشكيل
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "")
    // إزالة التطويل
    .replace(/\u0640/g, "")
    // توحيد الألف
    .replace(/[إأٱآا]/g, "ا")
    // توحيد الياء/الألف المقصورة والهمزات
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    // تاء مربوطة -> ه (بحث أوسع)
    .replace(/ة/g, "ه")
    // حذف رموز غير حروف/أرقام/مسافات
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return out;
}

function tokens(q: string): string[] {
  return normalizeArabic(q).split(/\s+/).filter(Boolean);
}

// حساب درجة تطابق بسيطة
function scoreItem(item: ServiceItem, q: string): number {
  const qNorm = normalizeArabic(q);
  if (!qNorm) return 0;
  const toks = tokens(q);

  const titleN = normalizeArabic(item.title || "");
  const slugN  = normalizeArabic(item.urlSlug || item.slug || "");
  const textN  = normalizeArabic(
    `${item.text || ""} ${item.text2 || ""} ${item.text3 || ""}`
  );

  let s = 0;

  // مطابقة العبارة كاملة
  if (titleN.includes(qNorm)) s += 60;
  if (slugN.includes(qNorm))  s += 40;
  if (textN.includes(qNorm))  s += 20;

  // مطابقة حسب الكلمات
  for (const t of toks) {
    if (titleN.includes(t)) s += 30;
    if (slugN.includes(t))  s += 15;
    if (textN.includes(t))  s += 8;
  }

  return s;
}

export function searchServices(items: ServiceItem[], query: string, limit?: number): ServiceItem[] {
  const list = items
    .map((it) => ({ it, sc: scoreItem(it, query) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc || String(a.it.title).localeCompare(String(b.it.title)));

  const arr = list.map((x) => x.it);
  return typeof limit === "number" ? arr.slice(0, limit) : arr;
}
