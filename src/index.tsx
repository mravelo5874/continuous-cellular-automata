import * as React from "react";
import { createRoot } from 'react-dom/client';

import { App } from './ui/App';
import { Sim } from './sim/Sim';

import './index.css';

let sim = new Sim();
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <App sim={sim}/>
    </React.StrictMode>
);