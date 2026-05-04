import { useState } from 'react'
import { useOnboarding } from '../context/OnboardingContext'

interface BankingStepProps {
  onNext: () => void
  onBack: () => void
}

const currencies = [
  'USD - US Dollar', 'INR - Indian Rupee', 'EUR - Euro',
  'GBP - British Pound', 'AED - UAE Dirham', 'SGD - Singapore Dollar',
  'AUD - Australian Dollar', 'CAD - Canadian Dollar',
]

const faqItems = [
  {
    q: 'When will I get paid?',
    a: 'Payouts are processed every Monday for the previous week\'s earnings. Funds typically arrive within 1–2 business days.',
  },
  {
    q: 'Are there transfer fees?',
    a: 'Goosenumps charges 0% on standard weekly payouts. Expedited same-day transfers carry a 1.5% fee.',
  },
  {
    q: 'How do I update info?',
    a: 'You can update your banking details anytime from Settings → Payouts. Changes take effect from the next payout cycle.',
  },
]

export default function BankingStep({ onNext, onBack }: BankingStepProps) {
  const { data, setBanking } = useOnboarding()
  const [form, setForm] = useState({ ...data.banking })
  const [errors,  setErrors]  = useState<Record<string, string>>({})
  const [agreed,  setAgreed]  = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.bankName.trim())      e.bankName      = 'Required'
    if (!form.accountHolder.trim()) e.accountHolder = 'Required'
    if (!form.accountNumber.trim()) e.accountNumber = 'Required'
    if (!form.routingCode.trim())   e.routingCode   = 'Required'
    else if (!/^\d{8,9}$/.test(form.routingCode.replace(/\s/g, '')))
      e.routingCode = 'Must be 8 or 9 digits'
    if (!agreed) e.agreed = 'You must confirm the details'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setBanking(form)
    onNext()
  }

  const inp = (field: string) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all bg-white placeholder:text-slate-300
    ${errors[field]
      ? 'border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-200 focus:border-[#f97316] focus:ring-2 focus:ring-orange-100'
    }`

  // Mask account number for preview
  const maskedAccount = form.accountNumber
    ? '•'.repeat(Math.max(0, form.accountNumber.length - 4)) + form.accountNumber.slice(-4)
    : '—'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1c30]">Banking &amp; Payouts</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Configure your financial details securely. This information will be used to transfer your earnings directly to your business account.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left: Secure Payment Details ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          {/* Card header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-[#0b1c30]">Secure Payment Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your data is encrypted and handled according to PCI standards.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Bank Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={e => set('bankName', e.target.value)}
                placeholder="e.g. Chase Bank, HSBC"
                className={inp('bankName')}
              />
              {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
            </div>

            {/* Account Holder */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Account Holder Name</label>
              <input
                type="text"
                value={form.accountHolder}
                onChange={e => set('accountHolder', e.target.value)}
                placeholder="Legal business name or your name"
                className={inp('accountHolder')}
              />
              {errors.accountHolder && <p className="text-red-500 text-xs mt-1">{errors.accountHolder}</p>}
            </div>

            {/* Account Number / IBAN */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Account Number / IBAN</label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={e => set('accountNumber', e.target.value)}
                placeholder="Enter your full account number"
                className={inp('accountNumber')}
              />
              {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
            </div>

            {/* Swift / Routing + Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Swift / Routing Code</label>
                <input
                  type="text"
                  value={form.routingCode}
                  onChange={e => set('routingCode', e.target.value)}
                  placeholder="8 or 9 digits"
                  maxLength={11}
                  className={inp('routingCode')}
                />
                {errors.routingCode && <p className="text-red-500 text-xs mt-1">{errors.routingCode}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Currency</label>
                <div className="relative">
                  <select
                    value={form.currency}
                    onChange={e => set('currency', e.target.value)}
                    className={`${inp('currency')} appearance-none pr-8`}
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors
              ${errors.agreed ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
              <div
                onClick={() => { setAgreed(v => !v); if (errors.agreed) setErrors(p => ({ ...p, agreed: '' })) }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-all
                  ${agreed ? 'bg-[#f97316] border-[#f97316]' : 'border-slate-300 bg-white hover:border-[#f97316]'}`}
              >
                {agreed && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                I confirm that these banking details are accurate and belong to the registered business entity.
              </p>
            </div>
            {errors.agreed && <p className="text-red-500 text-xs -mt-2">{errors.agreed}</p>}
          </div>

          {/* Card footer actions */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
            >
              Continue to Review
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Payout FAQ */}
          <div className="bg-[#eff4ff] rounded-xl border border-[#dce9ff] p-5">
            <h3 className="flex items-center gap-2 font-bold text-[#0b1c30] mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Payout FAQ
            </h3>
            <div className="space-y-1">
              {faqItems.map((item, i) => (
                <div key={i} className="border-b border-[#dce9ff] last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-2.5 text-left text-sm font-medium text-[#0b1c30] hover:text-[#f97316] transition-colors"
                  >
                    {item.q}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className={`flex-shrink-0 ml-2 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <p className="text-xs text-slate-500 pb-3 leading-relaxed">{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Business Payout Card */}
          <div className="bg-[#0F172A] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Business Payout Card
              </p>
            </div>

            {/* Card number preview */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-1">Account</p>
              <p className="text-lg font-bold tracking-widest font-mono">
                {form.accountNumber
                  ? maskedAccount
                  : <span className="text-slate-600">•••• •••• ••••</span>
                }
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-400">Awaiting Verification</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Currency</p>
                <p className="text-sm font-semibold text-white">
                  {form.currency.split(' - ')[0] || 'USD'}
                </p>
              </div>
            </div>
          </div>

          {/* PCI Compliant badge */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1c30]">PCI Compliant</p>
              <p className="text-xs text-slate-400">Secure Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
      </div>
    </form>
  )
}
