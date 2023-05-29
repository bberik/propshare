import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom'
import { DAppProvider } from './context/DAppContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DAppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DAppProvider>
  </React.StrictMode>
);

