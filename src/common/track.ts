import { IPicture } from "music-metadata";

interface KeyValue {
  [index: string]: any;
}

export type LyricLine = [number, string, boolean]; // timestamp, text, far

export type Timeline = [LyricLine];

export interface Lyrics {
  infos: KeyValue;
  timeline: Timeline;
}

export interface Track {
  id: string,
  frame_duration: number;
  sending_time_ms: number;
  position_ms: number;
  meta: KeyValue;
  lyrics?: Lyrics;
  filename?: string;
  picture?: IPicture;
  colors?: string[];
}
