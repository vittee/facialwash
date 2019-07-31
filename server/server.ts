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

io.on('connection', socket => {
  if (currentTrack) {
    socket.emit('track', currentTrack, Date.now());
  }
});

liquidsoap.on('track', async track => {
  currentTrack = track;

  if (track.meta.lyrics) {
    track.lyrics = parse_lyric(track.meta.lyrics);
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

  io.emit('track', track, Date.now());
});

let lastTick = Date.now();

setInterval(() => {
  const now = Date.now();
  const delta = now - lastTick;

  if (currentTrack) {
    currentTrack.position_ms += delta;
  }

  lastTick = now;
}, 10);

const port = process.env.PORT || 4000;
server.listen(port);

console.log(`Server running on port ${port}`);
