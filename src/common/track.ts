import { Lyrics } from "../../server/lyrics";

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

export type MedleyTrack = {
  timing: {
    sending_at: number;
    position: TrackInfo['position'];
    bpm?: number;
  },
  track: Omit<Track, 'lyrics' | 'colors'> & { lyrics?: string };
}
