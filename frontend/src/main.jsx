import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#F7F0E3',
              color: '#2C1810',
              border: '1px solid rgba(196, 144, 106, 0.3)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(44, 24, 16, 0.15)',
            },
            success: {
              iconTheme: { primary: '#7A8F6E', secondary: '#F7F0E3' },
            },
            error: {
              iconTheme: { primary: '#C9897A', secondary: '#F7F0E3' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
