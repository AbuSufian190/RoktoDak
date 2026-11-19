import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, logout, setLanguage } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const nav = useNavigate()

  useEffect(() => {
    if (!user) { setUnread(0); return }
    api.get('/api/notifications/unread-count').then((r) => setUnread(r.data.unread)).catch(() => {})
  }, [user])

  const link = ({ isActive }) => `px-3 py-2 text-sm font-medium rounded-lg ${isActive ? 'text-brand bg-brand-soft' : 'text-ink hover:bg-mist'}`
  const items = [
    ['/', t('nav.home')], ['/find', t('nav.find')], ['/register?role=DONOR', t('nav.donor'), true],
    ['/requests', t('nav.requests')], ['/about', t('nav.about')],
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        <Link to="/" aria-label="RoktoDak home"><Logo /></Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {items.map(([to, label, plain]) => plain
            ? <Link key={to} to={to} className="px-3 py-2 text-sm font-medium text-ink hover:bg-mist rounded-lg">{label}</Link>
            : <NavLink key={to} to={to} end={to === '/'} className={link}>{label}</NavLink>)}
        </nav>

        <div className="flex items-center gap-2">
          <button className="btn-outline !px-3 !py-1.5" onClick={() => setLanguage(i18n.language === 'bn' ? 'en' : 'bn')}>{t('c.language')}</button>
          {user ? (
            <>
              <Link to="/dashboard" className="relative rounded-lg p-2 hover:bg-mist" aria-label={t('nav.notifications')}>
                <Bell size={20} />
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">{unread}</span>}
              </Link>
              <Link to="/dashboard" className="btn-outline hidden !py-1.5 sm:inline-flex">{user.role === 'ADMIN' ? t('nav.admin') : t('nav.dashboard')}</Link>
              <button className="btn-primary hidden !py-1.5 sm:inline-flex" onClick={() => { logout(); nav('/') }}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline hidden !py-1.5 sm:inline-flex">{t('nav.login')}</Link>
              <Link to="/register" className="btn-primary hidden !py-1.5 sm:inline-flex">{t('nav.register')}</Link>
            </>
          )}
          <button className="rounded-lg p-2 hover:bg-mist lg:hidden" onClick={() => setOpen(!open)} aria-label={t('nav.menu')} aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 lg:hidden" onClick={() => setOpen(false)}>
          <div className="flex flex-col gap-1">
            {items.map(([to, label]) => <Link key={to} to={to} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-mist">{label}</Link>)}
            {user ? (
              <>
                <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-mist">{t('nav.dashboard')}</Link>
                <button className="rounded-lg px-3 py-2 text-left text-sm font-medium text-brand hover:bg-brand-soft" onClick={() => { logout(); nav('/') }}>{t('nav.logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-mist">{t('nav.login')}</Link>
                <Link to="/register" className="rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-brand-soft">{t('nav.register')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
