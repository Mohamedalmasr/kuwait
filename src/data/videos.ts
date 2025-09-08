import videosData from "./videosData.json";

export type VideoItem = {
  id: number;
  title: string;
  videoUrl: string;
  shortText: string;
  fullText: string;
};

export const videos: VideoItem[] = videosData;

export default videos;
