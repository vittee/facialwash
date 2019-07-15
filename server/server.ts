import _ from 'lodash';
import http from 'http';
import express from 'express';
import SocketIO from 'socket.io';
import path from 'path';
import liquidsoap from './liquidsoap';
import bodyParser from 'body-parser';
import { parse_lyric, Lyric } from './lyrics';

const app = express();
const server = http.createServer(app);
const io = SocketIO(server);

io.on('connection', function(socket){
  console.log('a user connected');
});

if (process.env.NODE_ENV !== 'development') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.use(bodyParser.json());
app.use('/liq', liquidsoap.router);

let lyric: Lyric | undefined;
let line: any = undefined;
let meta_pos = 0;

const LATENCY_COMPENSATION = -600;

liquidsoap.on('track', track => {
  console.log('On Track', track);

  meta_pos = track.position_ms || 0;
  line = undefined;

  if (track.lyrics) {
    lyric = parse_lyric(track.lyrics);
  } else {
    lyric = undefined;
  }
});

// TODO: Move this to client side
let last_tick = Date.now();
setInterval(() => {
  const now = Date.now();
  const delta = now - last_tick;
  meta_pos += delta;

  const pos = meta_pos + LATENCY_COMPENSATION;

  last_tick = now;

  if (!lyric) {
    return;
  }

  const { timeline } = lyric;

  let i = line + 1 || 0;
  let foundLine = line;
  while (i < timeline.length) {
    let t = timeline[i][0];

    if (t <= pos) {
      foundLine = i;
      break;
    }

    i++;
  }

  if (foundLine !== line) {
    const lyricLine = timeline[foundLine];
    console.log(foundLine, pos, lyricLine);
    line = foundLine;
  }
}, 10);

const port = process.env.PORT || 4000;
server.listen(port);

console.log(`Server running on port ${port}`);
