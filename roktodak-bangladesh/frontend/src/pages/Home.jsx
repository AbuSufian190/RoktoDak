import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { BLOOD_GROUPS } from '../data/bd'
import RequestCard from '../components/RequestCard'
import Disclaimer from '../components/Disclaimer'
import { Skeletons } from '../components/Spinner'

export default function Home() {
  const { t } = useTranslation()
  const [recent, setRecent] = useState(null)

  useEffect(() => {
    api.get('/api/requests', { params: { size: 3 } }).then((r) => setRecent(r.data.items)).catch(() => setRecent([]))
  }, [])

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <h1 className="font-bn text-4xl font-bold leading-tight text-ink sm:text-5xl">{t('hero.title')}</h1>
          <p className="mt-4 max-w-xl text-lg text-gray-600">{t('hero.sub')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/find" className="btn-primary !px-6 !py-3 text-base">{t('nav.find')}</Link>
            <Link to="/register?role=DONOR" className="btn-outline !px-6 !py-3 text-base">{t('nav.donor')}</Link>
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="mb-3 text-sm font-medium text-gray-600">{t('home.groups')}</p>
          <div className="grid grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((b) => (
              <Link key={b.value} to={`/find?bg=${b.value}`}
                className="flex aspect-square items-center justify-center rounded-2xl border border-red-200 bg-brand-soft text-xl font-bold text-brand hover:bg-brand hover:text-white">
                {b.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Disclaimer />

      <section>
        <h2 className="text-2xl font-bold">{t('home.how')}</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="card">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>
              <h3 className="mt-3 font-semibold">{t(`home.s${n}t`)}</h3>
              <p className="mt-1 text-sm text-gray-600">{t(`home.s${n}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">{t('home.recent')}</h2>
          <Link to="/requests" className="text-sm font-medium text-brand">{t('home.all')}</Link>
        </div>
        <div className="mt-4">
          {recent === null ? <Skeletons /> : recent.length === 0
            ? <p className="text-sm text-gray-600">{t('home.none')}</p>
            : <div className="grid gap-3 md:grid-cols-3">{recent.map((r) => <RequestCard key={r.id} r={r} />)}</div>}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">{t('home.faq')}</h2>
        <div className="mt-4 max-w-3xl divide-y divide-gray-200 rounded-xl border border-gray-200">
          {[1, 2, 3, 4].map((n) => (
            <details key={n} className="group p-4">
              <summary className="cursor-pointer font-medium">{t(`home.q${n}`)}</summary>
              <p className="mt-2 text-sm text-gray-600">{t(`home.a${n}`)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
