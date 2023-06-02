import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ui/App';
import { Sim } from './sim/Sim';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

let sim = new Sim();

root.render(
  <React.StrictMode>
      <App sim={sim}> </App>
  </React.StrictMode>
);