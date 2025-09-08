import servicesPlumberData from "./servicesPlumberData.json";

export type ServicePlumber = {
  id: number;
  slug: string;
  img?: string;
  title: string;
  text: string;
  metaDescription?: string;
  link: string;
};

const servicesPlumber: ServicePlumber[] = servicesPlumberData;

export default servicesPlumber;
