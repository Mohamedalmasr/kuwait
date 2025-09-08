const fromArabicMap: Record<string, string> = {
  "أ": "a", "إ": "i", "آ": "a", "ى": "a", "ء": "a", "ؤ": "o", "ئ": "e", "ة": "h",
  "ب": "b", "ت": "t", "ث": "th", "ج": "g", "ح": "h", "خ": "kh", "د": "d", "ذ": "th",
  "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z",
  "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
  "ه": "h", "و": "w", "ي": "y",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

type SlugMode = "preserve-arabic" | "transliterate";

export function slugify(input: string, mode: SlugMode = "preserve-arabic"): string {
  if (!input) return "";
  let s = input.trim().toLowerCase();

  if (mode === "transliterate") {
    s = s.split("").map((ch) => fromArabicMap[ch] ?? ch).join("");
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/[^a-z0-9]+/g, "-");
  } else {
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/[^a-z0-9\u0600-\u06FF]+/g, "-");
  }

  s = s.replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  return s;
}

export function normalizeSlug(s: string): string {
  return String(s || "").trim().replace(/^-+|-+$/g, "").replace(/-+/g, "-");
}

export function ensureSlugs<T extends { title?: string; name?: string; slug?: string }>(
  arr: T[],
  mode: SlugMode = "preserve-arabic"
): T[] {
  return arr.map((item) => {
    if (item.slug && item.slug.trim() !== "") {
      return { ...item, slug: normalizeSlug(item.slug) };
    }
    const base = slugify(item.title || item.name || "", mode);
    return { ...item, slug: base };
  });
}

export function uniqueSlug(
  item: { slug?: string; id?: string | number; title?: string },
  used: Set<string>
): string {
  const base = normalizeSlug(item.slug || "");
  if (!base) {
    const fb = String(item.id ?? "").trim();
    if (!fb) return "";
    if (!used.has(fb)) { used.add(fb); return fb; }
    let c = 2, f = `${fb}-${c}`;
    while (used.has(f)) f = `${fb}-${++c}`;
    used.add(f);
    return f;
  }

  if (!used.has(base)) { used.add(base); return base; }

  const withId = item.id != null ? `${base}-${item.id}` : `${base}-2`;
  if (!used.has(withId)) { used.add(withId); return withId; }

  let counter = 3, final = `${base}-${counter}`;
  while (used.has(final)) final = `${base}-${++counter}`;
  used.add(final);
  return final;
}

export function toServicePath(urlSlug: string): string {
  return `/services/${encodeURIComponent(urlSlug)}`;
}

export function fromServiceParam(param: string | undefined): string {
  return decodeURIComponent(param ?? "");
}
