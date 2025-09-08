import servicesPlumbingData from "./servicesPlumbingData.json";

export type ServicePlumbing = {
  id: string;
  img?: string;
  title: string;
  text: string;
  link: string;
};

const servicesPlumbing: ServicePlumbing[] = servicesPlumbingData;

export default servicesPlumbing;
















