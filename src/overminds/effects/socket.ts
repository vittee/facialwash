import io from 'socket.io-client';

let socket: SocketIOClient.Socket;

interface KeyValue {
  [index: string]: any;
}

type LyricLine = [number, string];

type Timeline = [LyricLine];

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

export interface OnTrack {
  (track: Track): void;
}

class SocketEffect {
  onTrack: OnTrack | null = null;

  init() {
    socket = io();

    socket.on('track', this.handleOnTrack);
  }

  get(): SocketIOClient.Socket {
    return socket!;
  }

  private handleOnTrack = (track: Track, timestamp: any) => {
    const latency = Date.now() - timestamp;
    track.position_ms += latency;
    track.id = (track && `${track.sending_time_ms}_${track.meta['title']}_${track.meta['artist']}`) || '';
    this.onTrack && this.onTrack(track);
  }
}

export default new SocketEffect();
