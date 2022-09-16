import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.scss';
import { createOvermind } from 'overmind';
import { config } from 'overminds';
import { Provider } from 'overmind-react';

const overmind = createOvermind(config, { devtools: false });

const root = createRoot(document.getElementById('root')!);
root.render(
  <Provider value={overmind}>
    <App />
  </Provider>
);
