import servicesPlumbingData from "./servicesPlumbingData.json";

export type ServicePlumbing = {
  id: number | string;
  img?: string;
  title: string;
  text: string;
  link?: string;
  [key: string]: unknown;
};

const servicesPlumbing: ServicePlumbing[] = servicesPlumbingData;

export default servicesPlumbing;
