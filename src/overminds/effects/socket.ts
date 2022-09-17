import { io, Socket } from 'socket.io-client';
import type { Tags, TrackInfo, ServerEvents } from 'common/types';

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
  private static socket: Socket<ServerEvents, {}>;

  onTrack: OnTrack | null = null;

  onNextLoaded: OnNextLoaded | null = null;

  onNextStarted: OnNextStarted | null = null;

  init() {
    SocketEffect.socket = io();

    SocketEffect.socket.on('track', this.handleOnTrack);
    SocketEffect.socket.on('next-loaded', this.handleOnNextLoaded);
    SocketEffect.socket.on('next-started', this.handleOnNextStarted);
  }

  get(): Socket {
    return SocketEffect.socket;
  }

  private handleOnTrack: ServerEvents['track'] = (info, timestamp) => {
    const latency = Date.now() - timestamp;
    info.position.current += latency;
    this.onTrack && this.onTrack(info);
  }

  private handleOnNextLoaded: ServerEvents['next-loaded'] = tags => this.onNextLoaded && this.onNextLoaded(tags);

  private handleOnNextStarted: ServerEvents['next-started'] = () => this.onNextStarted && this.onNextStarted();
}

export default new SocketEffect();
