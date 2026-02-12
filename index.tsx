
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthShell from './views/AuthShell';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Try to load with auth, but fall back to demo mode if API unavailable
const loadApp = () => {
  root.render(
    <React.StrictMode>
      <AuthShell
        onReady={(_, teams, activeTeamId) => {
          root.render(
            <React.StrictMode>
              <App />
            </React.StrictMode>
          );
        }}
      />
    </React.StrictMode>
  );
};

// Load the app
loadApp();
