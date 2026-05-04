import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import SplashScreen from './components/SplashScreen'
import WelcomeStep from './steps/WelcomeStep'
import BusinessProfileStep from './steps/BusinessProfileStep'
import DocumentUploadStep from './steps/DocumentUploadStep'
import BankingStep from './steps/BankingStep'
import ReviewStep from './steps/ReviewStep'
import SubmissionStep from './steps/SubmissionStep'
import OTPScreen from './auth/OTPScreen'
import SetPasswordScreen from './auth/SetPasswordScreen'
import AdminLoginScreen from './auth/AdminLoginScreen'
import MerchantDashboard from './dashboard/MerchantDashboard'
import AdminDashboard from './dashboard/AdminDashboard'
import { useOnboarding } from './context/OnboardingContext'

type AppScreen =
  | 'splash' | 'welcome' | 'onboarding' | 'otp' | 'submission'
  | 'set-password' | 'merchant-dashboard' | 'admin-login' | 'admin-dashboard'

export default function App() {
  const { data } = useOnboarding()
  const [screen, setScreen]             = useState<AppScreen>('splash')
  const [currentStep, setCurrentStep]   = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [savedDraft, setSavedDraft]     = useState(false)
  const [pwdToken, setPwdToken]         = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const path   = window.location.pathname

    if (path === '/admin' || path === '/admin/') {
      const stored = localStorage.getItem('gns_token')
      const role   = localStorage.getItem('gns_role')
      setScreen(stored && role === 'admin' ? 'admin-dashboard' : 'admin-login')
      return
    }
    if (token && path.includes('set-password')) {
      setPwdToken(token)
      setScreen('set-password')
      return
    }
    const stored = localStorage.getItem('gns_token')
    const role   = localStorage.getItem('gns_role')
    if (stored) setScreen(role === 'admin' ? 'admin-dashboard' : 'merchant-dashboard')
  }, [])

  const markComplete = (step: number) =>
    setCompletedSteps(prev => prev.includes(step) ? prev : [...prev, step])

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = (fromStep: number) => { markComplete(fromStep); goToStep(fromStep + 1) }

  const handleSaveDraft = () => {
    setSavedDraft(true)
    setTimeout(() => setSavedDraft(false), 2500)
  }

  const handleLogout = () => {
    localStorage.removeItem('gns_token')
    localStorage.removeItem('gns_role')
    setScreen(window.location.pathname.startsWith('/admin') ? 'admin-login' : 'welcome')
  }

  // ── Splash ──────────────────────────────────────────────
  if (screen === 'splash') return <SplashScreen onComplete={() => setScreen('welcome')} />

  // ── Set Password ────────────────────────────────────────
  if (screen === 'set-password') {
    return <SetPasswordScreen token={pwdToken} email={data.business.email || 'merchant@example.com'} onComplete={() => setScreen('merchant-dashboard')} />
  }

  // ── OTP ─────────────────────────────────────────────────
  if (screen === 'otp') {
    return <OTPScreen email={data.business.email} name={data.business.businessName} onVerified={() => setScreen('submission')} />
  }

  // ── Dashboards ──────────────────────────────────────────
  if (screen === 'merchant-dashboard') return <MerchantDashboard onLogout={handleLogout} />
  if (screen === 'admin-login')        return <AdminLoginScreen onSuccess={() => setScreen('admin-dashboard')} />
  if (screen === 'admin-dashboard')    return <AdminDashboard onLogout={handleLogout} />

  // ── Welcome (no sidebar) ────────────────────────────────
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center font-bold text-white text-sm shadow">G</div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#0b1c30]">Goosenumps</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:block text-sm text-slate-500 hover:text-slate-800">Help Center</button>
            <button onClick={handleSaveDraft} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              Save Draft
            </button>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <WelcomeStep onStart={() => { setScreen('onboarding'); goToStep(1) }} />
        </main>
      </div>
    )
  }

  // ── Submission ──────────────────────────────────────────
  if (screen === 'submission') {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex">
        <Sidebar currentStep={4} completedSteps={[1,2,3,4]} onStepClick={() => {}} />
        <div className="flex-1 lg:ml-[280px]">
          <Topbar onSaveDraft={handleSaveDraft} currentStep={5} />
          <main className="pt-14 px-4 sm:px-6 lg:px-8 py-5 sm:py-8 max-w-5xl mx-auto">
            <SubmissionStep onGoToDashboard={() => setScreen('welcome')} />
          </main>
        </div>
      </div>
    )
  }

  // ── Onboarding steps 1–4 ────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex">
      <Sidebar currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />

      <div className="flex-1 lg:ml-[280px] min-w-0">
        <Topbar onSaveDraft={handleSaveDraft} currentStep={currentStep} />

        {savedDraft && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0b1c30] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Draft saved
          </div>
        )}

        <main className="pt-14 px-4 sm:px-6 lg:px-8 py-5 sm:py-8 max-w-5xl mx-auto">
          {currentStep === 1 && <BusinessProfileStep onNext={() => handleNext(1)} onBack={() => setScreen('welcome')} />}
          {currentStep === 2 && <DocumentUploadStep  onNext={() => handleNext(2)} onBack={() => goToStep(1)} />}
          {currentStep === 3 && <BankingStep          onNext={() => handleNext(3)} onBack={() => goToStep(2)} />}
          {currentStep === 4 && (
            <ReviewStep
              onSubmit={async () => { markComplete(4); setScreen('otp') }}
              onBack={() => goToStep(3)}
              onEditStep={goToStep}
            />
          )}
        </main>
      </div>
    </div>
  )
}
