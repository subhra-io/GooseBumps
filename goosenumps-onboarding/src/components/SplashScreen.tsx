import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

const locations = [
  { lang: 'English',   text: 'Brajrajnagar',  sub: 'Odisha, India',   font: 'Inter, sans-serif' },
  { lang: 'ଓଡ଼ିଆ',     text: 'ବ୍ରଜରାଜନଗର',    sub: 'ଓଡ଼ିଶା, ଭାରତ',    font: '"Noto Sans Oriya", "Noto Sans", system-ui, sans-serif' },
  { lang: 'हिन्दी',    text: 'ब्रजराजनगर',    sub: 'ओडिशा, भारत',    font: '"Noto Sans Devanagari", "Noto Sans", system-ui, sans-serif' },
  { lang: 'বাংলা',     text: 'ব্রজরাজনগর',    sub: 'ওড়িশা, ভারত',    font: '"Noto Sans Bengali", "Noto Sans", system-ui, sans-serif' },
  { lang: 'తెలుగు',   text: 'బ్రజరాజ్‌నగర్',  sub: 'ఒడిశా, భారత్',   font: '"Noto Sans Telugu", "Noto Sans", system-ui, sans-serif' },
  { lang: 'தமிழ்',    text: 'பிரஜராஜ்நகர்',  sub: 'ஒடிசா, இந்தியா', font: '"Noto Sans Tamil", "Noto Sans", system-ui, sans-serif' },
]

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [locIndex, setLocIndex] = useState(0)
  const [locFade, setLocFade] = useState(true)
  const [exiting, setExiting] = useState(false)

  // Cycle languages every 1.1s
  useEffect(() => {
    const interval = setInterval(() => {
      setLocFade(false)
      setTimeout(() => {
        setLocIndex(i => (i + 1) % locations.length)
        setLocFade(true)
      }, 350)
    }, 1100)
    return () => clearInterval(interval)
  }, [])

  // Exit on click or spacebar
  const handleExit = () => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => onComplete(), 700)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') handleExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exiting])

  const loc = locations[locIndex]

  return (
    <div
      onClick={handleExit}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{
        background: '#0F172A',
        transition: 'opacity 700ms ease, transform 700ms ease',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* Google Fonts for Indic scripts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&family=Noto+Sans+Bengali:wght@400;700&family=Noto+Sans+Telugu:wght@400;700&family=Noto+Sans+Tamil:wght@400;700&display=swap"
      />

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.11) 0%, transparent 65%)' }} />

        {/* Floating orbs */}
        <div className="absolute top-[10%] left-[7%] w-80 h-80 rounded-full blur-3xl"
          style={{ background: '#f97316', opacity: 0.08, animation: 'orb1 10s ease-in-out infinite' }} />
        <div className="absolute bottom-[12%] right-[5%] w-64 h-64 rounded-full blur-3xl"
          style={{ background: '#bf0715', opacity: 0.07, animation: 'orb2 13s ease-in-out infinite' }} />
        <div className="absolute top-[60%] left-[2%] w-44 h-44 rounded-full blur-2xl"
          style={{ background: '#f97316', opacity: 0.07, animation: 'orb3 8s ease-in-out infinite' }} />
        <div className="absolute top-[18%] right-[10%] w-36 h-36 rounded-full blur-2xl"
          style={{ background: '#9d4300', opacity: 0.06, animation: 'orb1 14s ease-in-out infinite reverse' }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Logo */}
        <div className="relative w-24 h-24 mb-7">
          <div className="absolute inset-0 rounded-[22px] border border-[#f97316]/20"
            style={{ animation: 'ping1 2.8s ease-out infinite' }} />
          <div className="absolute -inset-2 rounded-[30px] border border-[#f97316]/10"
            style={{ animation: 'ping1 3.6s ease-out infinite', animationDelay: '0.5s' }} />
          <div className="absolute inset-0 rounded-[22px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #9d4300 100%)',
              boxShadow: '0 0 50px rgba(249,115,22,0.35), 0 0 100px rgba(249,115,22,0.12)',
            }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
            </svg>
          </div>
        </div>

        {/* Brand */}
        <h1 className="text-[44px] font-bold tracking-tight text-white leading-none mb-2">
          Goose<span style={{ color: '#f97316' }}>numps</span>
        </h1>
        <p className="text-slate-500 text-[11px] tracking-[0.25em] uppercase font-medium mb-12">
          Partner Onboarding Portal
        </p>

        {/* ── Location block ── */}
        <div className="flex flex-col items-center" style={{ minHeight: '110px' }}>

          {/* Pin + language label */}
          <div className="flex items-center gap-1.5 mb-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{
                color: 'rgba(249,115,22,0.75)',
                transition: 'opacity 350ms ease',
                opacity: locFade ? 1 : 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {loc.lang}
            </span>
          </div>

          {/* Location name */}
          <div
            style={{
              transition: 'opacity 350ms ease, transform 350ms ease',
              opacity: locFade ? 1 : 0,
              transform: locFade ? 'translateY(0)' : 'translateY(8px)',
              textAlign: 'center',
            }}
          >
            <p
              className="font-bold text-white leading-tight"
              style={{
                fontFamily: loc.font,
                fontSize: '30px',
                lineHeight: '1.25',
                letterSpacing: loc.lang === 'English' ? '-0.01em' : '0',
              }}
            >
              {loc.text}
            </p>
            <p
              className="text-slate-400 mt-1"
              style={{
                fontFamily: loc.font,
                fontSize: '14px',
              }}
            >
              {loc.sub}
            </p>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-1.5 mt-5">
            {locations.map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  height: '5px',
                  width: i === locIndex ? '18px' : '5px',
                  background: i === locIndex ? '#f97316' : 'rgba(255,255,255,0.13)',
                  transition: 'all 350ms ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skip hint */}
      <div className="absolute bottom-8 flex flex-col items-center gap-1.5"
        style={{
          transition: 'opacity 600ms ease',
          opacity: exiting ? 0 : 1,
        }}
      >
        <p className="text-slate-600 text-[11px] tracking-widest uppercase">
          Click anywhere to continue
        </p>
        {/* Animated chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'chevronBounce 1.6s ease-in-out infinite' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <style>{`
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(26px,-38px) scale(1.1); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-30px,24px) scale(0.92); }
        }
        @keyframes orb3 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(20px,-26px); }
        }
        @keyframes ping1 {
          0%   { transform: scale(1);    opacity: 0.6; }
          80%  { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        @keyframes chevronBounce {
          0%,100% { transform: translateY(0);   opacity: 0.5; }
          50%      { transform: translateY(5px); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
