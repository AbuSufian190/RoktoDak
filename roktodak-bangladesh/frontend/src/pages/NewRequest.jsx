import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import api, { errMsg, fieldErrors } from '../services/api'
import { BLOOD_GROUPS } from '../data/bd'
import LocationSelect from '../components/LocationSelect'
import Disclaimer from '../components/Disclaimer'
import { ErrorBox } from '../components/Spinner'

const PHONE = /^(\+8801|01)[3-9]\d{8}$/

export default function NewRequest() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [loc, setLoc] = useState({ division: '', district: '', upazila: '' })
  const [error, setError] = useState('')
  const [server, setServer] = useState({})
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { units: 1, urgency: 'HIGH' } })

  const onSubmit = async (v) => {
    setError(''); setServer({})
    try {
      await api.post('/api/requests', { ...v, units: Number(v.units), ...loc })
      nav('/dashboard', { state: { notice: t('req.created') } })
    } catch (e) { setError(errMsg(e)); setServer(fieldErrors(e)) }
  }

  const err = (n) => (errors[n]?.message || server[n]) && <p className="field-error">{errors[n]?.message || server[n]}</p>
  const req = (label) => ({ required: label })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{t('req.new')}</h1>
      <div className="mt-4"><Disclaimer /></div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
        {error && <div className="sm:col-span-2"><ErrorBox message={error} /></div>}
        <div>
          <label className="label" htmlFor="patientName">{t('f.patient')}</label>
          <input id="patientName" className="input" {...register('patientName', req(t('f.patient')))} />{err('patientName')}
        </div>
        <div>
          <label className="label" htmlFor="bloodGroup">{t('f.bloodGroup')}</label>
          <select id="bloodGroup" className="input" {...register('bloodGroup', req(t('f.bloodGroup')))}>
            <option value="">{t('f.pick')}</option>
            {BLOOD_GROUPS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>{err('bloodGroup')}
        </div>
        <div>
          <label className="label" htmlFor="units">{t('f.units')}</label>
          <input id="units" type="number" min="1" max="20" className="input" {...register('units', { required: true, min: 1, max: 20 })} />
        </div>
        <div>
          <label className="label" htmlFor="urgency">{t('c.urgency')}</label>
          <select id="urgency" className="input" {...register('urgency')}>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((u) => <option key={u} value={u}>{t(`enums.${u}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="hospitalName">{t('f.hospitalName')}</label>
          <input id="hospitalName" className="input" {...register('hospitalName', req(t('f.hospitalName')))} />{err('hospitalName')}
        </div>
        <div>
          <label className="label" htmlFor="hospitalAddress">{t('f.hospitalAddress')}</label>
          <input id="hospitalAddress" className="input" {...register('hospitalAddress', req(t('f.hospitalAddress')))} />{err('hospitalAddress')}
        </div>
        <LocationSelect required withUpazila value={loc} onChange={setLoc} />
        <div>
          <label className="label" htmlFor="requiredAt">{t('f.requiredAt')}</label>
          <input id="requiredAt" type="datetime-local" className="input" {...register('requiredAt', req(t('f.requiredAt')))} />{err('requiredAt')}
        </div>
        <div>
          <label className="label" htmlFor="contactPhone">{t('f.contact')}</label>
          <input id="contactPhone" inputMode="tel" className="input" {...register('contactPhone', { required: t('f.contact'), pattern: { value: PHONE, message: t('f.contact') } })} />{err('contactPhone')}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">{t('f.notes')}</label>
          <textarea id="notes" rows={3} maxLength={1000} className="input" {...register('notes')} />
        </div>
        <button className="btn-primary sm:col-span-2" disabled={isSubmitting}>{t('req.new')}</button>
      </form>
    </div>
  )
}
