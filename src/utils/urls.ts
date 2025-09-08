import { slugify, normalizeSlug, toServicePath } from "./slug";

export type ServiceLike = {
  id: string | number;
  title: string;
  slug?: string;     
  urlSlug?: string;   
  link?: string;      
};

type SlugMode = "preserve-arabic" | "transliterate";


export function generateServiceUrl(
  item: ServiceLike,
  options?: { preferCategoryLink?: boolean; mode?: SlugMode }
): string {

  if (options?.preferCategoryLink && item.link && item.link.startsWith("/services/")) {
    return item.link;
  }


  if (item.urlSlug && item.urlSlug.trim() !== "") {
    return toServicePath(item.urlSlug);
  }


  if (item.slug && item.slug.trim() !== "") {
    const s = normalizeSlug(item.slug);
    return toServicePath(s);
  }


  const gen = slugify(item.title, options?.mode ?? "preserve-arabic");
  return toServicePath(gen);
}


export function generateCategoryUrl(item: Pick<ServiceLike, "link">): string {
  if (item.link && item.link.startsWith("/services/")) return item.link;
  return "/services";
}
