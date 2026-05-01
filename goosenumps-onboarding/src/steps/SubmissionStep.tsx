import { useState } from 'react'
import { useOnboarding } from '../context/OnboardingContext'

interface SubmissionStepProps {
  onGoToDashboard: () => void
}

const nextSteps = [
  {
    num: '1',
    tag: 'STEP ONE',
    title: 'Document Verification',
    desc: 'Our team verifies your legal documents and business licenses against international food safety and trade standards.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    num: '2',
    tag: 'STEP TWO',
    title: 'Account Approval',
    desc: 'Once verification is complete, your account is activated and prepared for live order management and logistics integration.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    num: '3',
    tag: 'STEP THREE',
    title: 'Portal Access',
    desc: "You'll receive an email with your credentials to access the full merchant dashboard and start listing your menu items.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      </svg>
    ),
  },
]

export default function SubmissionStep({ onGoToDashboard }: SubmissionStepProps) {
  const { data } = useOnboarding()
  const { business: b } = data
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ── Success hero card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center text-center">
        {/* Animated check circle */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-[#f97316] rounded-full flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 0 8px rgba(249,115,22,0.12), 0 0 0 16px rgba(249,115,22,0.06)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: 'checkDraw 0.5s ease-out 0.2s both' }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#0b1c30] mb-3">Submission Successful</h1>
        <p className="text-slate-500 text-base max-w-lg leading-relaxed mb-5">
          Thank you for choosing Goosenumps{b.businessName ? `, ${b.businessName}` : ''}! Your application has been received and is currently being processed by our compliance team.
        </p>

        {/* Status pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
          <span className="text-sm font-semibold text-[#9d4300]">Status: Under Review</span>
        </div>

        {/* Submitted info */}
        {(b.email || b.businessName) && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-left w-full max-w-sm">
            {b.businessName && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Business</p>
                <p className="text-sm font-semibold text-[#0b1c30] mt-0.5 truncate">{b.businessName}</p>
              </div>
            )}
            {b.email && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notified At</p>
                <p className="text-sm font-semibold text-[#0b1c30] mt-0.5 truncate">{b.email}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── What happens next ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {nextSteps.map((step) => (
          <div key={step.num} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#f97316] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step.num}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316]">{step.tag}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#0b1c30]">{step.icon}</span>
              <h3 className="font-bold text-[#0b1c30] text-base">{step.title}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Processing time banner ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0b1c30]">Average Processing Time</p>
            <p className="text-xs text-slate-500 mt-0.5">Approval usually takes 24–48 hours. We'll notify you via email as soon as there's an update.</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0 shadow-sm"
        >
          {refreshing ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-4.43"/>
            </svg>
          )}
          {refreshing ? 'Checking…' : 'Refresh Status'}
        </button>
      </div>

      {/* ── Hero banner ── */}
      <div className="relative rounded-xl overflow-hidden" style={{ minHeight: '180px' }}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#1e293b] to-[#f97316]" />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10 p-8 flex flex-col justify-end h-full" style={{ minHeight: '180px' }}>
          <h2 className="text-2xl font-bold text-white mb-2">Empowering Local Merchants</h2>
          <p className="text-slate-300 text-sm max-w-md">
            Our team is working behind the scenes to help you reach more customers and streamline your delivery operations.
          </p>
          <button
            onClick={onGoToDashboard}
            className="mt-4 self-start flex items-center gap-2 px-5 py-2.5 bg-white text-[#0b1c30] font-bold text-sm rounded-xl hover:bg-orange-50 transition-colors"
          >
            Go to Dashboard
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes checkDraw {
          from { stroke-dasharray: 30; stroke-dashoffset: 30; }
          to   { stroke-dasharray: 30; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
