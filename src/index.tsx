import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.scss';
import * as serviceWorker from './serviceWorker';
import { createOvermind } from 'overmind';
import { config } from 'overminds';
import { Provider } from 'overmind-react';

const overmind = createOvermind(config);

ReactDOM.render((
  <Provider value={overmind}>
    <App />
  </Provider>
), document.getElementById('root'));

serviceWorker.unregister();
