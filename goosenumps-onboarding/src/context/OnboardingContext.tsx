import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface BusinessProfile {
  businessName:  string
  legalName:     string
  category:      string
  email:         string
  phone:         string
  address:       string
  city:          string
  zip:           string
  lat:           number
  lng:           number
  mapAddress:    string
  logoFile:      File | null
  logoPreview:   string
}

export interface DocumentFile {
  name: string
  size: number
}

export interface Documents {
  businessLicense: DocumentFile | null
  taxId:           DocumentFile | null
  ownerIdFront:    DocumentFile | null
  ownerIdBack:     DocumentFile | null
}

export interface Banking {
  bankName:      string
  accountHolder: string
  accountNumber: string
  routingCode:   string
  currency:      string
}

interface OnboardingData {
  business:  BusinessProfile
  documents: Documents
  banking:   Banking
}

interface OnboardingContextType {
  data: OnboardingData
  setBusiness:  (b: Partial<BusinessProfile>) => void
  setDocuments: (d: Partial<Documents>)       => void
  setBanking:   (b: Partial<Banking>)         => void
}

const defaultBusiness: BusinessProfile = {
  businessName: '', legalName: '', category: '',
  email: '', phone: '', address: '', city: '', zip: '',
  lat: 21.8167, lng: 83.9167, mapAddress: 'Brajrajnagar, Odisha, India',
  logoFile: null, logoPreview: '',
}

const defaultDocuments: Documents = {
  businessLicense: null, taxId: null,
  ownerIdFront: null, ownerIdBack: null,
}

const defaultBanking: Banking = {
  bankName: '', accountHolder: '', accountNumber: '',
  routingCode: '', currency: 'USD - US Dollar',
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    business:  defaultBusiness,
    documents: defaultDocuments,
    banking:   defaultBanking,
  })

  const setBusiness  = (b: Partial<BusinessProfile>) =>
    setData(prev => ({ ...prev, business:  { ...prev.business,  ...b } }))
  const setDocuments = (d: Partial<Documents>) =>
    setData(prev => ({ ...prev, documents: { ...prev.documents, ...d } }))
  const setBanking   = (b: Partial<Banking>) =>
    setData(prev => ({ ...prev, banking:   { ...prev.banking,   ...b } }))

  return (
    <OnboardingContext.Provider value={{ data, setBusiness, setDocuments, setBanking }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider')
  return ctx
}
