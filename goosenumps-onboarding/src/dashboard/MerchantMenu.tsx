import { useState } from 'react'

const MOCK_ITEMS = [
  { id: '1', name: 'Truffle Tagliatelle',   price: 24.00, category: 'Main Course', available: true,  special: true,  tier: 'GOLD ELITE', img: '🍝' },
  { id: '2', name: 'Signature Wagyu Burger', price: 18.50, category: 'Entrée',      available: true,  special: false, tier: 'STANDARD',   img: '🍔' },
  { id: '3', name: 'Ocean Seafood Paella',   price: 32.00, category: 'Specialty',   available: false, special: false, tier: 'SILVER TIER', img: '🥘' },
]

export default function MerchantMenu() {
  const [items, setItems] = useState(MOCK_ITEMS)
  const [search, setSearch] = useState('')

  const toggleSpecial = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, special: !i.special } : i))

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Management</p>
          <p className="text-slate-500 text-sm">Manage your menu items, availability, and promotional offers in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white rounded-xl text-sm font-bold hover:bg-[#ea6c0a] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Menu Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Menu table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-[#0b1c30]">Menu Items</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100 w-48"
              />
            </div>
          </div>

          {/* Table header */}
          {/* Table header — hidden on mobile, shown on md+ */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            {['Item Details', 'Special', 'Availability', 'Loyalty Tier'].map(h => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {filtered.map(item => (
              <div key={item.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] px-5 py-4 gap-3 md:gap-0 md:items-center hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {item.img}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0b1c30]">{item.name}</p>
                    <p className="text-xs text-slate-400">${item.price.toFixed(2)} · {item.category}</p>
                  </div>
                </div>

                {/* Special toggle */}
                <div>
                  <button
                    onClick={() => toggleSpecial(item.id)}
                    className={`w-10 h-6 rounded-full transition-all relative ${item.special ? 'bg-[#f97316]' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${item.special ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Availability */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full
                    ${item.available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`} />
                    {item.available ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                </div>

                {/* Tier */}
                <div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border
                    ${item.tier === 'GOLD ELITE' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      item.tier === 'SILVER TIER' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                      'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {item.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Showing 1-10 of 42 menu items</p>
            <div className="flex gap-1">
              {['‹', '›'].map(a => (
                <button key={a} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-sm">
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Coins pool */}
          <div className="bg-[#0F172A] rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Goosenumps Coins Pool</p>
              <button className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/20">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                </svg>
              </button>
            </div>
            <p className="text-2xl font-bold text-white mb-1">48,250 🪙</p>
            <p className="text-xs text-slate-400 mb-4">Allocate coins to reward your most loyal customers for reviews and bulk orders.</p>
            <button className="w-full py-2.5 bg-[#f97316] text-white font-bold text-sm rounded-xl hover:bg-[#ea6c0a] transition-colors">
              Top Up Coins
            </button>
          </div>

          {/* Bulk discounts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🛒</span>
              <h3 className="font-semibold text-[#0b1c30]">Bulk Discounts</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Office Lunch Special', rule: 'Min. 10 items • 15% Off', active: true },
                { name: 'Event Catering',        rule: 'Min. $500 • 20% Off',    active: false },
              ].map(d => (
                <div key={d.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-[#0b1c30]">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.rule}</p>
                  </div>
                  <button className={`w-9 h-5 rounded-full relative transition-all ${d.active ? 'bg-[#f97316]' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${d.active ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-500 hover:border-[#f97316] hover:text-[#f97316] transition-colors">
                ⊕ New Discount Rule
              </button>
            </div>
          </div>

          {/* Store performance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-[#0b1c30] mb-3">Store Performance</h3>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-green-500">98%</span>
              <span className="text-xs text-slate-500">Kitchen Efficiency</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '98%' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg. Prep Time', value: '12m' },
                { label: 'Order Growth',   value: '+24%', color: 'text-blue-500' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${s.color || 'text-[#0b1c30]'}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
