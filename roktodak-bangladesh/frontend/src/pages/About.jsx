import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Disclaimer from '../components/Disclaimer'

export default function About() {
  const { t } = useTranslation()
  const { hash } = useLocation()
  useEffect(() => { if (hash) document.querySelector(hash)?.scrollIntoView() }, [hash])
  const sec = (id, title, body) => (
    <section id={id} className="mt-8"><h2 className="text-xl font-bold">{t(title)}</h2><p className="mt-2 max-w-prose text-gray-700">{t(body)}</p></section>
  )
  return (
    <div>
      <h1 className="text-3xl font-bold">{t('legal.aboutTitle')}</h1>
      <p className="mt-3 max-w-prose text-gray-700">{t('legal.about')}</p>
      <div className="mt-6 max-w-prose"><Disclaimer /></div>
      {sec('privacy', 'legal.privacyTitle', 'legal.privacy')}
      {sec('terms', 'legal.termsTitle', 'legal.terms')}
    </div>
  )
}
