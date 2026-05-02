import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'

interface OTPScreenProps {
  email: string
  name:  string
  onVerified: () => void
}

export default function OTPScreen({ email, name, onVerified }: OTPScreenProps) {
  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const [error,  setError]      = useState('')
  const [loading, setLoading]   = useState(false)
  const [resendSec, setResendSec] = useState(45)
  const [resending, setResending] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown
  useEffect(() => {
    if (resendSec <= 0) return
    const t = setTimeout(() => setResendSec(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendSec])

  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    setError('')
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const otp = digits.join('')
    if (otp.length < 6) { setError('Enter all 6 digits'); return }
    setLoading(true)
    try {
      await api.verifyOTP(email, otp)
      onVerified()
    } catch (e: any) {
      setError(e.message || 'Invalid OTP')
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await api.resendOTP(email, name)
      setResendSec(45)
      setDigits(['', '', '', '', '', ''])
      setError('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setResending(false)
    }
  }

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* Left panel */}
      <div className="flex-1 flex flex-col justify-center px-12 py-10 max-w-xl">
        {/* Header card */}
        <div className="bg-[#1e293b] rounded-2xl p-7 mb-6 relative overflow-hidden">
          <div className="absolute top-4 right-6 text-slate-600 text-5xl font-bold opacity-20 select-none">🍴</div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f97316] bg-[#f97316]/15 px-3 py-1 rounded-full mb-4">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Secure Onboarding
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">Verification Required</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            We've sent a 6-digit security code to your registered device to ensure the security of your new merchant account.
          </p>
        </div>

        {/* OTP card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* Phone icon */}
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>

          <h2 className="text-xl font-bold text-[#0b1c30] text-center mb-1">Check your email</h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Enter the code sent to <span className="font-semibold text-[#0b1c30]">{maskedEmail}</span>
          </p>

          {/* OTP inputs */}
          <div className="flex gap-2.5 justify-center mb-5" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                  ${d ? 'border-[#f97316] bg-orange-50 text-[#0b1c30]' : 'border-slate-200 text-slate-400'}
                  ${error ? 'border-red-400 bg-red-50' : ''}
                  focus:border-[#f97316] focus:ring-2 focus:ring-orange-100
                `}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

          {/* Resend */}
          <div className="flex items-center justify-center gap-1.5 text-sm mb-6">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {resendSec > 0 ? (
              <span className="text-slate-500">
                Resend code in <span className="text-[#f97316] font-semibold">0:{String(resendSec).padStart(2, '0')}</span>
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[#f97316] font-semibold hover:underline"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>
          <button
            onClick={() => setError("I didn't receive a code — please check your spam folder or resend.")}
            className="block text-center text-xs text-slate-400 hover:text-slate-600 mb-6 w-full"
          >
            I didn't receive a code
          </button>

          {/* CTA */}
          <button
            onClick={handleVerify}
            disabled={loading || digits.join('').length < 6}
            className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl text-sm transition-all
              ${digits.join('').length === 6 && !loading
                ? 'bg-[#f97316] hover:bg-[#ea6c0a] text-white shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {loading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : null}
            {loading ? 'Verifying…' : 'Verify & Setup Account →'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Need help? Contact our{' '}
          <a href="#" className="text-[#f97316] font-semibold hover:underline">Merchant Support</a> team.
        </p>
      </div>

      {/* Right image panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to the family.</h2>
          <p className="text-slate-300 text-base max-w-sm">
            Join 5,000+ merchants who have streamlined their delivery logistics with Goosenumps.
          </p>
        </div>
      </div>
    </div>
  )
}
