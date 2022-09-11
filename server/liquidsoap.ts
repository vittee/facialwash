import express, { Router, Request } from 'express';
import { EventEmitter } from 'events';
import _ from 'lodash';
import { MedleyTrack, Tags, Track, TrackInfo } from 'common/track';

// TODO: Overhual this, be more generic
declare interface LiquidsoapHandler {
  on(event: 'track', listener:(trackInfo: TrackInfo) => void): this;
  on(event: 'next-loaded', listener:(tags: Tags) => void): this;
  on(event: 'next-started', listener:() => void): this;
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

router.post('/next-loaded', (req: Request<{}, void, Tags>, res) => {
  handler.emit('next-loaded', req.body);
  res.end();
});

router.post('/next-started', (req, res) => {
  handler.emit('next-started');
  res.end();
});

export default handler;
