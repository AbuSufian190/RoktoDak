import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import api, { errMsg } from '../../services/api'
import { BLOOD_GROUPS, bloodLabel } from '../../data/bd'
import LocationSelect from '../../components/LocationSelect'
import RequestCard from '../../components/RequestCard'
import Disclaimer from '../../components/Disclaimer'
import Spinner, { ErrorBox } from '../../components/Spinner'
import { BadgeCheck } from 'lucide-react'

export default function DonorSection() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState(null)
  const [matching, setMatching] = useState(null)
  const [loc, setLoc] = useState({ division: '', district: '', upazila: '' })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([api.get('/api/donors/me'), api.get('/api/donors/me/matching-requests')])
      setProfile(p.data); setMatching(m.data)
      setLoc({ division: p.data.division, district: p.data.district, upazila: p.data.upazila || '' })
      reset({ ...p.data, dateOfBirth: p.data.dateOfBirth || '', lastDonationDate: p.data.lastDonationDate || '' })
    } catch (e) { setError(errMsg(e)) }
  }, [reset])
  useEffect(() => { load() }, [load])

  const save = async (v) => {
    setError(''); setSaved(false)
    try {
      const { data } = await api.put('/api/donors/me', { ...v, ...loc, dateOfBirth: v.dateOfBirth || null, lastDonationDate: v.lastDonationDate || null })
      setProfile(data); setSaved(true)
    } catch (e) { setError(errMsg(e)) }
  }

  const respond = (id, accept) => api.post(`/api/requests/${id}/respond`, { accept }).then(load).catch((e) => setError(errMsg(e)))

  if (!profile && !error) return <Spinner />
  return (
    <>
      {error && <ErrorBox message={error} onRetry={load} />}
      {profile && (
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            {t('dash.profile')} · {bloodLabel(profile.bloodGroup)}
            {profile.verified && <span className="flex items-center gap-1 text-sm font-medium text-brand"><BadgeCheck size={16} />{t('c.verified')}</span>}
          </h2>
          <form onSubmit={handleSubmit(save)} className="card mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="bg">{t('f.bloodGroup')}</label>
              <select id="bg" className="input" {...register('bloodGroup')}>{BLOOD_GROUPS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select>
            </div>
            <div>
              <label className="label" htmlFor="dob">{t('f.dob')}</label>
              <input id="dob" type="date" className="input" {...register('dateOfBirth')} />
            </div>
            <LocationSelect required withUpazila value={loc} onChange={setLoc} />
            <div>
              <label className="label" htmlFor="last">{t('f.last')}</label>
              <input id="last" type="date" className="input" {...register('lastDonationDate')} />
            </div>
            <div className="space-y-2 text-sm sm:col-span-2">
              <label className="flex gap-2"><input type="checkbox" {...register('available')} />{t('f.available')}</label>
              <label className="flex gap-2"><input type="checkbox" {...register('consentSearch')} />{t('f.consent')}</label>
              <label className="flex gap-2"><input type="checkbox" {...register('shareLastDonation')} />{t('f.share')}</label>
            </div>
            <div className="sm:col-span-2"><Disclaimer /></div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <button className="btn-primary">{t('c.save')}</button>
              {saved && <span role="status" className="text-sm text-green-700">{t('c.saved')}</span>}
            </div>
          </form>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold">{t('dash.matching')}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {matching === null ? null : matching.length === 0 ? <p className="text-sm text-gray-600">{t('dash.noMatching')}</p> : matching.map((r) => (
            <RequestCard key={r.id} r={r}>
              {r.myResponse ? <span className="text-sm font-medium">{r.myResponse === 'ACCEPTED' ? t('req.accepted') : t('req.declined')}</span> : null}
              {r.myResponse !== 'ACCEPTED' && <button className="btn-primary !py-1.5" onClick={() => respond(r.id, true)}>{t('req.accept')}</button>}
              {r.myResponse !== 'DECLINED' && <button className="btn-outline !py-1.5" onClick={() => respond(r.id, false)}>{t('req.decline')}</button>}
            </RequestCard>
          ))}
        </div>
      </section>
    </>
  )
}
