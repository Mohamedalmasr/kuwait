import servicesMaintenanceData from "./servicesMaintenanceData.json";

export type ServiceMaintenance = {
  id: number;
  img?: string;
  title: string;
  text: string;
  text2?: string;
  text3?: string;
  link: string;
};


const servicesMaintenance: ServiceMaintenance[] = servicesMaintenanceData;

export default servicesMaintenance;
