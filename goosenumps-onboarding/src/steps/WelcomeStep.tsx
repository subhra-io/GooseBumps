

interface WelcomeStepProps {
  onStart: () => void
}

const roadmapItems = [
  {
    num: '1',
    title: 'Business Info',
    desc: 'Basic store details, address, and primary contact information for your operations.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    num: '2',
    title: 'Documents',
    desc: 'Identity verification and business licenses. Have your digital copies ready to upload.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    num: '3',
    title: 'Banking',
    desc: 'Securely connect your bank account for weekly payouts and automated financial reporting.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    num: '4',
    title: 'Review',
    desc: 'One final check of your submission before our team performs the activation review.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
]

const trustBadges = [
  {
    label: 'PCI COMPLIANT',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'GDPR READY',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    label: 'SECURE VAULT',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
]

export default function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left content */}
          <div className="flex-1 p-5 sm:p-8">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#9d4300] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full mb-3 sm:mb-4">
              Partner Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] leading-tight mb-2 sm:mb-3">
              Welcome to Goosenumps
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 max-w-md">
              Join our premier network of merchants and logistics specialists. We've streamlined the registration process to get your business live and taking orders in record time.
            </p>
            <div className="flex flex-col xs:flex-row flex-wrap gap-3">
              <button
                onClick={onStart}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                Start Registration
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                View Prerequisites
              </button>
            </div>
          </div>

          {/* Right image panel */}
          <div className="lg:w-80 relative bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center min-h-[200px]">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
            <div className="relative z-10 text-center p-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-white">15 min</p>
              <p className="text-orange-100 text-sm mt-1">Average Onboarding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Roadmap */}
      <div>
        <h2 className="text-xl font-semibold text-[#0b1c30] mb-1">Registration Roadmap</h2>
        <p className="text-slate-500 text-sm mb-4">Everything you'll need to prepare for a smooth onboarding.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadmapItems.map((item) => (
            <div key={item.num} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-orange-50 text-[#f97316] rounded-lg flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-[#0b1c30] mb-1.5">
                {item.num}. {item.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Security card */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Enterprise Grade Security</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            Your data is encrypted with bank-level 256-bit SSL protocols. We prioritize merchant privacy and secure transactions across our entire logistics ecosystem.
          </p>
          <div className="flex flex-wrap gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-slate-300 text-xs font-semibold tracking-wider">
                <span className="text-[#f97316]">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* Help card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-[#0b1c30] mb-2">Help is a click away</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Stuck on a step? Our dedicated onboarding specialists are available 24/7 to guide you through the process.
          </p>
          <a href="#" className="text-[#9d4300] text-sm font-semibold flex items-center gap-1 hover:underline">
            Visit Onboarding Wiki
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
