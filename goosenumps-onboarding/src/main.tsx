import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { OnboardingProvider } from './context/OnboardingContext.tsx'

// Only load Analytics on the merchant portal, not admin
const isAdminPortal = import.meta.env.VITE_APP_MODE === 'admin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OnboardingProvider>
      <App />
      {!isAdminPortal && <Analytics />}
    </OnboardingProvider>
  </StrictMode>,
)
