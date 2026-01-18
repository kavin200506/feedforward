import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/variables.css'
import './assets/styles/global.css'
import './assets/styles/animations.css'
import './App.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
