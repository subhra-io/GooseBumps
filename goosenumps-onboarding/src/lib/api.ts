const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('gns_token')
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data as T
}

export const api = {
  // Auth
  sendOTP:     (email: string, name: string) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email, name }) }),
  verifyOTP:   (email: string, otp: string) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resendOTP:   (email: string, name: string) =>
    request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email, name }) }),
  setPassword: (token: string, password: string) =>
    request('/auth/set-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  login:       (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; role: string } }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  me: () => request('/auth/me'),

  // Merchant
  onboard: (data: object) =>
    request<{ merchant_id: string; status: string }>(
      '/merchant/onboard', { method: 'POST', body: JSON.stringify(data) }
    ),
  uploadDocument: (merchantId: string, type: string, file: File) => {
    const form = new FormData()
    form.append('type', type)
    form.append('file', file)
    const token = localStorage.getItem('gns_token')
    return fetch(`${BASE}/merchant/${merchantId}/documents`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(r => r.json())
  },
  getMyProfile: () => request('/merchant/me'),
  getStatus:    () => request('/merchant/status'),
  getOrders:    (status?: string) =>
    request(`/merchant/orders${status ? '?status=' + status : ''}`),
  updateOrderStatus: (id: string, status: string) =>
    request(`/merchant/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getMenu:          () => request('/merchant/menu'),
  createMenuItem:   (item: object) =>
    request('/merchant/menu', { method: 'POST', body: JSON.stringify(item) }),

  // Admin
  adminDashboard:   () => request('/admin/dashboard'),
  adminMerchants:   (params?: string) => request(`/admin/merchants${params ? '?' + params : ''}`),
  adminGetMerchant: (id: string) => request(`/admin/merchants/${id}`),
  adminApprove:     (id: string) =>
    request(`/admin/merchants/${id}/approve`, { method: 'POST' }),
  adminReject:      (id: string, reason: string) =>
    request(`/admin/merchants/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  adminPending:     () => request('/admin/pending'),
  adminAnalytics:   () => request('/admin/analytics'),
  adminAuditLogs:   (merchantId?: string) =>
    request(`/admin/audit-logs${merchantId ? '?merchant_id=' + merchantId : ''}`),
}
