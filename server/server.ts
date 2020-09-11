import _ from 'lodash';
import fs from 'fs'
import http from 'http';
import express from 'express';
import SocketIO from 'socket.io';
import path from 'path';
import liquidsoap from './liquidsoap';
import bodyParser from 'body-parser';
import * as mm from 'music-metadata';
import { parse_lyric } from './lyrics';
import { Track } from 'common/track';

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

app.use(bodyParser.json());
app.use('/liq', liquidsoap.router);

let currentTrack: Track | undefined;

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

    if (currentTrack) {
      currentTrack.position_ms += delta;
    } else {

    }

    lastTick = now;
  }, 10);
}

io.on('connection', socket => {
  if (currentTrack) {
    socket.emit('track', currentTrack, Date.now());
  }
});

liquidsoap.on('track', async track => {
  currentTrack = track;

  clearTickTimer();
  const rcvdTime = Date.now();

  if (track.meta.lyrics) {
    const lyrics = parse_lyric(track.meta.lyrics);

    if (lyrics) {
      const bpm = track.meta.bpm || 90;
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

    track.lyrics = lyrics;
  }

  if (track.filename && fs.existsSync(track.filename)) {
    const meta = await mm.parseFile(track.filename);
    if (meta) {
      const { picture } = meta.common;
      if (picture && picture.length) {
        const cover = picture[0];
        track.picture = cover;
        track.colors = await splashy(cover.data);
      }
    }
  }

  const now = Date.now();
  track.position_ms += now - rcvdTime;
  io.emit('track', track, now);

  startTickTimer();
});

const port = process.env.PORT || 4000;
server.listen(port);

console.log(`Server running on port ${port}`);
