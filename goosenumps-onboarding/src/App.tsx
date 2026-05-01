import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import SplashScreen from './components/SplashScreen'
import WelcomeStep from './steps/WelcomeStep'
import BusinessProfileStep from './steps/BusinessProfileStep'
import DocumentUploadStep from './steps/DocumentUploadStep'
import BankingStep from './steps/BankingStep'
import ReviewStep from './steps/ReviewStep'
import SubmissionStep from './steps/SubmissionStep'

export default function App() {
  const [showSplash, setShowSplash]         = useState(true)
  const [currentStep, setCurrentStep]       = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [savedDraft, setSavedDraft]         = useState(false)

  const markComplete = (step: number) =>
    setCompletedSteps(prev => prev.includes(step) ? prev : [...prev, step])

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = (fromStep: number) => {
    markComplete(fromStep)
    goToStep(fromStep + 1)
  }

  const handleSaveDraft = () => {
    setSavedDraft(true)
    setTimeout(() => setSavedDraft(false), 2500)
  }

  // ── Splash ──────────────────────────────────────────────
  if (showSplash) {
    return <SplashScreen onComplete={() => { setShowSplash(false); setCurrentStep(0) }} />
  }

  // ── Welcome (no sidebar) ────────────────────────────────
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center font-bold text-white text-sm shadow">G</div>
            <span className="font-bold text-lg tracking-tight text-[#0b1c30]">Goosenumps</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Help Center</button>
            <button className="relative text-slate-500 hover:text-slate-800 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#f97316] rounded-full" />
            </button>
            <button onClick={handleSaveDraft} className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              Save Draft
            </button>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-8 py-8">
          <WelcomeStep onStart={() => goToStep(1)} />
        </main>
      </div>
    )
  }

  // ── Submission success (no sidebar needed, but keep shell) ──
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex">
        <Sidebar currentStep={4} completedSteps={[1,2,3,4]} onStepClick={() => {}} />
        <div className="flex-1 ml-[280px]">
          <Topbar onSaveDraft={handleSaveDraft} currentStep={5} />
          <main className="pt-14 px-8 py-8 max-w-5xl mx-auto">
            <SubmissionStep onGoToDashboard={() => goToStep(0)} />
          </main>
        </div>
      </div>
    )
  }

  // ── Onboarding steps 1–4 ────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex">
      <Sidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />
      <div className="flex-1 ml-[280px]">
        <Topbar onSaveDraft={handleSaveDraft} currentStep={currentStep} />

        {savedDraft && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0b1c30] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Draft saved successfully
          </div>
        )}

        <main className="pt-14 px-8 py-8 max-w-5xl mx-auto">
          {currentStep === 1 && (
            <BusinessProfileStep onNext={() => handleNext(1)} onBack={() => goToStep(0)} />
          )}
          {currentStep === 2 && (
            <DocumentUploadStep onNext={() => handleNext(2)} onBack={() => goToStep(1)} />
          )}
          {currentStep === 3 && (
            <BankingStep onNext={() => handleNext(3)} onBack={() => goToStep(2)} />
          )}
          {currentStep === 4 && (
            <ReviewStep
              onSubmit={() => { markComplete(4); goToStep(5) }}
              onBack={() => goToStep(3)}
              onEditStep={goToStep}
            />
          )}
        </main>
      </div>
    </div>
  )
}
