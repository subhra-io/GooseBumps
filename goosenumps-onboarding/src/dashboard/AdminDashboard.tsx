import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

interface Merchant {
  id: string
  business_name: string
  legal_name: string
  category: string
  email: string
  city: string
  status: string
  submitted_at: string
  logo_url: string
  documents: { type: string; file_name: string }[]
}

interface DashboardStats {
  total_merchants:  number
  active_merchants: number
  pending_review:   number
  live_orders:      number
  total_revenue:    number
  avg_commission:   number
}

const WEEKLY_BARS = [180, 240, 310, 390, 280, 420, 480]
const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN']
const maxBar = Math.max(...WEEKLY_BARS)

const statusStyle: Record<string, string> = {
  approved:     'bg-green-50 text-green-600',
  under_review: 'bg-amber-50 text-amber-600',
  pending:      'bg-blue-50 text-blue-600',
  rejected:     'bg-red-50 text-red-500',
  suspended:    'bg-slate-100 text-slate-500',
}

const statusLabel: Record<string, string> = {
  approved:     '● Active',
  under_review: '● Under Review',
  pending:      '● Pending',
  rejected:     '● Rejected',
  suspended:    '● Suspended',
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats,    setStats]    = useState<DashboardStats | null>(null)
  const [pending,  setPending]  = useState<Merchant[]>([])
  const [merchants,setMerchants]= useState<Merchant[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, pendingRes, merchantsRes] = await Promise.all([
        api.adminDashboard() as Promise<DashboardStats>,
        api.adminPending()   as Promise<{ applications: Merchant[] }>,
        api.adminMerchants() as Promise<{ merchants: Merchant[] }>,
      ])
      setStats(statsRes)
      setPending(pendingRes.applications || [])
      setMerchants(merchantsRes.merchants || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      await api.adminApprove(id)
      showToast('✅ Merchant approved — password setup email sent')
      fetchAll()
    } catch (e: any) {
      showToast('❌ ' + (e.message || 'Approval failed'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return
    setActionLoading(id)
    try {
      await api.adminReject(id, rejectReason)
      showToast('Merchant rejected — notification sent')
      setRejectId(null)
      setRejectReason('')
      fetchAll()
    } catch (e: any) {
      showToast('❌ ' + (e.message || 'Rejection failed'))
    } finally {
      setActionLoading(null)
    }
  }

  const filteredMerchants = merchants.filter(m =>
    !search ||
    m.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  icon: '⊞' },
    { id: 'orders',    label: 'Orders',     icon: '📋' },
    { id: 'menu',      label: 'Menu',       icon: '🍽️' },
    { id: 'merchants', label: 'Merchants',  icon: '🏪' },
    { id: 'analytics', label: 'Analytics',  icon: '📊' },
    { id: 'settings',  label: 'Settings',   icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex">
      {/* Sidebar */}
      <aside className="w-[220px] min-h-screen bg-[#0F172A] flex flex-col fixed left-0 top-0 bottom-0 z-10">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-[#f97316] font-bold text-lg">Goosenumps</p>
          <p className="text-slate-500 text-[10px]">Admin Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                ${activeNav === item.id ? 'bg-white/10 text-white border-l-2 border-[#f97316]' : 'text-slate-500 hover:bg-white/8 hover:text-slate-300'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center font-bold text-white text-sm">G</div>
            <div>
              <p className="text-white text-xs font-semibold">Goosenumps Admin</p>
              <p className="text-slate-500 text-[10px]">v2.4.0-stable</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition-colors px-1">→ Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-[220px]">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-[#f97316] flex-1">Merchant Overview</h1>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-4.43"/>
              </svg>
              Refresh
            </button>
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] to-[#9d4300] flex items-center justify-center text-white text-sm font-bold">A</button>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-[#0b1c30] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
            {toast}
          </div>
        )}

        <main className="p-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={fetchAll} className="ml-auto text-xs font-semibold text-red-600 hover:underline">Retry</button>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Merchants', value: loading ? '…' : String(stats?.active_merchants ?? 0), delta: '', icon: '🏪' },
              { label: 'Live Orders',      value: loading ? '…' : String(stats?.live_orders ?? 0),      delta: '', icon: '📦' },
              { label: 'Avg Commission',   value: loading ? '…' : `${stats?.avg_commission ?? 0}%`,     delta: 'Stable', icon: '💰' },
              { label: 'Pending Review',   value: loading ? '…' : String(stats?.pending_review ?? 0),   delta: '', icon: '⏳' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{k.icon}</span>
                  {k.delta && <span className="text-xs font-bold text-green-500">{k.delta}</span>}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</p>
                <p className={`text-2xl font-bold text-[#0b1c30] mt-0.5 ${loading ? 'animate-pulse text-slate-300' : ''}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            {/* Revenue chart */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-[#0b1c30]">Platform Revenue</h2>
                  <p className="text-xs text-slate-400">Global commission overview</p>
                </div>
                <div className="flex gap-2">
                  {['Monthly','Weekly'].map((t, i) => (
                    <button key={t} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${i === 1 ? 'bg-[#f97316] text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0b1c30] mb-1">
                ${loading ? '…' : (stats?.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="relative h-40 mt-4">
                <svg viewBox="0 0 700 140" className="w-full h-full" preserveAspectRatio="none">
                  {WEEKLY_BARS.map((v, i) => (
                    <rect key={i} x={i * 100 + 10} y={140 - (v / maxBar) * 130} width="70" height={(v / maxBar) * 130}
                      fill={i === 6 || i === 3 ? '#f97316' : '#e2e8f0'} rx="4"/>
                  ))}
                </svg>
                <div className="flex justify-between px-2 mt-1">
                  {DAYS.map(d => <span key={d} className="text-[10px] text-slate-400">{d}</span>)}
                </div>
              </div>
            </div>

            {/* Pending verification — LIVE DATA */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#0b1c30]">Pending Verification</h2>
                <span className="text-xs font-bold text-[#f97316] bg-orange-50 px-2 py-1 rounded-full">
                  {pending.length} new
                </span>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <svg className="animate-spin text-[#f97316]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
              ) : pending.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#0b1c30]">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending applications right now.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto flex-1" style={{ maxHeight: '380px' }}>
                  {pending.map(m => (
                    <div key={m.id} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-lg font-bold text-[#f97316] flex-shrink-0">
                          {m.business_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#0b1c30] truncate">{m.business_name || '—'}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.category}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            {m.email}
                          </p>
                          {m.city && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              {m.city}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-300 mt-0.5">
                            Submitted: {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${statusStyle[m.status] || 'bg-slate-100 text-slate-500'}`}>
                          {m.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* Docs count */}
                      {m.documents && m.documents.length > 0 && (
                        <p className="text-[10px] text-slate-400 mb-2">
                          📎 {m.documents.length} document{m.documents.length > 1 ? 's' : ''} uploaded
                        </p>
                      )}

                      {/* Actions */}
                      {(m.status === 'pending' || m.status === 'under_review') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(m.id)}
                            disabled={actionLoading === m.id}
                            className="flex-1 py-2 bg-[#f97316] text-white text-xs font-bold rounded-lg hover:bg-[#ea6c0a] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {actionLoading === m.id ? (
                              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                              </svg>
                            ) : '✓'} APPROVE
                          </button>
                          <button
                            onClick={() => { setRejectId(m.id); setRejectReason('') }}
                            disabled={actionLoading === m.id}
                            className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            ✕ REJECT
                          </button>
                        </div>
                      )}

                      {/* Reject reason input */}
                      {rejectId === m.id && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-semibold text-red-600 mb-2">Rejection reason (required):</p>
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={2}
                            className="w-full text-xs border border-red-200 rounded-lg p-2 outline-none resize-none focus:border-red-400"
                            placeholder="e.g. Missing valid business license..."
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleReject(m.id)}
                              disabled={!rejectReason.trim() || actionLoading === m.id}
                              className="flex-1 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                            >
                              Confirm Reject
                            </button>
                            <button onClick={() => setRejectId(null)} className="flex-1 py-1.5 border border-slate-200 text-xs font-bold rounded-lg">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={fetchAll} className="mt-4 w-full text-xs font-semibold text-[#f97316] hover:underline">
                VIEW ALL APPLICATIONS
              </button>
            </div>
          </div>

          {/* All Merchants table — LIVE DATA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-[#0b1c30]">
                Recent Merchant Activity
                <span className="ml-2 text-xs font-normal text-slate-400">({filteredMerchants.length} merchants)</span>
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search merchants..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#f97316] w-48"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin text-[#f97316]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </div>
            ) : filteredMerchants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">No merchants found</p>
                {search && <p className="text-slate-300 text-xs mt-1">Try clearing the search</p>}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Merchant','Status','Email','City','Submitted','Actions'].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMerchants.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-xs font-bold text-[#f97316]">
                            {m.business_name?.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0b1c30]">{m.business_name}</p>
                            <p className="text-xs text-slate-400">{m.legal_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[m.status] || 'bg-slate-100 text-slate-500'}`}>
                          {statusLabel[m.status] || m.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">{m.email}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{m.city || '—'}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {(m.status === 'pending' || m.status === 'under_review') && (
                            <>
                              <button
                                onClick={() => handleApprove(m.id)}
                                disabled={actionLoading === m.id}
                                className="text-xs font-bold text-green-600 hover:underline disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => { setRejectId(m.id); setRejectReason('') }}
                                className="text-xs font-bold text-red-500 hover:underline"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {m.status === 'approved' && (
                            <span className="text-xs text-green-500 font-semibold">✓ Approved</span>
                          )}
                          {m.status === 'rejected' && (
                            <span className="text-xs text-red-400 font-semibold">✕ Rejected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Showing {filteredMerchants.length} merchants</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
