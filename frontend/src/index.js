import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

// AuthProvider wraps the whole app so every page can access login state
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);