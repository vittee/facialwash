import express, { Router, Request } from 'express';
import { EventEmitter } from 'events';
import _ from 'lodash';
import { MedleyTrack, Track, TrackInfo } from 'common/track';

declare interface LiquidsoapHandler {
  on(event: 'track', listener:(trackInfo: TrackInfo) => void): this;
}

class LiquidsoapHandler extends EventEmitter {
  constructor(public router: Router) {
    super();
  }
}

const router = express.Router();
const handler = new LiquidsoapHandler(router);

router.post('/track', (req: Request<{}, void, MedleyTrack>, res) => {
  const { timing, track } = req.body;
  const latency = (Date.now() - timing.sending_at);

  const { position } = timing;

  handler.emit('track', {
    position: {
      current: position.current + latency,
      duration: position.duration
    },
    track
  });

  res.end();
});

export default handler;
