export type Section = {
  id: string;
  heading: string;
  text?: string;
  bullets?: string[];
};

export type Item = {
  id: number;
  title: string;
  text?: string;
  text2?: string;
  text3?: string;
  slug: string;
  link?: string;
  img?: string;
  sections?: Section[];
};

export const norm = (s?: string) =>
  (s || "")
    .normalize("NFKC")
    .replace(/[\u200e\u200f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const uniqueBy = <T,>(arr: T[], getKey: (x: T) => string) => {
  const seen = new Set<string>();
  return arr.filter((x) => {
    const k = getKey(x);
    if (!k) return true;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const uniqueCards = (arr: Item[], mode: "title" | "title+text" = "title+text") =>
  uniqueBy(arr, (o) => {
    const t = norm(o.title);
    const txt = norm(o.text || o.text2 || "");
    return mode === "title" ? t : `${t}|${txt}`;
  });

export const uniqueSections = (sections: Section[] = []) =>
  uniqueBy(sections, (s) => {
    const h = norm(s.heading);
    const t = norm(s.text);
    const b = (s.bullets || []).map(norm).join("|");
    return `${h}|${t}|${b}`;
  });
