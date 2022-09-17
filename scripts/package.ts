import { name, version, dependencies } from '../package.json';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

const clientPackages = [
  "classnames",
  "overmind",
  "overmind-react",
  "polished",
  "react",
  "react-dom",
  "react-is",
  "socket.io-client",
  "styled-components",
];

for (const pkg of clientPackages) {
  delete dependencies[pkg];
}

fs.writeFileSync(path.join(__dirname, '../build/package.json'), JSON.stringify({
  name,
  version,
  main: "server/server.js",
  dependencies
}, undefined, 2));

rimraf.sync(path.join(__dirname, '../build/src'));
