import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom orange pin
const orangeIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:44px;filter:drop-shadow(0 4px 8px rgba(249,115,22,0.5))">
    <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="44">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#f97316"/>
      <circle cx="18" cy="18" r="8" fill="white" opacity="0.9"/>
      <circle cx="18" cy="18" r="4" fill="#f97316"/>
    </svg>
  </div>`,
  iconSize:    [36, 44],
  iconAnchor:  [18, 44],
  popupAnchor: [0, -44],
})

// Blue GPS dot icon
const gpsIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;position:relative">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:gpsPulse 1.8s ease-out infinite"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 6px rgba(59,130,246,0.6)"></div>
    <style>@keyframes gpsPulse{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.8);opacity:0}}</style>
  </div>`,
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
})

type GpsState = 'idle' | 'requesting' | 'success' | 'denied' | 'error'

interface MapPickerProps {
  onLocationChange: (lat: number, lng: number, address: string, city?: string) => void
  initialLat?: number
  initialLng?: number
}

export default function MapPicker({
  onLocationChange,
  initialLat = 21.8167,
  initialLng = 83.9167,
}: MapPickerProps) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapObj    = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const gpsDotRef = useRef<L.Marker | null>(null)

  const [address,  setAddress]  = useState('Brajrajnagar, Odisha, India')
  const [loading,  setLoading]  = useState(false)
  const [gpsState, setGpsState] = useState<GpsState>('idle')

  // ── Reverse geocode via Nominatim ──────────────────────
  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const full  = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      const parts = full.split(',')
      const short = parts.slice(0, 3).join(',').trim()
      const city  = (data.address?.city || data.address?.town || data.address?.village || parts[1] || '').trim()
      setAddress(short)
      onLocationChange(lat, lng, short, city)
    } catch {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setAddress(fallback)
      onLocationChange(lat, lng, fallback)
    } finally {
      setLoading(false)
    }
  }

  // ── Move map + marker to coords ────────────────────────
  const flyTo = (lat: number, lng: number) => {
    if (!mapObj.current || !markerRef.current) return
    mapObj.current.flyTo([lat, lng], 16, { duration: 1.4 })
    markerRef.current.setLatLng([lat, lng])
    reverseGeocode(lat, lng)
  }

  // ── GPS: request device location ──────────────────────
  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsState('error')
      return
    }
    setGpsState('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        setGpsState('success')

        // Show blue accuracy circle + dot
        if (mapObj.current) {
          // Remove old GPS dot
          if (gpsDotRef.current) gpsDotRef.current.remove()
          const dot = L.marker([lat, lng], { icon: gpsIcon, zIndexOffset: -1 }).addTo(mapObj.current)
          L.circle([lat, lng], {
            radius: accuracy,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.08,
            weight: 1,
          }).addTo(mapObj.current)
          gpsDotRef.current = dot
        }

        flyTo(lat, lng)
        // Reset state after 3s
        setTimeout(() => setGpsState('idle'), 3000)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGpsState('denied')
        else setGpsState('error')
        setTimeout(() => setGpsState('idle'), 4000)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── Init map ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapObj.current) return

    const map = L.map(mapRef.current, {
      center:      [initialLat, initialLng],
      zoom:        14,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const marker = L.marker([initialLat, initialLng], { icon: orangeIcon, draggable: true }).addTo(map)
    markerRef.current = marker

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      reverseGeocode(lat, lng)
    })

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng)
      reverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    mapObj.current = map
    reverseGeocode(initialLat, initialLng)

    return () => { map.remove(); mapObj.current = null }
  }, [])

  // ── GPS button label / style ───────────────────────────
  const gpsLabel: Record<GpsState, string> = {
    idle:       'Use My Location',
    requesting: 'Locating…',
    success:    'Location Found!',
    denied:     'Permission Denied',
    error:      'Location Unavailable',
  }
  const gpsColor: Record<GpsState, string> = {
    idle:       'bg-white border-slate-200 text-slate-700 hover:border-[#f97316] hover:text-[#f97316]',
    requesting: 'bg-blue-50 border-blue-300 text-blue-600',
    success:    'bg-green-50 border-green-300 text-green-600',
    denied:     'bg-red-50 border-red-300 text-red-500',
    error:      'bg-amber-50 border-amber-300 text-amber-600',
  }

  return (
    <div className="space-y-2">
      {/* GPS button — above the map */}
      <button
        type="button"
        onClick={handleGps}
        disabled={gpsState === 'requesting'}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border rounded-xl transition-all
          ${gpsColor[gpsState]}
          ${gpsState === 'requesting' ? 'cursor-wait' : 'cursor-pointer'}
        `}
      >
        {gpsState === 'requesting' ? (
          /* Spinner */
          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : gpsState === 'success' ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : gpsState === 'denied' || gpsState === 'error' ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          /* GPS crosshair icon */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
          </svg>
        )}
        {gpsLabel[gpsState]}
      </button>

      {/* Permission hint */}
      {gpsState === 'denied' && (
        <p className="text-xs text-red-500 text-center">
          Location access was denied. Please enable it in your browser settings and try again.
        </p>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200" style={{ height: '220px' }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Address overlay bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 z-[1000]"
          style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(6px)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-white text-xs truncate">
              {loading ? 'Resolving address…' : `Pin dropped: ${address}`}
            </span>
          </div>
          <button
            onClick={() => {
              if (markerRef.current) {
                const { lat, lng } = markerRef.current.getLatLng()
                reverseGeocode(lat, lng)
              }
            }}
            className="text-[#f97316] text-xs font-semibold flex-shrink-0 ml-3 hover:underline"
          >
            Adjust Marker
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Click on the map or drag the pin to set your exact location
      </p>
    </div>
  )
}
