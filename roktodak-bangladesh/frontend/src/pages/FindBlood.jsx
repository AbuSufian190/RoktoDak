import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errMsg } from '../services/api'
import { BLOOD_GROUPS } from '../data/bd'
import LocationSelect from '../components/LocationSelect'
import DonorCard from '../components/DonorCard'
import Pager from '../components/Pager'
import { Empty, ErrorBox, Skeletons } from '../components/Spinner'

export default function FindBlood() {
  const { t } = useTranslation()
  const [sp] = useSearchParams()
  const [bg, setBg] = useState(sp.get('bg') || '')
  const [loc, setLoc] = useState({ division: '', district: '', upazila: '' })
  const [onlyAvail, setOnlyAvail] = useState(true)
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setData(null); setError('')
    api.get('/api/donors/search', { params: { bloodGroup: bg || undefined, division: loc.division || undefined, district: loc.district || undefined, availableOnly: onlyAvail, page } })
      .then((r) => setData(r.data)).catch((e) => setError(errMsg(e)))
  }, [bg, loc.division, loc.district, onlyAvail, page])

  useEffect(load, [load])
  const change = (fn) => (v) => { setPage(0); fn(v) }

  return (
    <div>
      <h1 className="text-3xl font-bold">{t('find.title')}</h1>
      <div className="card mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="bg">{t('f.bloodGroup')}</label>
          <select id="bg" className="input" value={bg} onChange={(e) => change(setBg)(e.target.value)}>
            <option value="">{t('c.all')}</option>
            {BLOOD_GROUPS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <LocationSelect allowAll value={loc} onChange={change(setLoc)} />
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" checked={onlyAvail} onChange={(e) => change(setOnlyAvail)(e.target.checked)} /> {t('find.onlyAvail')}
        </label>
      </div>

      <p className="mt-4 text-sm text-gray-600">{t('find.note')}</p>

      <div className="mt-5">
        {error ? <ErrorBox message={error} onRetry={load} /> : data === null ? <Skeletons n={6} /> : data.items.length === 0
          ? <Empty text={t('find.none')}><Link to="/requests/new" className="btn-primary mt-4">{t('find.post')}</Link></Empty>
          : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((d) => <DonorCard key={d.id} d={d} />)}</div>}
        {data && <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </div>
    </div>
  )
}
