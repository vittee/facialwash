import { Tags, TrackInfo } from "./track";

export type ServerEvents = {
  track: (trackInfo: TrackInfo, timestamp: number) => void;
  'next-loaded': (tags: Tags) => void;
  'next-started': () => void;
}
