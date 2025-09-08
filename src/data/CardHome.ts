import cardsHomeData from "./cardsHomeData.json";

export type CardHome = {
  id: string;
  img: string;
  alt: string;
  title: string;
  text: string;
  link: string;
};

const cardsHome: CardHome[] = cardsHomeData;

export default cardsHome;
