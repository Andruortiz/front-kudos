import { MsalProvider } from '@azure/msal-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AUTH_ENABLED, createAuth } from './auth/msal'

async function start() {
  const app = (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
  // The landing and the registration are public; the login is asked for only behind ProtectedLayout.
  const content = AUTH_ENABLED ? <MsalProvider instance={await createAuth()}>{app}</MsalProvider> : app
  createRoot(document.getElementById('root')!).render(<StrictMode>{content}</StrictMode>)
}

start()
