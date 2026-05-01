import { useState, useRef } from 'react'
import { useOnboarding } from '../context/OnboardingContext'

interface DocumentUploadStepProps {
  onNext: () => void
  onBack: () => void
}

interface UploadedFile {
  name: string
  size: number
  status: 'uploading' | 'done'
  progress: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Simulate upload with progress
function simulateUpload(
  onProgress: (p: number) => void,
  onDone: () => void
) {
  let p = 0
  const iv = setInterval(() => {
    p += Math.random() * 30 + 10
    if (p >= 100) {
      clearInterval(iv)
      onProgress(100)
      setTimeout(onDone, 200)
    } else {
      onProgress(Math.round(p))
    }
  }, 250)
}

// ── Single upload zone ──────────────────────────────────────
function UploadZone({
  slotId,
  label,
  file,
  onFile,
  onRemove,
}: {
  slotId: string
  label?: string
  file: UploadedFile | null
  onFile: (id: string, f: File) => void
  onRemove: (id: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  if (file) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0b1c30] truncate">{file.name}</p>
          {file.status === 'uploading' ? (
            <div className="mt-1">
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316] rounded-full transition-all duration-200"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
          )}
        </div>
        {file.status === 'done' && (
          <button
            onClick={() => onRemove(slotId)}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault(); setDrag(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(slotId, f)
      }}
      className={`flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
        ${drag ? 'border-[#f97316] bg-orange-50/40' : 'border-slate-200 hover:border-[#f97316] hover:bg-orange-50/20'}
      `}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={drag ? '#f97316' : '#cbd5e1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <div className="text-center">
        <p className="text-sm text-slate-500">{label || 'Click or drag to upload'}</p>
        <p className="text-xs text-slate-400 mt-0.5">PDF, JPG (Max 10MB)</p>
      </div>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(slotId, f) }}
      />
    </div>
  )
}

// ── Main component ──────────────────────────────────────────
export default function DocumentUploadStep({ onNext, onBack }: DocumentUploadStepProps) {
  const { setDocuments } = useOnboarding()
  const [slots, setSlots] = useState<Record<string, UploadedFile | null>>({
    business_license: null,
    tax_id:           null,
    owner_id_front:   null,
    owner_id_back:    null,
  })

  const handleFile = (id: string, file: File) => {
    // Set uploading state
    setSlots(prev => ({
      ...prev,
      [id]: { name: file.name, size: file.size, status: 'uploading', progress: 0 },
    }))
    simulateUpload(
      (p) => setSlots(prev => prev[id] ? { ...prev, [id]: { ...prev[id]!, progress: p } } : prev),
      ()  => setSlots(prev => prev[id] ? { ...prev, [id]: { ...prev[id]!, status: 'done', progress: 100 } } : prev)
    )
  }

  const handleRemove = (id: string) => {
    setSlots(prev => ({ ...prev, [id]: null }))
  }

  const businessLicense = slots['business_license']
  const taxId           = slots['tax_id']
  const ownerFront      = slots['owner_id_front']
  const ownerBack       = slots['owner_id_back']

  // Status badges
  const licenseStatus = businessLicense?.status === 'done' ? 'uploaded' : businessLicense ? 'uploading' : null
  const taxStatus     = taxId?.status === 'done'           ? 'uploaded' : taxId           ? 'uploading' : 'missing'

  // Can continue when required docs are done
  const canContinue =
    businessLicense?.status === 'done' &&
    taxId?.status           === 'done' &&
    ownerFront?.status      === 'done' &&
    ownerBack?.status       === 'done'

  const handleContinue = () => {
    setDocuments({
      businessLicense: businessLicense ? { name: businessLicense.name, size: businessLicense.size } : null,
      taxId:           taxId           ? { name: taxId.name,           size: taxId.size }           : null,
      ownerIdFront:    ownerFront      ? { name: ownerFront.name,      size: ownerFront.size }      : null,
      ownerIdBack:     ownerBack       ? { name: ownerBack.name,       size: ownerBack.size }       : null,
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1c30]">Document Verification</h1>
        <p className="text-slate-500 text-sm mt-1">
          To comply with financial regulations (KYC), please upload clear copies of your business and personal identification.
        </p>
      </div>

      {/* Requirements banner */}
      <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-[#0b1c30]">Verification Requirements</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Please ensure all documents are in PDF, JPEG, or PNG format. Maximum file size per document is 10MB. Files must be clear and legible.
          </p>
        </div>
      </div>

      {/* ── Row 1: Business License + Tax ID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Business License */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#0b1c30] text-base">Business License</h3>
                <p className="text-xs text-slate-400 mt-0.5">Proof of legal business registration and operation authority.</p>
              </div>
            </div>
            {licenseStatus === 'uploaded' && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                UPLOADED
              </span>
            )}
          </div>
          <UploadZone
            slotId="business_license"
            file={businessLicense}
            onFile={handleFile}
            onRemove={handleRemove}
          />
        </div>

        {/* Tax Identification */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#0b1c30] text-base">Tax Identification</h3>
                <p className="text-xs text-slate-400 mt-0.5">W-9 or local tax registration certificate for fiscal reporting.</p>
              </div>
            </div>
            {taxStatus === 'uploaded' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                UPLOADED
              </span>
            ) : taxStatus === 'missing' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-1 rounded-full flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                MISSING
              </span>
            ) : null}
          </div>
          <UploadZone
            slotId="tax_id"
            file={taxId}
            onFile={handleFile}
            onRemove={handleRemove}
          />
        </div>
      </div>

      {/* ── Row 2: Owner's Government ID (full width) ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <circle cx="8" cy="12" r="2" />
                <path d="M14 9h4M14 12h4M14 15h2" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[#0b1c30] text-base">Owner's Government ID</h3>
              <p className="text-xs text-slate-400 mt-0.5">Passport, Driver's License, or National ID card (Front &amp; Back).</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full flex-shrink-0">
            REQUIRED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UploadZone
            slotId="owner_id_front"
            label="Front of ID"
            file={ownerFront}
            onFile={handleFile}
            onRemove={handleRemove}
          />
          <UploadZone
            slotId="owner_id_back"
            label="Back of ID"
            file={ownerBack}
            onFile={handleFile}
            onRemove={handleRemove}
          />
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex items-center justify-between pt-2">
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

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-sm text-sm
              ${canContinue
                ? 'bg-[#f97316] hover:bg-[#ea6c0a] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            Continue
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
