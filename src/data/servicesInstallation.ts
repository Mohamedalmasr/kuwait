import servicesInstallationData from "./servicesInstallationData.json";

export type ServiceInstallation = {
  id: number;
  title: string;
  text: string;
  img: string;
  link: string;
};

const servicesInstallation: ServiceInstallation[] = servicesInstallationData;

export default servicesInstallation;
