import { useState } from 'react'

const STATUS_TABS = ['All Orders (24)', 'New (3)', 'Preparing (8)', 'Ready (5)', 'Out for Delivery (8)']

const MOCK_ORDERS = [
  { id: '#GNS-8821', customer: 'Eleanor Fant',    items: '2x Spicy Miso…', total: 42.50, status: 'new',      type: 'delivery' },
  { id: '#GNS-8819', customer: 'Marcus Holloway', items: '1x Dragon Roll…', total: 58.90, status: 'preparing', type: 'pickup' },
  { id: '#GNS-8815', customer: 'Sarah Connor',    items: '4x California Ro…', total: 34.00, status: 'ready',    type: 'delivery' },
]

const statusConfig: Record<string, { label: string; color: string; bg: string; action?: string; actionColor?: string }> = {
  new:       { label: 'NEW',    color: '#f97316', bg: '#fff7ed', action: 'Accept Order',  actionColor: 'bg-[#f97316] text-white' },
  preparing: { label: 'PREP',   color: '#3b82f6', bg: '#eff6ff', action: 'Mark as Ready', actionColor: 'bg-green-500 text-white' },
  ready:     { label: 'READY',  color: '#22c55e', bg: '#f0fdf4', action: 'Waiting for Driver', actionColor: 'bg-slate-100 text-slate-500' },
}

export default function MerchantOrders() {
  const [activeTab, setActiveTab] = useState(0)
  const [orders, setOrders] = useState(MOCK_ORDERS)

  const handleAction = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o
      const next: Record<string, string> = { new: 'preparing', preparing: 'ready', ready: 'delivering' }
      return { ...o, status: next[o.status] || o.status }
    }))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">Live Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your active restaurant floor operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Today, Oct 24
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Orders list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {STATUS_TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                  ${activeTab === i
                    ? 'text-[#f97316] border-b-2 border-[#f97316]'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Order rows */}
          <div className="divide-y divide-slate-100">
            {orders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.new
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  {/* Status badge */}
                  <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    {order.status === 'new' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    ) : order.status === 'preparing' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
                        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    <span className="text-[9px] font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>

                  {/* Order info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</p>
                      <p className="text-sm font-bold text-[#0b1c30]">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
                      <p className="text-sm font-semibold text-[#0b1c30]">{order.customer}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Items</p>
                      <p className="text-sm text-slate-500 truncate">{order.items}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                    <p className="text-base font-bold text-[#0b1c30]">${order.total.toFixed(2)}</p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleAction(order.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition-colors ${cfg.actionColor}`}
                  >
                    {cfg.action}
                  </button>

                  <button className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>

          <div className="px-5 py-3 border-t border-slate-100">
            <button className="w-full py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Load More Orders
            </button>
          </div>
        </div>

        {/* Right stats */}
        <div className="space-y-4">
          {/* Orders today */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Orders Today</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-4xl font-bold text-[#0b1c30]">142</span>
              <span className="text-sm font-bold text-green-500 mb-1">↑ 12%</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">vs. same time yesterday</p>
            <div className="flex gap-3 text-xs">
              <div><span className="font-bold text-[#0b1c30]">48 (34%)</span><br/><span className="text-slate-400">PICKUP</span></div>
              <div><span className="font-bold text-[#0b1c30]">94 (66%)</span><br/><span className="text-slate-400">DELIVERY</span></div>
            </div>
          </div>

          {/* Pending pickup */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Pending Pickup</p>
            <div className="space-y-3">
              {[
                { icon: '🛍️', title: '8 Orders Ready', sub: 'Estimated pickup in 5m' },
                { icon: '🚗', title: '3 Drivers En Route', sub: 'Closest driver 1.2km away' },
              ].map(item => (
                <div key={item.title} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#0b1c30]">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-[#0F172A] rounded-xl p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-white mb-3">$4,821.50</p>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Daily Target ($5k)</span>
                <span className="text-[#f97316] font-bold">96%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#f97316] rounded-full" style={{ width: '96%' }} />
              </div>
            </div>
            <button className="w-full py-2.5 bg-white text-[#0b1c30] font-bold text-sm rounded-xl hover:bg-orange-50 transition-colors">
              View Earnings Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
