import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

function App() {
  return <div style={{ padding: 40 }}>
    <h1>Sentinela - Loading...</h1>
    <p>App is initializing.</p>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
