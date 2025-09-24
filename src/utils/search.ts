// src/utils/search.ts
import { ServiceItem } from "../data/services";

function toLatinDigits(s: string) {
  const map: Record<string, string> = {
    "ظ ":"0","ظ،":"1","ظ¢":"2","ظ£":"3","ظ¤":"4",
    "ظ¥":"5","ظ¦":"6","ظ§":"7","ظ¨":"8","ظ©":"9",
  };
  return s.replace(/[ظ -ظ©]/g, (d) => map[d] ?? d);
}

export function normalizeArabic(s: string): string {
  if (!s) return "";
  let out = s.toLowerCase();
  out = toLatinDigits(out);
  out = out
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[ط¥ط£ظ±ط¢ط§]/g, "ط§")
    .replace(/ظ‰/g, "ظٹ")
    .replace(/ط¤/g, "ظˆ")
    .replace(/ط¦/g, "ظٹ")
    .replace(/ط©/g, "ظ‡")
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return out;
}

function tokens(q: string): string[] {
  return normalizeArabic(q).split(/\s+/).filter(Boolean);
}

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

  if (titleN.includes(qNorm)) s += 60;
  if (slugN.includes(qNorm))  s += 40;
  if (textN.includes(qNorm))  s += 20;

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

