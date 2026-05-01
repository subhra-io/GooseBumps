import { useState, useRef } from 'react'
import MapPicker from '../components/MapPicker'
import { useOnboarding } from '../context/OnboardingContext'

interface Props { onNext: () => void; onBack: () => void }

const categories = [
  'Fast Food','Fine Dining','Casual Dining','Café & Bakery','Pizza',
  'Sushi & Japanese','Indian Cuisine','Chinese Cuisine','Italian',
  'Mexican','Mediterranean','Desserts & Ice Cream','Beverages & Juice Bar',
  'Cloud Kitchen','Food Truck','Other',
]

export default function BusinessProfileStep({ onNext }: Props) {
  const { data, setBusiness } = useOnboarding()
  const b = data.business

  const [form, setForm] = useState({ ...b })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const logoRef = useRef<HTMLInputElement>(null)

  const set = (field: string, value: string | number | File | null) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleLogoChange = (file: File) => {
    const preview = URL.createObjectURL(file)
    setForm(prev => ({ ...prev, logoFile: file, logoPreview: preview }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.businessName.trim()) e.businessName = 'Required'
    if (!form.legalName.trim())    e.legalName    = 'Required'
    if (!form.category)            e.category     = 'Required'
    if (!form.email.trim())        e.email        = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim())        e.phone        = 'Required'
    if (!form.address.trim())      e.address      = 'Required'
    if (!form.city.trim())         e.city         = 'Required'
    if (!form.zip.trim())          e.zip          = 'Required'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setBusiness(form)
    onNext()
  }

  const requiredFields = ['businessName','legalName','category','email','phone','address','city','zip']
  const filled = requiredFields.filter(f => String((form as any)[f]).trim() !== '').length
  const progressPct = Math.round((filled / requiredFields.length) * 100)

  const inp = (field: string) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all bg-white placeholder:text-slate-300
    ${errors[field]
      ? 'border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-200 focus:border-[#f97316] focus:ring-2 focus:ring-orange-100'}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0b1c30]">Business Profile</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Please provide accurate information about your establishment to help us verify your business and set up your merchant account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* ── Left ── */}
        <div className="space-y-5">

          {/* Core Identity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#9d4300] mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Core Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Business Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. The Golden Goose Bistro" className={inp('businessName')} />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Legal Entity Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.legalName} onChange={e => set('legalName', e.target.value)} placeholder="e.g. GG Hospitality Group LLC" className={inp('legalName')} />
                {errors.legalName && <p className="text-red-500 text-xs mt-1">{errors.legalName}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={form.category} onChange={e => set('category', e.target.value)} className={`${inp('category')} appearance-none pr-9`}>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#9d4300] mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Location & Address
            </h2>
            <div className="mb-4">
              <MapPicker
                initialLat={form.lat}
                initialLng={form.lng}
                onLocationChange={(lat, lng, addr, city) => {
                  setForm(prev => ({
                    ...prev, lat, lng, mapAddress: addr,
                    address: prev.address || addr.split(',')[0]?.trim() || prev.address,
                    city:    prev.city    || city || addr.split(',')[1]?.trim() || prev.city,
                  }))
                }}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Full Street Address <span className="text-red-500">*</span></label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Culinary Way, Suite 400" className={inp('address')} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Brajrajnagar" className={inp('city')} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">ZIP / Postal Code <span className="text-red-500">*</span></label>
                  <input type="text" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="768216" className={inp('zip')} />
                  {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="space-y-4">
          {/* Contact Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#9d4300] mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Contact Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@bistro.com" className={inp('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500 font-medium flex-shrink-0">+91</div>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" className={`${inp('phone')} flex-1`} />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Store Logo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#9d4300] mb-3">Store Logo</h2>
            <div
              onClick={() => logoRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#f97316] hover:bg-orange-50/20 transition-all"
            >
              {form.logoPreview ? (
                <img src={form.logoPreview} alt="Logo" className="w-16 h-16 object-cover rounded-xl" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Upload store logo</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG (max 2MB)</p>
                </>
              )}
            </div>
            {form.logoPreview && (
              <button type="button" onClick={() => logoRef.current?.click()} className="w-full mt-2 text-xs font-semibold text-[#9d4300] hover:underline">
                Change Logo
              </button>
            )}
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoChange(f) }} />
          </div>

          {/* Verification Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9d4300] mb-3">Verification Preview</p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-4">
              {form.logoPreview
                ? <img src={form.logoPreview} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                : <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
              }
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0b1c30] truncate">{form.businessName || 'Business Name'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{form.businessName ? 'Profile in progress…' : 'Pending basic info…'}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Progress</span>
                <span className="text-xs font-bold text-[#f97316]">{progressPct}% Complete</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#f97316] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold rounded-xl transition-colors shadow-md text-sm">
            Save and Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <p className="text-center text-[11px] text-slate-400 leading-relaxed">
            By clicking continue, you agree to our{' '}
            <a href="#" className="text-[#9d4300] hover:underline">Merchant Terms of Service</a> and{' '}
            <a href="#" className="text-[#9d4300] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </form>
  )
}
