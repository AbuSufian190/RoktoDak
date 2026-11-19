import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errMsg } from '../services/api'
import { BLOOD_GROUPS } from '../data/bd'
import LocationSelect from '../components/LocationSelect'
import RequestCard from '../components/RequestCard'
import Pager from '../components/Pager'
import { Empty, ErrorBox, Skeletons } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

export default function Requests() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [bg, setBg] = useState('')
  const [urgency, setUrgency] = useState('')
  const [loc, setLoc] = useState({ division: '', district: '' })
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setData(null); setError('')
    api.get('/api/requests', { params: { bloodGroup: bg || undefined, district: loc.district || undefined, urgency: urgency || undefined, page } })
      .then((r) => setData(r.data)).catch((e) => setError(errMsg(e)))
  }, [bg, urgency, loc.district, page])

  useEffect(load, [load])
  const change = (fn) => (v) => { setPage(0); fn(v) }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{t('req.title')}</h1>
        {(!user || user.role !== 'ADMIN') && <Link to="/requests/new" className="btn-primary">{t('req.new')}</Link>}
      </div>

      <div className="card mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="bg">{t('f.bloodGroup')}</label>
          <select id="bg" className="input" value={bg} onChange={(e) => change(setBg)(e.target.value)}>
            <option value="">{t('c.all')}</option>
            {BLOOD_GROUPS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <LocationSelect allowAll value={loc} onChange={change(setLoc)} />
        <div>
          <label className="label" htmlFor="urg">{t('c.urgency')}</label>
          <select id="urg" className="input" value={urgency} onChange={(e) => change(setUrgency)(e.target.value)}>
            <option value="">{t('c.all')}</option>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((u) => <option key={u} value={u}>{t(`enums.${u}`)}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5">
        {error ? <ErrorBox message={error} onRetry={load} /> : data === null ? <Skeletons n={6} /> : data.items.length === 0
          ? <Empty text={t('req.none')} />
          : <div className="grid gap-3 md:grid-cols-2">{data.items.map((r) => <RequestCard key={r.id} r={r} />)}</div>}
        {data && <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </div>
    </div>
  )
}
