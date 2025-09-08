import servicesDrainageData from "./servicesDrainageData.json";

export type ServiceDrainage = {
  id: number;
  slug: string;
  img?: string;
  title: string;
  text: string;
  metaDescription?: string;
  link: string;
};

const servicesDrainage: ServiceDrainage[] = servicesDrainageData;

export default servicesDrainage;
