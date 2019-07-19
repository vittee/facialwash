interface KeyValue {
  [index: string]: any;
}

export type LyricLine = [number, string];

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
}
