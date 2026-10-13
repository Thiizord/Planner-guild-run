import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AppProvider } from './context/AppContext';
import { getCharacter } from './utils/helpers';

// lookup global para o ghost do drag customizado (fora do React)
window.__HERO_LOOKUP__ = getCharacter;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
