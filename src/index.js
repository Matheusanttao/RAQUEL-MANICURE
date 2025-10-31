import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';

// Handler de erros global
window.addEventListener('error', (event) => {
  event.preventDefault();
  // Prevenir que erros quebrem o site
});

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  // Prevenir que promises rejeitadas quebrem o site
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
