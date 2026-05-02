const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const REVENUE = [3200, 4100, 3800, 5200, 4800, 6100, 5900]
const LUNCH   = [40, 55, 45, 70, 60, 80, 75]
const DINNER  = [60, 80, 70, 90, 85, 100, 95]
const maxRev  = Math.max(...REVENUE)
const maxOrd  = Math.max(...DINNER)

const TOP_ITEMS = [
  { name: 'Spicy Pepperoni Mix',   orders: 248, revenue: 4464, pct: 18, img: '🍕' },
  { name: 'Classic Wagyu Burger',  orders: 192, revenue: 3840, pct: 15, img: '🍔' },
  { name: 'Quinoa Power Bowl',     orders: 156, revenue: 2028, pct: 12, img: '🥗' },
  { name: 'Glazed Sprinkle Trio',  orders: 124, revenue: 868,  pct: 8,  img: '🍩' },
]

const RECENT = [
  { id: '#GS-9281', customer: 'Alexander Thorne', status: 'preparing', time: '4m ago',  value: 42.50 },
  { id: '#GS-9280', customer: 'Sarah Jenkins',    status: 'pickup',    time: '12m ago', value: 18.20 },
  { id: '#GS-9279', customer: 'Marcus Wright',    status: 'delivered', time: '28m ago', value: 65.00 },
]

const statusStyle: Record<string, string> = {
  preparing: 'bg-orange-50 text-[#f97316]',
  pickup:    'bg-blue-50 text-blue-600',
  delivered: 'bg-green-50 text-green-600',
}

export default function MerchantAnalytics() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0b1c30]">Analytics Overview</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white">
            📅 Oct 24 – Oct 31, 2023 ▾
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white">
            ↓ Export Report
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',     value: '$24,850', delta: '+12.5%', deltaColor: 'text-green-500', sub: 'vs last week' },
          { label: 'Active Orders',     value: '142',     delta: '',       deltaColor: '',               sub: 'orders live', dot: true },
          { label: 'Avg. Prep Time',    value: '18.4 min',delta: '-2m',    deltaColor: 'text-green-500', sub: '', bar: true },
          { label: 'Goosenumps Coins',  value: '12.5k',   delta: '',       deltaColor: '',               sub: 'redeemed today', coins: true },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</p>
              {k.delta && <span className={`text-xs font-bold ${k.deltaColor}`}>{k.delta}</span>}
              {k.dot && <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />}
              {k.coins && <span className="text-[#f97316]">🪙</span>}
            </div>
            <p className="text-2xl font-bold text-[#0b1c30]">{k.value}</p>
            {k.sub && <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>}
            {k.bar && (
              <div className="flex items-center gap-1 mt-2">
                {['FAST','OPTIMAL','SLOW'].map((l, i) => (
                  <div key={l} className="flex-1">
                    <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-green-400' : i === 1 ? 'bg-[#f97316]' : 'bg-slate-200'}`} />
                    <p className="text-[9px] text-slate-400 mt-0.5 text-center">{l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-5">
          {/* Weekly Sales Trends */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-[#0b1c30]">Weekly Sales Trends</h2>
                <p className="text-xs text-slate-400">Revenue distribution across the current week</p>
              </div>
              <div className="flex gap-2">
                {['Revenue', 'Orders'].map((t, i) => (
                  <button key={t} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors
                    ${i === 0 ? 'bg-[#f97316] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* SVG line chart */}
            <div className="relative h-48">
              <svg viewBox="0 0 700 180" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0,1,2,3].map(i => (
                  <line key={i} x1="0" y1={i * 45} x2="700" y2={i * 45} stroke="#f1f5f9" strokeWidth="1"/>
                ))}
                {/* Area fill */}
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d={`M ${REVENUE.map((v, i) => `${i * 116 + 10},${170 - (v / maxRev) * 160}`).join(' L ')} L ${6 * 116 + 10},170 L 10,170 Z`}
                  fill="url(#areaGrad)"
                />
                {/* Line */}
                <polyline
                  points={REVENUE.map((v, i) => `${i * 116 + 10},${170 - (v / maxRev) * 160}`).join(' ')}
                  fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                />
                {/* Dots */}
                {REVENUE.map((v, i) => (
                  <circle key={i} cx={i * 116 + 10} cy={170 - (v / maxRev) * 160} r="4" fill="#f97316" stroke="white" strokeWidth="2"/>
                ))}
              </svg>
              {/* X labels */}
              <div className="flex justify-between px-2 mt-1">
                {DAYS.map(d => <span key={d} className="text-[10px] text-slate-400">{d}</span>)}
              </div>
            </div>
          </div>

          {/* Order Volume Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-[#0b1c30]">Order Volume Comparison</h2>
                <p className="text-xs text-slate-400">Daily average vs peak hour performance</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#f97316] inline-block" /> Lunch Peak</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" /> Dinner Peak</span>
              </div>
            </div>
            <div className="relative h-36">
              <svg viewBox="0 0 700 130" className="w-full h-full" preserveAspectRatio="none">
                {DAYS.map((_, i) => (
                  <g key={i}>
                    <rect x={i * 100 + 10} y={130 - (LUNCH[i] / maxOrd) * 120} width="35" height={(LUNCH[i] / maxOrd) * 120} fill="#f97316" rx="3"/>
                    <rect x={i * 100 + 50} y={130 - (DINNER[i] / maxOrd) * 120} width="35" height={(DINNER[i] / maxOrd) * 120} fill="#e2e8f0" rx="3"/>
                  </g>
                ))}
              </svg>
              <div className="flex justify-between px-2 mt-1">
                {DAYS.map(d => <span key={d} className="text-[10px] text-slate-400">{d}</span>)}
              </div>
            </div>
          </div>

          {/* Recent Live Activity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-[#0b1c30]">Recent Live Activity</h2>
              <button className="text-xs font-semibold text-[#f97316] hover:underline">Full Order Log</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Order ID','Customer','Status','Time','Value'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-[#0b1c30]">{r.id}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{r.customer}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusStyle[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">{r.time}</td>
                    <td className="px-5 py-3 text-sm font-bold text-[#0b1c30]">${r.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top items + Loyalty */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0b1c30]">Top Selling Items</h3>
              <button className="text-slate-400 hover:text-slate-600">···</button>
            </div>
            <div className="space-y-3">
              {TOP_ITEMS.map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {item.img}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0b1c30] truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.orders} orders · ${item.revenue.toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-bold text-[#f97316] flex-shrink-0">{item.pct}%</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-semibold text-[#f97316] hover:underline">
              View All Inventory
            </button>
          </div>

          {/* Customer Loyalty */}
          <div className="bg-[#0F172A] rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#f97316]">Customer Loyalty</p>
              <span className="text-lg">🏷️</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Redemption activity for Goosenumps Coins</p>
            <p className="text-4xl font-bold text-white mb-0.5">84.2%</p>
            <p className="text-xs text-slate-400 mb-4">Retention Score</p>
            <div className="space-y-3">
              {[
                { label: 'Redemption Ratio', value: '1:4.2' },
                { label: 'Earned (120k)', pct: 75, color: '#f97316', goal: '75% GOAL' },
                { label: 'Redeemed (28k)', pct: 100, color: '#64748b', goal: 'TARGET MET' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{s.label}</span>
                    {'value' in s
                      ? <span className="text-white font-bold">{s.value}</span>
                      : <span className="text-slate-400">{s.goal}</span>
                    }
                  </div>
                  {'pct' in s && (
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
