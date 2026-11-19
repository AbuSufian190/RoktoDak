import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import i18n from '../i18n'
import api from '../services/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const apply = useCallback((u) => {
    setUser(u)
    if (u?.language) i18n.changeLanguage(u.language)
  }, [])

  useEffect(() => {
    const expire = () => setUser(null)
    window.addEventListener('auth:expired', expire)
    if (sessionStorage.getItem('token')) {
      api.get('/api/me').then((r) => apply(r.data)).catch(() => sessionStorage.removeItem('token')).finally(() => setReady(true))
    } else setReady(true)
    return () => window.removeEventListener('auth:expired', expire)
  }, [apply])

  const authenticate = async (path, body) => {
    const { data } = await api.post(path, body)
    sessionStorage.setItem('token', data.token)
    apply(data.user)
    return data.user
  }

  const login = (body) => authenticate('/api/auth/login', body)
  const register = (body) => authenticate('/api/auth/register', body)
  const logout = () => { sessionStorage.removeItem('token'); setUser(null) }

  const setLanguage = async (lng) => {
    await i18n.changeLanguage(lng)
    if (user) api.put('/api/me/language', { language: lng }).catch(() => {})
  }

  return <AuthContext.Provider value={{ user, ready, login, register, logout, setLanguage }}>{children}</AuthContext.Provider>
}
