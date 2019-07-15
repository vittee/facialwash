import express, { Router } from 'express';
import { EventEmitter } from 'events';
import _ from 'lodash';

class LiquidsoapHandler extends EventEmitter {
  constructor(public router: Router) {
    super();
  }
}

const router = express.Router();
const handler = new LiquidsoapHandler(router);

router.post('/track', (req, res) => {
  const meta = req.body;

  let { sending_time_ms, position_ms } = meta;

  sending_time_ms = +sending_time_ms;
  position_ms =  (+position_ms) + (Date.now() - sending_time_ms);

  handler.emit('track', _.extend(meta, {
    sending_time_ms,
    position_ms
  }));
});

export default handler;
