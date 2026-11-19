import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' })

// Token lives in sessionStorage: cleared when the tab closes. See README for the cookie trade-off.
api.interceptors.request.use((cfg) => {
  const t = sessionStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || ''
    if (err.response?.status === 401 && !url.includes('/api/auth/')) {
      sessionStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(err)
  },
)

export const errMsg = (e) => e?.response?.data?.error || 'Could not reach the server. Please try again.'
export const fieldErrors = (e) => e?.response?.data?.fields || {}
export default api
