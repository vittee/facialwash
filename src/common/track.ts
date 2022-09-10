export type LyricLine = [timestamp: number, text: string, far?: boolean];
export interface Lyrics {
  infos: Record<string, any>;
  timeline: LyricLine[];
}
export interface Track {
  tags: {
    artist?: string;
    title?: string;
  },
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
    position: TrackInfo['position']
  },
  track: Omit<Track, 'lyrics' | 'colors'> & { lyrics?: string };
}
