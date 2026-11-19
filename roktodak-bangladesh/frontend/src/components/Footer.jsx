import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-16 border-t border-gray-200 bg-mist">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo size={28} />
          <p className="mt-2 max-w-sm text-sm text-gray-600">{t('brand.tagline')}</p>
        </div>
        <nav className="flex gap-4 text-sm text-gray-600" aria-label="Footer">
          <Link to="/about" className="hover:text-brand">{t('legal.aboutTitle')}</Link>
          <Link to="/about#privacy" className="hover:text-brand">{t('legal.privacyTitle')}</Link>
          <Link to="/about#terms" className="hover:text-brand">{t('legal.termsTitle')}</Link>
        </nav>
      </div>
    </footer>
  )
}
