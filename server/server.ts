import _ from 'lodash';
import http from 'http';
import express, { Request, Router } from 'express';
import { Server as IOServer } from 'socket.io';
import path from 'path';
import { TrackPayload, Tags, TrackInfo } from 'common/track';
import { ServerEvents } from 'common/events';
import { Lyrics, parseLyrics } from './lyrics';

const splashy = require('splashy');

const app = express();
const server = http.createServer(app);
const io = new IOServer<{}, ServerEvents>(server);

if (process.env.NODE_ENV !== 'development') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.use(express.json({ limit: '10mb' }));

let currentTrackInfo: TrackInfo | undefined;

let tickTimer: NodeJS.Timeout | undefined;

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

app.post('/track', async (req: Request<{}, void, TrackPayload>, res) => {
  const { timing, track } = req.body;

  clearTickTimer();

  let lyrics: Lyrics | undefined;

  if (track.lyrics) {
    lyrics = parseLyrics(track.lyrics);

    if (lyrics) {
      const { bpm = 90 }  = timing;
      const beatInterval = 6e4 / bpm;
      const measureInterval = 4 * beatInterval;

      let i = 0;
      while (i < lyrics.timeline.length) {
        const next = _.findIndex(lyrics.timeline, ({ text }) => text.trim().length > 0, i + 1);
        if (next !== -1 && next !== i) {
          const distance =  lyrics.timeline[next].time - lyrics.timeline[i].time;
          if (distance >= beatInterval * 12) {
            lyrics.timeline[next].far = true;
          }

          i = next;
          continue;
        }

        i++;
      }

      if (lyrics.timeline[0]?.time >= 1.5 * measureInterval) {
        lyrics.timeline[0].far = true;
      }
    }
  }

  let colors: string[] | undefined;

  const cover = track.cover ? Buffer.from(track.cover, 'base64') : undefined;

  if (cover) {
    colors = await splashy(cover)
  }

  currentTrackInfo = {
    position: {
      current: timing.position.current + (Date.now() - timing.sending_at),
      duration: timing.position.duration
    },
    track: {
      tags: track.tags,
      cover: track.cover,
      lyrics,
      colors
    }
  }

  io.emit('track', currentTrackInfo, Date.now());

  startTickTimer();

  res.end();
})

app.post('/next-loaded', (req: Request<{}, void, Tags>, res) => {
  io.emit('next-loaded', {
    artist: req.body.artist,
    title: req.body.title
  });
  res.end();
});

app.post('/next-started', (req, res) => {
  io.emit('next-started')
  res.end();
});

const port = process.env.PORT || 4000;
server.listen(port);

console.log(`Server running on port ${port}`);
