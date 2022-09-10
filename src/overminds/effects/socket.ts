import io from 'socket.io-client';
import { TrackInfo } from 'common/track';

let socket: SocketIOClient.Socket;

export interface OnTrack {
  (info: TrackInfo): void;
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

  private handleOnTrack = (info: TrackInfo, timestamp: any) => {
    const latency = Date.now() - timestamp;
    info.position.current += latency;
    this.onTrack && this.onTrack(info);
  }
}

export default new SocketEffect();
