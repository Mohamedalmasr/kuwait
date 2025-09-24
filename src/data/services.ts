import rawPlumbing from "./servicesPlumbing";
import rawPlumber from "./servicesPlumber";
import rawDrainage from "./servicesDrainage";
import rawMaintenance from "./servicesMaintenance";
import rawInstallation from "./servicesInstallation";

import { ensureSlugs, uniqueSlug } from "../utils/slug";

export type ContentSection = {
  id: string;
  heading: string;
  text?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  html?: string;
  bullets?: string[];
  img?: string;
  question?: string;
};

export type MapInfo = {
  title: string;
  link: string;
  embedUrl: string;
  lat: number;
  lng: number;
};

export type ServiceBase = {
  id: number | string;
  title: string;
  text: string;
  text2?: string;
  text3?: string;
  img?: string;
  link?: string;
  slug?: string;
  metaDescription?: string;
  sections?: ContentSection[];
  map?: MapInfo;
  urlSlug?: string;
};

export type ServiceItem = ServiceBase & {
  urlSlug: string;
};

function prepareGroup<T extends ServiceBase>(
  arr: T[],
  used: Set<string>
): ServiceItem[] {
  const withSlugs = ensureSlugs(arr);
  return withSlugs.map((it) => ({
    ...it,
    urlSlug: uniqueSlug(it, used),
  }));
}

const used = new Set<string>();

export const servicesPlumbing = prepareGroup(
  rawPlumbing as ServiceBase[],
  used
);
export const servicesPlumber = prepareGroup(rawPlumber as ServiceBase[], used);
export const servicesDrainage = prepareGroup(
  rawDrainage as ServiceBase[],
  used
);
export const servicesMaintenance = prepareGroup(
  rawMaintenance as ServiceBase[],
  used
);
export const servicesInstallation = prepareGroup(
  rawInstallation as ServiceBase[],
  used
);

export const ALL_SERVICES: ServiceItem[] = [
  ...servicesPlumbing,
  ...servicesPlumber,
  ...servicesDrainage,
  ...servicesMaintenance,
  ...servicesInstallation,
];

export const BY_SLUG = new Map<string, ServiceItem>(
  ALL_SERVICES.map((s) => [String(s.urlSlug), s])
);

export const BY_ID = new Map<string, ServiceItem>(
  ALL_SERVICES.map((s) => [String(s.id), s])
);
