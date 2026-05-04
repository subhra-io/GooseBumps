interface TopbarProps {
  onSaveDraft: () => void
  currentStep: number
}

const navTabs = ['Home', 'Onboarding', 'Help']

export default function Topbar({ onSaveDraft, currentStep }: TopbarProps) {
  const isSubmission = currentStep === 5
  const tabs = isSubmission ? ['Submission', 'Dashboard', 'Settings'] : navTabs
  const activeTab = isSubmission ? 'Submission' : 'Onboarding'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center
      px-4 sm:px-6
      fixed top-0 right-0 z-10
      left-0 lg:left-[280px]
    ">
      {/* Spacer for mobile hamburger */}
      <div className="w-10 lg:hidden flex-shrink-0" />

      {/* Nav tabs — hidden on very small screens */}
      <nav className="hidden sm:flex items-center gap-1 flex-1">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`relative px-3 sm:px-4 py-4 text-sm font-medium transition-colors
              ${tab === activeTab ? 'text-[#f97316]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab}
            {tab === activeTab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316] rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Brand name on mobile (center) */}
      <div className="flex-1 sm:hidden flex justify-center">
        <span className="font-bold text-sm text-[#0b1c30]">Goosenumps</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {currentStep >= 1 && currentStep <= 4 && (
          <button
            onClick={onSaveDraft}
            className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-800 mr-1 transition-colors"
          >
            Save Draft
          </button>
        )}

        <button className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#f97316] rounded-full border border-white" />
        </button>

        <button className="hidden sm:flex w-9 h-9 items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#f97316] to-[#9d4300] flex items-center justify-center text-white text-sm font-bold shadow-sm">
          M
        </button>
      </div>
    </header>
  )
}
