export interface Tags {
  artist?: string;
  title?: string;
}
export interface Track {
  tags: Tags;
  lyrics?: Lyrics;
  cover?: string;
  colors?: string[];
}

export interface TrackInfo {
  position: {
    current: number;
    duration: number;
  }
  track: Track;
}

export type TrackPayload = {
  timing: {
    sending_at: number;
    position: TrackInfo['position'];
    bpm?: number;
  },
  track: Omit<Track, 'lyrics' | 'colors'> & { lyrics?: string };
}

export type ServerEvents = {
  track: (trackInfo: TrackInfo, timestamp: number) => void;
  'next-loaded': (tags: Tags) => void;
  'next-started': () => void;
}

export type LyricLine = {
  time: number;
  text: string;
  far?: boolean;
}

export type Timeline = LyricLine[];

export type Lyrics = {
  infos: Record<string, string[]>;
  timeline: Timeline;
}
