import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1a1a2e',
          color: '#f0f0f5',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          fontSize: '0.875rem',
          fontFamily: "'Inter', sans-serif",
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#1a1a2e' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' },
        },
      }}
    />
  </StrictMode>,
)
