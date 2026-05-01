import { useState } from 'react'
import { useOnboarding } from '../context/OnboardingContext'

interface ReviewStepProps {
  onSubmit: () => void
  onBack:   () => void
  onEditStep: (step: number) => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ReviewStep({ onSubmit, onBack, onEditStep }: ReviewStepProps) {
  const { data } = useOnboarding()
  const { business: b, banking: bk, documents: docs } = data

  const [agreed,    setAgreed]    = useState(false)
  const [agreeErr,  setAgreeErr]  = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const docList = [
    { label: 'Business License',    file: docs.businessLicense },
    { label: 'Tax Identification',  file: docs.taxId },
    { label: "Owner's ID (Front)",  file: docs.ownerIdFront },
    { label: "Owner's ID (Back)",   file: docs.ownerIdBack },
  ].filter(d => d.file)

  const handleSubmit = () => {
    if (!agreed) { setAgreeErr(true); return }
    setSubmitting(true)
    setTimeout(() => onSubmit(), 1800)
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1c30]">Final Review</h1>
        <p className="text-slate-500 text-sm mt-1">
          Please check all the details provided below before submitting your application for the Goosenumps Merchant Program.
        </p>
      </div>

      {/* ── Row 1: Business Profile + Logo ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">

        {/* Business Profile card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h2 className="font-bold text-[#0b1c30]">Business Profile</h2>
            </div>
            <button onClick={() => onEditStep(1)} className="flex items-center gap-1 text-xs font-semibold text-[#f97316] hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              EDIT
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Legal Entity Name</p>
              <p className="text-sm font-semibold text-[#0b1c30] mt-0.5">{b.legalName || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">DBA / Brand Name</p>
              <p className="text-sm font-semibold text-[#0b1c30] mt-0.5">{b.businessName || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Business Type</p>
              <p className="text-sm font-semibold text-[#0b1c30] mt-0.5">{b.category || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Email</p>
              <p className="text-sm font-semibold text-[#0b1c30] mt-0.5">{b.email || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone</p>
              <p className="text-sm font-semibold text-[#0b1c30] mt-0.5">{b.phone ? `+91 ${b.phone}` : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ZIP Code</p>
              <p className="text-sm font-semibold text-[#0b1c30] mt-0.5">{b.zip || '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Physical Address</p>
              <p className="text-sm font-semibold text-[#0b1c30] mt-0.5">
                {b.address && b.city ? `${b.address}, ${b.city}${b.zip ? ', ' + b.zip : ''}` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Store Logo card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
          {b.logoPreview ? (
            <img src={b.logoPreview} alt="Store Logo" className="w-24 h-24 object-cover rounded-xl border border-slate-200 mb-3" />
          ) : (
            <div className="w-24 h-24 bg-[#0F172A] rounded-xl flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-[#f97316]">{b.businessName?.[0]?.toUpperCase() || 'G'}</span>
            </div>
          )}
          <p className="text-sm font-semibold text-[#0b1c30]">Store Logo</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-full px-2">
            {b.logoFile ? b.logoFile.name : 'No logo uploaded'}
          </p>
          <button onClick={() => onEditStep(1)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#f97316] hover:underline">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            CHANGE
          </button>
        </div>
      </div>

      {/* ── Row 2: Banking + Documents ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Banking card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <h2 className="font-bold text-[#0b1c30]">Banking &amp; Payouts</h2>
            </div>
            <button onClick={() => onEditStep(3)} className="flex items-center gap-1 text-xs font-semibold text-[#f97316] hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              EDIT
            </button>
          </div>

          {/* Bank tile */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
                <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
                <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0b1c30]">{bk.bankName || 'Bank Name'}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {bk.accountHolder || 'Account Holder'} · Ending in {bk.accountNumber ? '•••• ' + bk.accountNumber.slice(-4) : '••••'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full flex-shrink-0">
              VERIFIED
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Payout Schedule: <span className="font-semibold text-[#0b1c30]">Weekly</span></span>
            <span>Settlement Currency: <span className="font-semibold text-[#0b1c30]">{bk.currency.split(' - ')[0]}</span></span>
          </div>
        </div>

        {/* Documents card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h2 className="font-bold text-[#0b1c30]">Documents</h2>
            </div>
            <button onClick={() => onEditStep(2)} className="flex items-center gap-1 text-xs font-semibold text-[#f97316] hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              EDIT
            </button>
          </div>

          <div className="space-y-2">
            {docList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No documents uploaded</p>
            ) : docList.map(({ label, file }) => (
              <div key={label} className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0b1c30]">{label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{file!.name} · {formatBytes(file!.size)}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-[#f97316] transition-colors flex-shrink-0 ml-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agreement ── */}
      <div className={`bg-white rounded-xl border shadow-sm p-5 transition-colors ${agreeErr ? 'border-red-300' : 'border-slate-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => { setAgreed(v => !v); setAgreeErr(false) }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
              ${agreed ? 'bg-[#f97316] border-[#f97316]' : agreeErr ? 'border-red-400' : 'border-slate-300 hover:border-[#f97316]'}`}
          >
            {agreed && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            I hereby certify that the information provided above is accurate and complete to the best of my knowledge. I agree to the{' '}
            <a href="#" className="text-[#f97316] font-semibold hover:underline">Goosenumps Merchant Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#f97316] font-semibold hover:underline">Privacy Policy</a>.
            {' '}I understand that any false statements may lead to the immediate termination of my merchant account.
          </p>
        </label>
        {agreeErr && <p className="text-red-500 text-xs mt-2 ml-8">Please confirm before submitting.</p>}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 w-full max-w-lg mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Back to Banking
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 font-bold rounded-xl transition-all shadow-md text-sm
              ${submitting ? 'bg-orange-300 cursor-wait' : 'bg-[#f97316] hover:bg-[#ea6c0a]'} text-white`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Submitting…
              </>
            ) : (
              <>
                Submit Application
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          Review times typically take 2–3 business days. You will receive an email notification once your application has been processed.
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-5 text-center">
        <p className="text-[11px] text-slate-400">
          © 2024 Goosenumps Logistics Platform. All Rights Reserved. Merchant Operations Division.
        </p>
      </div>
    </div>
  )
}
