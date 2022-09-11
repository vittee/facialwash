import _ from 'lodash';
import fs from 'fs'
import http from 'http';
import express from 'express';
import SocketIO from 'socket.io';
import path from 'path';
import liquidsoap from './liquidsoap';
import bodyParser from 'body-parser';
import { TrackInfo, Lyrics } from 'common/track';
import { parse_lyric } from './lyrics';

const splashy = require('splashy');

const app = express();
const server = http.createServer(app);
const io = SocketIO(server);

if (process.env.NODE_ENV !== 'development') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.use(bodyParser.json({ limit: '500mb' }));
app.use('/liq', liquidsoap.router);

let currentTrackInfo: TrackInfo | undefined;

let tickTimer: any = undefined;

function clearTickTimer() {
  tickTimer && clearInterval(tickTimer);
  tickTimer = undefined;
}

function startTickTimer() {
  let lastTick = Date.now();

  tickTimer = setInterval(() => {
    const now = Date.now();
    const delta = now - lastTick;

    if (currentTrackInfo) {
      currentTrackInfo.position.current += delta;
    } else {

    }

    lastTick = now;
  }, 10);
}


io.on('connection', socket => {
  if (currentTrackInfo) {
    socket.emit('track', currentTrackInfo, Date.now());
  }
});

liquidsoap.on('track', async (info) => {
  const receivedTime = Date.now();

  clearTickTimer();

  let lyrics: Lyrics | undefined;

  if (info.track.lyrics) {
    lyrics = parse_lyric(info.track.lyrics);

    if (lyrics) {
      // const bpm = track.meta.bpm || 90;
      const bpm = 90;
      const beatInterval = 6e4/bpm;

      let i = 0;
      while (i < lyrics.timeline.length) {
        const next = _.findIndex(lyrics.timeline, ([,t]) => t.trim().length > 0, i + 1);
        if (next !== -1 && next !== i) {
          const distance =  lyrics.timeline[next][0] - lyrics.timeline[i][0];
          if (distance >= beatInterval * 12) {
            lyrics.timeline[next][2] = true;
          }

          i = next;
          continue;
        }

        i++;
      }
    }
  }

  let colors: string[] | undefined;

  const cover = info.track.cover ? Buffer.from(info.track.cover, 'base64') : undefined;

  if (cover) {
    colors = await splashy(cover)
  }

  const now = Date.now();

  currentTrackInfo = {
    position: {
      ...info.position,
      current: info.position.current + (now - receivedTime)
    },
    track: {
      ...info.track,
      lyrics,
      colors
    }
  }

  io.emit('track', currentTrackInfo, now);

  startTickTimer();
});

liquidsoap.on('next-loaded', tags => io.emit('next-loaded', tags));
liquidsoap.on('next-started', () => io.emit('next-started'));

const port = process.env.PORT || 4000;
server.listen(port);

console.log(`Server running on port ${port}`);
