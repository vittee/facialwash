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

if (process.env.NODE_ENV !== 'development') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.use(bodyParser.json());
app.use('/liq', liquidsoap.router);

liquidsoap.on('track', track => {
  if (track.meta.lyrics) {
    track.lyrics = parse_lyric(track.meta.lyrics);
  }

  io.emit('track', track, Date.now());
});

const port = process.env.PORT || 4000;
server.listen(port);

console.log(`Server running on port ${port}`);
