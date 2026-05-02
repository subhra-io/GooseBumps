import { useState } from 'react'
import { api } from '../lib/api'

interface SetPasswordScreenProps {
  token: string
  email: string
  onComplete: () => void
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters long', ok: password.length >= 8 },
    { label: 'Must include a number or symbol', ok: /[\d!@#$%^&*]/.test(password) },
    { label: 'Uppercase and lowercase letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const labels = ['', 'WEAK', 'FAIR', 'STRONG']
  const colors = ['', '#ef4444', '#f59e0b', '#22c55e']

  return (
    <div className="bg-[#eff4ff] rounded-xl p-4 mt-2">
      <p className="text-xs font-bold text-slate-600 mb-2">Password Requirements:</p>
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
              ${c.ok ? 'bg-[#f97316]' : 'border-2 border-slate-300'}`}>
              {c.ok && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span className={`text-xs ${c.ok ? 'text-slate-700' : 'text-slate-400'}`}>{c.label}</span>
          </div>
        ))}
      </div>
      {password && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {[1,2,3].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: i <= score ? colors[score] : '#e2e8f0' }} />
            ))}
          </div>
          <span className="text-[10px] font-bold" style={{ color: colors[score] }}>
            {labels[score]} PASSWORD
          </span>
        </div>
      )}
    </div>
  )
}

export default function SetPasswordScreen({ token, email, onComplete }: SetPasswordScreenProps) {
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = async () => {
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.setPassword(token, password)
      onComplete()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left orange panel */}
      <div className="hidden lg:flex w-[480px] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #9d4300 100%)' }}>
        {/* Wave decoration */}
        <svg className="absolute bottom-0 left-0 right-0 opacity-20" viewBox="0 0 480 200" fill="none">
          <path d="M0 100 Q120 0 240 100 Q360 200 480 100 L480 200 L0 200 Z" fill="white"/>
          <path d="M0 140 Q120 40 240 140 Q360 240 480 140 L480 200 L0 200 Z" fill="white" opacity="0.5"/>
        </svg>

        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg">Goosenumps</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-3">Welcome to the Platform</h2>
          <p className="text-orange-100 text-sm leading-relaxed mb-8">
            Your secure merchant portal is ready. We've verified your secure token; now let's finalize your account security to get you started with your first orders.
          </p>
          <div className="space-y-3">
            {[
              { icon: '🔒', title: 'Bank-Grade Security', sub: 'End-to-end encrypted onboarding' },
              { icon: '⚡', title: 'Quick Setup', sub: 'Less than 2 minutes to go live' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-orange-100 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-orange-200 text-xs relative z-10">© 2024 Goosenumps Logistics. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-6">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secure Token Verified
          </span>

          <h1 className="text-2xl font-bold text-[#0b1c30] mb-1">Finalize Your Access</h1>
          <p className="text-slate-500 text-sm mb-6">Verify your identity and set up your secure credentials.</p>

          {/* Verified email */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Verified Email</p>
                <p className="text-sm font-semibold text-[#0b1c30]">{email}</p>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>

          {/* Password fields */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-[#0b1c30] mb-1.5">Create New Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100 pr-11"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPwd
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters with a mix of symbols.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0b1c30] mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConf ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError('') }}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 pr-11
                    ${confirm && confirm !== password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#f97316] focus:ring-orange-100'
                    }`}
                />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {password && <PasswordStrength password={password} />}

          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

          {/* Step indicator */}
          <div className="flex items-center gap-2 my-5">
            <div className="h-1 w-16 bg-[#f97316] rounded-full" />
            <div className="h-1 w-16 bg-slate-200 rounded-full" />
            <div className="h-1 w-16 bg-slate-200 rounded-full" />
            <span className="text-xs text-slate-400 ml-auto">Step 1 of 3</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !password || !confirm}
            className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl text-sm transition-all
              ${!loading && password && confirm
                ? 'bg-[#f97316] hover:bg-[#ea6c0a] text-white shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {loading
              ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : null
            }
            {loading ? 'Setting up…' : 'Proceed to Security Step →'}
          </button>

          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              256-bit AES
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              PCI Compliant
            </span>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Having trouble?{' '}
            <a href="#" className="text-[#f97316] font-semibold hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  )
}
