import express, { Router } from 'express';
import { EventEmitter } from 'events';
import _ from 'lodash';
import { Track } from 'common/track';

declare interface LiquidsoapHandler {
  on(event: 'track', listener:(track: Track) => void): this;
}

class LiquidsoapHandler extends EventEmitter {
  constructor(public router: Router) {
    super();
  }
}

const router = express.Router();
const handler = new LiquidsoapHandler(router);

router.post('/track', (req, res) => {
  const body = req.body;

  console.log('Rcvd track', body);

  const meta = _.omit(body, 'frame_duration', 'sending_time_ms', 'position_ms')
  let { sending_time_ms, position_ms, frame_duration } = body;

  sending_time_ms = +sending_time_ms;
  position_ms =  (+position_ms) + (Date.now() - sending_time_ms);
  frame_duration = +frame_duration;

  handler.emit('track', {
    frame_duration,
    sending_time_ms,
    position_ms,
    meta
  })
});

export default handler;
