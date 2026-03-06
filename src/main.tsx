import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return <div style={{ padding: 40 }}>
    <h1>Sentinela - Loading...</h1>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
