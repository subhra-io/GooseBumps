import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OnboardingProvider } from './context/OnboardingContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OnboardingProvider>
      <App />
    </OnboardingProvider>
  </StrictMode>,
)
