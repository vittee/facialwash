import io from 'socket.io-client';
import { Tags, TrackInfo } from 'common/track';

let socket: SocketIOClient.Socket;

export interface OnTrack {
  (info: TrackInfo): void;
}

export interface OnNextLoaded {
  (tags: Tags): void;
}

export interface OnNextStarted {
  (): void;
}

class SocketEffect {
  onTrack: OnTrack | null = null;

  onNextLoaded: OnNextLoaded | null = null;

  onNextStarted: OnNextStarted | null = null;

  init() {
    socket = io();

    socket.on('track', this.handleOnTrack);
    socket.on('next-loaded', this.handleOnNextLoaded);
    socket.on('next-started', this.handleOnNextStarted);
  }

  get(): SocketIOClient.Socket {
    return socket!;
  }

  // TODO: Remove any
  private handleOnTrack = (info: TrackInfo, timestamp: any) => {
    const latency = Date.now() - timestamp;
    info.position.current += latency;
    this.onTrack && this.onTrack(info);
  }

  private handleOnNextLoaded = (tags: Tags) => {
    this.onNextLoaded && this.onNextLoaded(tags);
  }

  private handleOnNextStarted = () => {
    this.onNextStarted && this.onNextStarted();
  }
}

export default new SocketEffect();
