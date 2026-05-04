import { useState } from 'react'

const steps = [
  {
    id: 1,
    label: 'Business Profile',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 2,
    label: 'Document Upload',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: 3,
    label: 'Banking & Payouts',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 4,
    label: 'Review & Submit',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
]

interface SidebarProps {
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

export default function Sidebar({ currentStep, completedSteps, onStepClick }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const progressPercent = currentStep === 0 ? 0 : (currentStep / steps.length) * 100

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center font-bold text-white text-sm shadow">G</div>
          <span className="font-bold text-base tracking-tight text-white">Goosenumps</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white p-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] mb-0.5">Onboarding Progress</p>
        <p className="text-base font-bold text-white mb-2.5">
          Step {currentStep === 0 ? 1 : currentStep} of 4
        </p>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f97316] rounded-full transition-all duration-700"
            style={{ width: `${Math.max(progressPercent, currentStep > 0 ? 8 : 0)}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {steps.map((step) => {
          const isActive    = currentStep === step.id
          const isCompleted = completedSteps.includes(step.id)
          const isLocked    = step.id > currentStep && !isCompleted

          return (
            <button
              key={step.id}
              onClick={() => { if (!isLocked) { onStepClick(step.id); setMobileOpen(false) } }}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left
                ${isActive ? 'bg-white/10 text-white border-l-2 border-[#f97316]' : ''}
                ${isCompleted && !isActive ? 'text-slate-300 hover:bg-white/8 cursor-pointer' : ''}
                ${isLocked ? 'text-slate-600 cursor-not-allowed' : ''}
                ${!isActive && !isCompleted && !isLocked ? 'text-slate-400 hover:bg-white/8 cursor-pointer' : ''}
              `}
            >
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                ${isActive ? 'bg-[#f97316] text-white' : ''}
                ${isCompleted && !isActive ? 'bg-green-500/20 text-green-400' : ''}
                ${isLocked ? 'bg-white/5 text-slate-600' : ''}
                ${!isActive && !isCompleted && !isLocked ? 'bg-white/8 text-slate-400' : ''}
              `}>
                {isCompleted && !isActive
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : step.icon
                }
              </span>
              <span className="truncate">{step.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Help */}
      <div className="px-4 py-4 border-t border-white/10">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-white/8 hover:text-slate-300 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Need Assistance?
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar (fixed, always visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-[280px] min-h-screen bg-[#0F172A] flex-col fixed left-0 top-0 bottom-0 z-20">
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-30 w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center text-white shadow-lg"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ── Mobile: backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#0F172A] flex flex-col z-30
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
