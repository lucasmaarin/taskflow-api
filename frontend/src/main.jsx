import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid #2d2d4e',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0f0f1a' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0f0f1a' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
